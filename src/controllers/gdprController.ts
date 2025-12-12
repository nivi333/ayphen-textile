import { Request, Response } from 'express';
import gdprService from '../services/gdprService';

class GdprController {
  // Record Consent
  async recordConsent(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId; // Not really needed for user consent but good context
      const userId = (req as any).userId;
      const { type, version, granted } = req.body;

      if (!type || !version || granted === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: type, version, granted',
        });
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await gdprService.recordConsent({
        userId,
        consentType: type,
        hasConsented: granted,
        ipAddress,
        userAgent,
        version,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Consent recorded successfully',
      });
    } catch (error: any) {
      console.error('Error recording consent:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to record consent',
      });
    }
  }

  // Export Data
  async exportData(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const result = await gdprService.exportUserData(userId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=user_data_${userId}.json`);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error exporting data:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export data',
      });
    }
  }

  // Delete Account
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // confirm delete is intended? usually client side sends a confirmation flag or password
      // For MVP we just proceed

      const result = await gdprService.deleteUserData(userId, userId); // User deleting themselves

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete account',
      });
    }
  }
}

export default new GdprController();
