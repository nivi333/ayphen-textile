import { databaseManager, globalPrisma } from '../database/connection';
import { logger } from '../utils/logger';

interface CreateCompanyData {
  name: string;
  slug?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  defaultLocation?: string;
  defaultLocationName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  establishedDate?: string;
  businessType?: string;
  certifications?: string;
  contactInfo?: string;
  website?: string;
  taxId?: string;
  isActive?: boolean;
}

interface CompanyWithRole {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  role: string;
  joinedAt: Date;
  isActive: boolean;
}

export class CompanyService {
  /**
   * Create a new company and assign the user as OWNER
   */
  async createCompany(userId: string, companyData: CreateCompanyData): Promise<any> {
    try {
      // Generate slug if not provided
      let baseSlug = companyData.slug && companyData.slug.trim().length > 0
        ? companyData.slug.trim().toLowerCase()
        : companyData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

      // Ensure uniqueness of slug
      let uniqueSlug = baseSlug;
      let counter = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const exists = await globalPrisma.tenant.findUnique({ where: { slug: uniqueSlug } });
        if (!exists) break;
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const defaultLocationName = (companyData.defaultLocation || companyData.defaultLocationName)?.trim() || 'Head Office';
      const country = companyData.country?.trim() || 'UNKNOWN';
      const addressLine1 = companyData.address1?.trim() || '';
      const addressLine2 = companyData.address2?.trim() || '';
      const city = companyData.city?.trim() || '';
      const state = companyData.state?.trim() || '';
      const pincode = companyData.pincode?.trim() || '';

      const contactInfo = companyData.contactInfo?.trim();
      const contactEmail = contactInfo && contactInfo.includes('@') ? contactInfo : null;
      const contactPhone = contactInfo && !contactInfo.includes('@') ? contactInfo : null;

      // Create tenant and user-tenant relationship in a transaction
      const tenant = await globalPrisma.$transaction(async (tx) => {
        const createdTenant = await tx.tenant.create({
          data: {
            name: companyData.name,
            slug: uniqueSlug,
            industry: companyData.industry,
            description: companyData.description,
            logoUrl: companyData.logoUrl,
            country: companyData.country,
            defaultLocation: defaultLocationName,
            addressLine1: addressLine1 || null,
            addressLine2: addressLine2 || null,
            city: city || null,
            state: state || null,
            pincode: pincode || null,
            establishedDate: companyData.establishedDate ? new Date(companyData.establishedDate) : null,
            businessType: companyData.businessType,
            certifications: companyData.certifications,
            website: companyData.website,
            taxId: companyData.taxId,
            contactInfo: contactInfo || null,
            isActive: companyData.isActive !== undefined ? companyData.isActive : true,
          }
        });

        await tx.userTenant.create({
          data: {
            userId,
            tenantId: createdTenant.id,
            role: 'OWNER'
          }
        });

        return createdTenant;
      });

      // Create tenant schema/tables
      await databaseManager.createTenantSchema(tenant.id);

      // Insert default Head Office location in tenant schema (only location name, address fields optional)
      const pool = databaseManager.getTenantPool(tenant.id);
      const schemaName = databaseManager.getSchemaName(tenant.id);
      await pool.query(
        `INSERT INTO ${schemaName}.tenant_locations 
          (tenant_id, name, email, phone, country, address_line_1, address_line_2, city, state, pincode, is_default, is_headquarters, location_type, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, TRUE, 'HEADQUARTERS', TRUE)` ,
        [
          tenant.id,
          defaultLocationName,
          contactEmail,
          contactPhone,
          country || null, // Optional
          addressLine1 || null, // Optional
          addressLine2 || null, // Optional
          city || null, // Optional
          state || null, // Optional
          pincode || null, // Optional
        ]
      );

      logger.info(`Company created: ${tenant.name} (${tenant.slug}) by user ${userId}`);
      return tenant;
    } catch (error) {
      logger.error('Error creating company:', error);
      throw error;
    }
  }

