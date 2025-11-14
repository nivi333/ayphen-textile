import { databaseManager, globalPrisma } from '../database/connection';
import { logger } from '../utils/logger';

interface LocationData {
  name: string;
  email?: string;
  phone?: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  locationType?: string;
  isDefault?: boolean;
  isHeadquarters?: boolean;
}

interface LocationWithDetails {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  locationType: string;
  isDefault: boolean;
  isHeadquarters: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class LocationService {
  /**
   * Get all locations for a user's active company
   */
  async getUserLocations(userId: string): Promise<LocationWithDetails[]> {
    try {
      // Get user's active company
      const userTenant = await globalPrisma.userTenant.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          tenant: true
        }
      });

      if (!userTenant) {
        throw new Error('User not associated with any active company');
      }

      // Get locations from tenant schema
      const pool = databaseManager.getTenantPool(userTenant.tenantId);
      const schemaName = databaseManager.getSchemaName(userTenant.tenantId);

      const query = `
        SELECT
          id, name, email, phone, country, address_line_1 as "addressLine1",
          address_line_2 as "addressLine2", city, state, pincode,
          location_type as "locationType", is_default as "isDefault",
          is_headquarters as "isHeadquarters", is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM ${schemaName}.tenant_locations
        WHERE is_active = true
        ORDER BY is_default DESC, is_headquarters DESC, created_at DESC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching user locations:', error);
      throw error;
    }
  }

  /**
   * Create a new location for a user's active company
   */
  async createLocation(userId: string, locationData: LocationData): Promise<LocationWithDetails> {
    try {
      // Get user's active company
      const userTenant = await globalPrisma.userTenant.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          tenant: true
        }
      });

      if (!userTenant) {
        throw new Error('User not associated with any active company');
      }

      // Insert location into tenant schema
      const pool = databaseManager.getTenantPool(userTenant.tenantId);
      const schemaName = databaseManager.getSchemaName(userTenant.tenantId);

      const query = `
        INSERT INTO ${schemaName}.tenant_locations
          (tenant_id, name, email, phone, country, address_line_1, address_line_2, city, state, pincode, is_default, is_headquarters, location_type, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
        RETURNING
          id, name, email, phone, country, address_line_1 as "addressLine1",
          address_line_2 as "addressLine2", city, state, pincode,
          location_type as "locationType", is_default as "isDefault",
          is_headquarters as "isHeadquarters", is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
      `;

      const values = [
        userTenant.tenantId,
        locationData.name,
        locationData.email || null,
        locationData.phone || null,
        locationData.country,
        locationData.addressLine1,
        locationData.addressLine2 || null,
        locationData.city,
        locationData.state,
        locationData.pincode,
        locationData.isDefault || false,
        locationData.isHeadquarters || false,
        locationData.locationType || 'BRANCH'
      ];

      const result = await pool.query(query, values);

      logger.info(`Location created: ${locationData.name} for tenant ${userTenant.tenantId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * Update a location
   */
  async updateLocation(userId: string, locationId: string, updateData: Partial<LocationData>): Promise<LocationWithDetails> {
    try {
      // Get user's active company
      const userTenant = await globalPrisma.userTenant.findFirst({
        where: {
          userId,
          isActive: true
        }
      });

      if (!userTenant) {
        throw new Error('User not associated with any active company');
      }

      // Update location in tenant schema
      const pool = databaseManager.getTenantPool(userTenant.tenantId);
      const schemaName = databaseManager.getSchemaName(userTenant.tenantId);

      const setClause = [];
      const values = [];
      let paramIndex = 1;

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          const columnName = key === 'addressLine1' ? 'address_line_1' :
                           key === 'addressLine2' ? 'address_line_2' :
                           key === 'locationType' ? 'location_type' :
                           key === 'isDefault' ? 'is_default' :
                           key === 'isHeadquarters' ? 'is_headquarters' : key;
          setClause.push(`${columnName} = $${paramIndex++}`);
          values.push(value);
        }
      });

      if (setClause.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE ${schemaName}.tenant_locations
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
        RETURNING
          id, name, email, phone, country, address_line_1 as "addressLine1",
          address_line_2 as "addressLine2", city, state, pincode,
          location_type as "locationType", is_default as "isDefault",
          is_headquarters as "isHeadquarters", is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
      `;

      values.push(locationId, userTenant.tenantId);
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Location not found or access denied');
      }

      logger.info(`Location updated: ${locationId} for tenant ${userTenant.tenantId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating location:', error);
      throw error;
    }
  }

  /**
   * Delete (deactivate) a location
   */
  async deleteLocation(userId: string, locationId: string): Promise<void> {
    try {
      // Get user's active company
      const userTenant = await globalPrisma.userTenant.findFirst({
        where: {
          userId,
          isActive: true
        }
      });

      if (!userTenant) {
        throw new Error('User not associated with any active company');
      }

      // Soft delete location in tenant schema
      const pool = databaseManager.getTenantPool(userTenant.tenantId);
      const schemaName = databaseManager.getSchemaName(userTenant.tenantId);

      const query = `
        UPDATE ${schemaName}.tenant_locations
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `;

      const result = await pool.query(query, [locationId, userTenant.tenantId]);

      if (result.rowCount === 0) {
        throw new Error('Location not found or access denied');
      }

      logger.info(`Location deleted: ${locationId} for tenant ${userTenant.tenantId}`);
    } catch (error) {
      logger.error('Error deleting location:', error);
      throw error;
    }
  }
}

export const locationService = new LocationService();
