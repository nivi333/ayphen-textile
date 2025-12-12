// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Redis and Database connections to avoid connection issues in tests
jest.mock('../utils/redis', () => ({
  redisClient: {
    isReady: jest.fn(() => true),
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve('OK')),
    del: jest.fn(() => Promise.resolve(1)),
    quit: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../database/connection', () => ({
  globalPrisma: {
    $queryRaw: jest.fn(() => Promise.resolve([{ '1': 1 }])),
    $disconnect: jest.fn(() => Promise.resolve()),
    users: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    sessions: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    user_companies: {
      findFirst: jest.fn(),
    },
    customers: {
      findFirst: jest.fn(),
    },
    products: {
      findFirst: jest.fn(),
    },
  },
}));

// Mock AuthService to avoid database calls
jest.mock('../services/authService', () => ({
  AuthService: {
    register: jest.fn(data =>
      Promise.resolve({
        user: {
          id: 'test-user-id',
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    ),
    login: jest.fn(() =>
      Promise.resolve({
        user: { id: 'test-user-id', email: 'test@example.com' },
        tokens: { accessToken: 'mock-token', refreshToken: 'mock-refresh' },
      })
    ),
  },
}));

// Mock logger to avoid console output during tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Global test setup
beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
});

afterAll(async () => {
  // Cleanup after all tests
  jest.clearAllMocks();
});

// Global test configuration
jest.setTimeout(10000);