  /**
   * Get all companies for a user with their roles
   */
  async getUserCompanies(userId: string): Promise<CompanyWithRole[]> {
    
    try {
      const userTenants = await globalPrisma.userTenant.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          tenant: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return userTenants.map(ut => ({
        id: ut.tenant.id,
        name: ut.tenant.name,
        slug: ut.tenant.slug,
        industry: ut.tenant.industry,
        description: ut.tenant.description,
        logoUrl: ut.tenant.logoUrl,
        country: ut.tenant.country,
        role: ut.role,
        joinedAt: ut.createdAt,
        isActive: ut.tenant.isActive
      }));
    } catch (error) {
      logger.error('Error fetching user companies:', error);
      // Return empty array instead of throwing to handle new users gracefully
      return [];
    }
  }

  /**
   * Get company details by ID (with user access validation)
   */
  async getCompanyById(userId: string, tenantId: string): Promise<any> {
    
    try {
      // Verify user has access to this tenant
      const userTenant = await globalPrisma.userTenant.findFirst({
        where: {
          userId,
          tenantId,
          isActive: true
        },
        include: {
          tenant: true
        }
      });

      if (!userTenant) {
        throw new Error('Access denied to company');
      }

      // Return tenant data with address fields from tenant table
      return {
        ...userTenant.tenant,
        userRole: userTenant.role,
        joinedAt: userTenant.createdAt,
        // Map tenant table field names to frontend expected names
        address1: userTenant.tenant.addressLine1,
        address2: userTenant.tenant.addressLine2,
        // Ensure defaultLocation is included (already in tenant object, but being explicit)
        defaultLocation: userTenant.tenant.defaultLocation,
      };
    } catch (error) {
      logger.error('Error fetching company details:', error);
      throw error;
    }
  }

  /**
   * Switch company context for a user
   */
  async switchCompany(userId: string, tenantId: string): Promise<any> {
    
    try {
      // Verify user has access to this tenant
      const userTenant = await globalPrisma.userTenant.findFirst({
        where: {
          userId,
          tenantId,
          isActive: true
        },
        include: {
          tenant: true
        }
      });

      if (!userTenant) {
        throw new Error('Access denied to company');
      }

      logger.info(`User ${userId} switched to company ${tenantId}`);
      return {
        tenant: userTenant.tenant,
        role: userTenant.role
      };
    } catch (error) {
      logger.error('Error switching company:', error);
      throw error;
    }
  }

  /**
   * Invite user to company (OWNER/ADMIN only)
   */
  async inviteUser(inviterId: string, tenantId: string, email: string, role: string): Promise<any> {
    
    try {
      // Verify inviter has permission (OWNER or ADMIN)
      const inviterAccess = await globalPrisma.userTenant.findFirst({
        where: {
          userId: inviterId,
          tenantId,
          role: { in: ['OWNER', 'ADMIN'] },
          isActive: true
        }
      });

      if (!inviterAccess) {
        throw new Error('Insufficient permissions to invite users');
      }

      // Find user by email
      const user = await globalPrisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is already part of the company
      const existingAccess = await globalPrisma.userTenant.findFirst({
        where: {
          userId: user.id,
          tenantId
        }
      });

      if (existingAccess) {
        throw new Error('User is already part of this company');
      }

      // Create user-tenant relationship
      const userTenant = await globalPrisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId,
          role: role as any
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      logger.info(`User ${user.email} invited to company ${tenantId} with role ${role}`);
      return userTenant;
    } catch (error) {
      logger.error('Error inviting user:', error);
      throw error;
    }
  }

