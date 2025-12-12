import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import auditService from './auditService';

const prisma = new PrismaClient();

class GdprService {
  /**
   * Export all data related to a user
   */
  async exportUserData(userId: string) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_companies: {
            include: {
              companies: true,
            },
          },
          sessions: true,
          // Add other relations here as needed
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await auditService.logAction('GDPR_DATA_EXPORT', 'User', userId, 'SYSTEM', userId, {
        reason: 'User requested data export',
      });

      // Sanitize sensitive data (e.g. password)
      const { password, ...safeUser } = user;

      return {
        user: safeUser,
        timestamp: new Date(),
        version: '1.0',
      };
    } catch (error: any) {
      console.error('Error exporting user data:', error);
      throw new Error(`Failed to export user data: ${error.message}`);
    }
  }

  /**
   * Anonymize/Delete user data
   * We typically anonymize to preserve referential integrity for orders etc.
   */
  async deleteUserData(userId: string, requestedBy: string) {
    try {
      // 1. Check if user exists
      const user = await prisma.users.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // 2. Anonymize user record
      const anonymizedEmail = `deleted_${userId.substring(0, 8)}@example.com`;
      const anonymizedName = 'Deleted User';
      const anonymizedPhone = `0000000000`;

      await prisma.users.update({
        where: { id: userId },
        data: {
          first_name: anonymizedName,
          last_name: anonymizedName,
          email: anonymizedEmail,
          phone: anonymizedPhone,
          is_active: false,
          avatar_url: null,
          updated_at: new Date(),
        },
      });

      // 3. Log the action
      await auditService.logAction('GDPR_DATA_DELETION', 'User', userId, requestedBy, userId, {
        reason: 'User requested account deletion',
      });

      return {
        success: true,
        message: 'User data anonymized successfully',
      };
    } catch (error: any) {
      console.error('Error deleting user data:', error);
      throw new Error(`Failed to delete user data: ${error.message}`);
    }
  }

  /**
   * Record user consent
   */
  async recordConsent(
    userId: string,
    type: string,
    version: string,
    granted: boolean,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const consent = await prisma.userConsent.upsert({
        where: {
          user_id_type_version: {
            user_id: userId,
            type,
            version,
          },
        },
        update: {
          granted,
          ip_address: ipAddress,
          user_agent: userAgent,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          type,
          version,
          granted,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });

      return consent;
    } catch (error: any) {
      console.error('Error recording consent:', error);
      throw new Error(`Failed to record consent: ${error.message}`);
    }
  }
}

export default new GdprService();
