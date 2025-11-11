import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { redisClient } from '@/utils/redis';
import { globalPrisma } from '@/database/connection';
import { migrationManager } from '@/database/migrations';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  tenantId?: string;
  role?: string;
  type: 'access' | 'refresh';
  sessionId: string;
}

export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
  deviceInfo?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
  deviceInfo?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  tenantId?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

export class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token (access or refresh)
   */
  private static generateToken(payload: Omit<JWTPayload, 'type'>, type: 'access' | 'refresh'): string {
    const tokenPayload: JWTPayload = { ...payload, type };
    const secret = type === 'access' ? config.jwt.secret : config.jwt.refreshSecret;
    const expiresIn = type === 'access' ? config.jwt.expiresIn : config.jwt.refreshExpiresIn;

    const options: SignOptions = { expiresIn: expiresIn as StringValue };
    return jwt.sign(tokenPayload, secret, options);
  }

  static generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
    return this.generateToken(payload, 'access');
  }

  static generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
    return this.generateToken(payload, 'refresh');
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string, type: 'access' | 'refresh' = 'access'): JWTPayload {
    const secret = type === 'access' ? config.jwt.secret : config.jwt.refreshSecret;
    const decoded = jwt.verify(token, secret) as JWTPayload;

    if (decoded.type !== type) {
      throw new Error('Invalid token type');
    }

    return decoded;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<{ user: any; tokens: AuthTokens }> {
    if (!userData.email && !userData.phone) {
      throw new Error('Email or phone number is required');
    }

    const whereConditions = [
      userData.email && { email: userData.email },
      userData.phone && { phone: userData.phone },
    ].filter(Boolean);

    const existingUser = await globalPrisma.user.findFirst({
      where: { OR: whereConditions },
    });

    if (existingUser) {
      throw new Error('User already exists with this email or phone');
    }

    const hashedPassword = await this.hashPassword(userData.password);

    const user = await globalPrisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    const sessionId = uuidv4();
    const tokens = await this.createSession({
      userId: user.id,
      sessionId,
      deviceInfo: userData.deviceInfo,
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
    });

    logger.info(`User registered: ${user.id}`);
    return { user, tokens };
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await globalPrisma.user.findFirst({
      where: {
        OR: [
          { email: credentials.emailOrPhone },
          { phone: credentials.emailOrPhone },
        ],
        isActive: true,
      },
    });

    if (!user || !(await this.verifyPassword(credentials.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const sessionId = uuidv4();
    const tokens = await this.createSession({
      userId: user.id,
      sessionId,
      deviceInfo: credentials.deviceInfo,
      userAgent: credentials.userAgent,
      ipAddress: credentials.ipAddress,
    });

    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    logger.info(`User logged in: ${user.id}`);
    return { user: userResponse, tokens };
  }

  /**
   * Create session and generate tokens
   */
  static async createSession(sessionData: {
    userId: string;
    sessionId: string;
    tenantId?: string;
    deviceInfo?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<AuthTokens> {
    const { userId, sessionId, tenantId, deviceInfo, userAgent, ipAddress } = sessionData;

    const tokenPayload = { userId, sessionId, tenantId };
    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    const refreshExpMs = this.parseExpirationTime(config.jwt.refreshExpiresIn);
    const expiresAt = new Date(Date.now() + refreshExpMs);

    await globalPrisma.session.create({
      data: {
        id: sessionId,
        userId,
        tenantId,
        refreshToken,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    const refreshExpSec = Math.floor(refreshExpMs / 1000);
    await redisClient.setex(`refresh_token:${sessionId}`, refreshExpSec, refreshToken);

    const sessionMeta = { userId, tenantId, deviceInfo, ipAddress, userAgent, createdAt: new Date().toISOString() };
    await redisClient.setex(`session:${sessionId}`, refreshExpSec, JSON.stringify(sessionMeta));

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirationTime(config.jwt.expiresIn) / 1000,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const decoded = this.verifyToken(refreshToken, 'refresh');

    const storedToken = await redisClient.get(`refresh_token:${decoded.sessionId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const session = await globalPrisma.session.findUnique({
      where: { id: decoded.sessionId },
    });

    if (!session || session.refreshToken !== refreshToken) {
      throw new Error('Session not found or invalid');
    }

    if (session.expiresAt < new Date()) {
      await this.revokeSession(decoded.sessionId);
      throw new Error('Session expired');
    }

    const newTokens = await this.createSession({
      userId: decoded.userId,
      sessionId: decoded.sessionId,
      tenantId: decoded.tenantId,
      deviceInfo: session.deviceInfo || undefined,
      userAgent: session.userAgent || undefined,
      ipAddress: session.ipAddress || undefined,
    });

    await redisClient.del(`refresh_token:${decoded.sessionId}`);

    logger.info(`Token refreshed for user: ${decoded.userId}`);
    return newTokens;
  }

  /**
   * Switch tenant context (generate new tokens with tenant info)
   */
  static async switchTenant(userId: string, tenantId: string, sessionId: string): Promise<AuthTokens> {
    const access = await migrationManager.validateTenantAccess(userId, tenantId);
    if (!access.hasAccess) {
      throw new Error('Access denied to tenant');
    }

    const session = await globalPrisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new Error('Invalid session');
    }

    const newTokens = await this.createSession({
      userId,
      sessionId,
      tenantId,
      deviceInfo: session.deviceInfo || undefined,
      userAgent: session.userAgent || undefined,
      ipAddress: session.ipAddress || undefined,
    });

    logger.info(`Tenant switched for user ${userId} to tenant ${tenantId}`);
    return newTokens;
  }

  /**
   * Logout user (revoke session)
   */
  static async logout(sessionId: string): Promise<void> {
    await this.revokeSession(sessionId);
    logger.info(`User logged out, session revoked: ${sessionId}`);
  }

  /**
   * Revoke session
   */
  static async revokeSession(sessionId: string): Promise<void> {
    await globalPrisma.session.delete({ where: { id: sessionId } });
    await redisClient.del(`refresh_token:${sessionId}`, `session:${sessionId}`);
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await globalPrisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      tenantId: session.tenantId || undefined,
      deviceInfo: session.deviceInfo || undefined,
      ipAddress: session.ipAddress || undefined,
      userAgent: session.userAgent || undefined,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }

  /**
   * Revoke all user sessions except current
   */
  static async revokeAllUserSessions(userId: string, currentSessionId?: string): Promise<void> {
    const whereClause: any = { userId };
    if (currentSessionId) {
      whereClause.id = { not: currentSessionId };
    }

    const sessions = await globalPrisma.session.findMany({
      where: whereClause,
      select: { id: true },
    });

    await globalPrisma.session.deleteMany({ where: whereClause });

    const redisKeys = sessions.flatMap(session => [
      `refresh_token:${session.id}`,
      `session:${session.id}`,
    ]);

    if (redisKeys.length > 0) {
      await redisClient.del(...redisKeys);
    }

    logger.info(`Revoked ${sessions.length} sessions for user: ${userId}`);
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    const expiredSessions = await globalPrisma.session.findMany({
      where: { expiresAt: { lt: new Date() } },
      select: { id: true },
    });

    if (expiredSessions.length === 0) return;

    await globalPrisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const redisKeys = expiredSessions.flatMap(session => [
      `refresh_token:${session.id}`,
      `session:${session.id}`,
    ]);

    await redisClient.del(...redisKeys);
    logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
  }

  /**
   * Parse expiration time string to milliseconds
   */
  private static parseExpirationTime(expirationString: string): number {
    const match = expirationString.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error('Invalid time unit');
    }
  }
}

// Schedule cleanup of expired sessions every hour
setInterval(() => {
  AuthService.cleanupExpiredSessions();
}, 60 * 60 * 1000);
