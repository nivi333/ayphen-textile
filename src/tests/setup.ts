// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup test database, mocks, etc.
});

afterAll(async () => {
  // Cleanup after all tests
});

// Global test configuration
jest.setTimeout(10000);
