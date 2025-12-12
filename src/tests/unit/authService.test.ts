import { AuthService } from '../../services/authService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

jest.unmock('../../services/authService');

// Mock dependencies
jest.mock('../../database/connection', () => ({
  globalPrisma: {
    users: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    sessions: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../utils/redis', () => ({
  redisClient: {
    setex: jest.fn(),
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('uuid');
jest.mock('../../config/config', () => ({
  config: {
    security: { bcryptRounds: 10 },
    jwt: {
      secret: 'secret',
      refreshSecret: 'refreshSecret',
      expiresIn: '1h',
      refreshExpiresIn: '7d',
    },
  },
}));
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import { globalPrisma } from '../../database/connection';

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mockToken');
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      (globalPrisma.users.findFirst as jest.Mock).mockResolvedValue(null);
      (globalPrisma.users.create as jest.Mock).mockResolvedValue({
        id: 'mock-uuid',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        is_active: true,
        created_at: new Date(),
      });

      const result = await AuthService.register(userData);

      expect(globalPrisma.users.findFirst).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(globalPrisma.users.create).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken', 'mockToken');
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'exists@example.com',
        password: 'password123',
      };

      (globalPrisma.users.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

      await expect(AuthService.register(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const credentials = {
        emailOrPhone: 'john@example.com',
        password: 'password123',
      };

      (globalPrisma.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'mock-uuid',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        is_active: true,
      });

      const result = await AuthService.login(credentials);

      expect(result.user).toHaveProperty('id', 'mock-uuid');
      expect(result.tokens).toHaveProperty('accessToken', 'mockToken');
    });

    it('should throw error for invalid credentials', async () => {
      const credentials = {
        emailOrPhone: 'john@example.com',
        password: 'wrongpassword',
      };

      (globalPrisma.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'mock-uuid',
        password: 'hashedPassword',
        is_active: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });
});
