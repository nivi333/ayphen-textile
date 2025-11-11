import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic auth endpoints for testing
app.post('/api/v1/auth/register', (req, res) => {
  const { firstName, lastName, emailOrPhone, password, confirmPassword, agreeToTerms } = req.body;
  
  // Basic validation
  if (!firstName || !lastName || !emailOrPhone || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  
  if (!agreeToTerms) {
    return res.status(400).json({ error: 'Must agree to terms' });
  }
  
  // Mock successful registration
  return res.status(201).json({
    message: 'User registered successfully',
    user: { id: '1', firstName, lastName, emailOrPhone }
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required' });
  }
  
  // Mock successful login
  return res.json({
    message: 'Login successful',
    user: { id: '1', emailOrPhone },
    tokens: { accessToken: 'mock-token', refreshToken: 'mock-refresh-token' }
  });
});

app.post('/api/v1/auth/forgot-password', (req, res) => {
  const { emailOrPhone } = req.body;
  
  if (!emailOrPhone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }
  
  return res.json({ message: 'Password reset instructions sent' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});
