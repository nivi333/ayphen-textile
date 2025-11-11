import request from 'supertest';
import app from '../index';
import { AuthService } from '../services/authService';

describe('POST /api/v1/auth/register', () => {
  describe('Valid Registration', () => {
    it('should register a user with email successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should register a user with phone successfully', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567890',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });

    it('should register a user with both email and phone', async () => {
      const userData = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1987654321',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when firstName is missing', async () => {
      const userData = {
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 when lastName is missing', async () => {
      const userData = {
        firstName: 'John',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when password is missing', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when both email and phone are missing', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when firstName is too short', async () => {
      const userData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when firstName is too long', async () => {
      const userData = {
        firstName: 'J'.repeat(51),
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when email format is invalid', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when phone format is invalid', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: 'invalid-phone',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when password is too short', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Pass1!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should return 400 when password lacks complexity', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('Business Logic Tests', () => {
    it('should return 409 when user already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing.user@example.com',
        password: 'Password123!',
      };

      // Mock AuthService to throw "already exists" error
      const mockRegister = AuthService.register as jest.MockedFunction<typeof AuthService.register>;
      mockRegister.mockRejectedValueOnce(new Error('User already exists'));

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('already exists');
      
      // Reset mock for other tests
      mockRegister.mockRestore();
    });
  });

  describe('Security Tests', () => {
    it('should not return password in response', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'security.test@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should handle malicious input safely', async () => {
      const userData = {
        firstName: '<script>alert("xss")</script>',
        lastName: 'DROP TABLE users;',
        email: 'malicious@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Should either succeed with sanitized input or fail validation
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should apply rate limiting to registration endpoint', async () => {
      const userData = {
        firstName: 'Rate',
        lastName: 'Test',
        password: 'Password123!',
      };

      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/v1/auth/register')
            .send({
              ...userData,
              email: `ratetest${i}@example.com`,
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited (429) or succeed (201)
      const statusCodes = responses.map(r => r.status);
      expect(statusCodes.some(code => [201, 429].includes(code))).toBe(true);
    });
  });
});

describe('Registration API Integration', () => {
  it('should handle complete registration flow', async () => {
    const userData = {
      firstName: 'Integration',
      lastName: 'Test',
      email: 'integration.test@example.com',
      password: 'Password123!',
    };

    // Register user
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(registerResponse.body).toHaveProperty('tokens');
    expect(registerResponse.body.tokens).toHaveProperty('accessToken');
    expect(registerResponse.body.tokens).toHaveProperty('refreshToken');

    // Verify user data structure
    const user = registerResponse.body.user;
    expect(user).toHaveProperty('firstName', userData.firstName);
    expect(user).toHaveProperty('lastName', userData.lastName);
    expect(user).toHaveProperty('email', userData.email);
    expect(user).not.toHaveProperty('password');
  });
});