  /**
   * Update company details (OWNER/ADMIN only)
   */
  async updateCompany(userId: string, tenantId: string, updateData: Partial<CreateCompanyData>): Promise<any> {
    
    try {
      // Verify user has permission (OWNER or ADMIN)
      const userAccess = await globalPrisma.userTenant.findFirst({
        where: {
          userId,
          tenantId,
          role: { in: ['OWNER', 'ADMIN'] },
          isActive: true
        }
      });

      if (!userAccess) {
        throw new Error('Insufficient permissions to update company');
      }

      // If slug is being updated, check if it's available
      if (updateData.slug) {
        const existingTenant = await globalPrisma.tenant.findFirst({
          where: {
            slug: updateData.slug,
            id: { not: tenantId }
          }
        });

        if (existingTenant) {
          throw new Error('Company slug already exists');
        }
      }

      const prismaUpdateData: Record<string, unknown> = { ...updateData };

      if (typeof prismaUpdateData.establishedDate === 'string') {
        prismaUpdateData.establishedDate = new Date(prismaUpdateData.establishedDate);
      }

      if (typeof prismaUpdateData.contactInfo === 'string') {
        prismaUpdateData.contactInfo = prismaUpdateData.contactInfo.trim();
      }

      // Extract address and contact fields for location update
      const { address1, address2, city, state, pincode, contactInfo, ...tenantUpdateData } = prismaUpdateData;

      // Map frontend field names to Prisma field names for tenant table
      const tenantData = {
        ...tenantUpdateData,
        ...(address1 !== undefined && { addressLine1: address1 }),
        ...(address2 !== undefined && { addressLine2: address2 }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
      };

      const updatedTenant = await globalPrisma.tenant.update({
        where: { id: tenantId },
        data: tenantData
      });

      // Update location information if address or contact fields are provided
      if (address1 !== undefined || address2 !== undefined || city !== undefined || state !== undefined || pincode !== undefined || contactInfo !== undefined) {
        try {
          const pool = databaseManager.getTenantPool(tenantId);
          const schemaName = databaseManager.getSchemaName(tenantId);

          // Split contact info for location table (email/phone)
          let contactEmail = null;
          let contactPhone = null;
          if (contactInfo && typeof contactInfo === 'string') {
            contactEmail = contactInfo.includes('@') ? contactInfo : null;
            contactPhone = !contactInfo.includes('@') ? contactInfo : null;
          }

          const locationUpdateQuery = `
            UPDATE ${schemaName}.tenant_locations 
            SET 
              address_line_1 = COALESCE($1, address_line_1),
              address_line_2 = COALESCE($2, address_line_2),
              city = COALESCE($3, city),
              state = COALESCE($4, state),
              pincode = COALESCE($5, pincode),
              email = COALESCE($6, email),
              phone = COALESCE($7, phone),
              updated_at = NOW()
            WHERE is_default = true AND is_headquarters = true AND is_active = true
          `;

          await pool.query(locationUpdateQuery, [
            address1 || null,
            address2 || null,
            city || null,
            state || null,
            pincode || null,
            contactEmail,
            contactPhone
          ]);
        } catch (error) {
          logger.warn('Could not update location data:', error);
          // Don't fail the entire update if location update fails
        }
      }

      logger.info(`Company ${tenantId} updated by user ${userId}`);
      return updatedTenant;
    } catch (error) {
      logger.error('Error updating company:', error);
      throw error;
    }
  }

  /**
   * Soft delete (deactivate) company - OWNER only
   */
  async deleteCompany(userId: string, tenantId: string): Promise<void> {
    try {
      // Verify user has OWNER permission
      const userAccess = await globalPrisma.userTenant.findFirst({
        where: { userId, tenantId, role: 'OWNER', isActive: true },
      });
      if (!userAccess) {
        throw new Error('Insufficient permissions to delete company');
      }

      await globalPrisma.tenant.update({
        where: { id: tenantId },
        data: { isActive: false },
      });

      logger.info(`Company ${tenantId} deactivated by user ${userId}`);
    } catch (error) {
      logger.error('Error deleting company:', error);
      throw error;
    }
  }

  /**
   * Check if a company slug is available
   */
  async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      const normalizedSlug = slug.toLowerCase().trim();
      
      // Check if slug exists in database
      const existingCompany = await globalPrisma.tenant.findUnique({
        where: { slug: normalizedSlug }
      });

      return !existingCompany; // Return true if slug is available (doesn't exist)
    } catch (error) {
      logger.error('Error checking slug availability:', error);
      throw error;
    }
  }
}

export const companyService = new CompanyService();
