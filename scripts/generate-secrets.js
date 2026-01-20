#!/usr/bin/env node

/**
 * Generate Secure Secrets for Production Deployment
 * 
 * This script generates cryptographically secure random strings
 * for JWT secrets, session secrets, and other sensitive configuration.
 * 
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Production Deployment\n');
console.log('=' .repeat(60));

// Generate secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('\n📋 Copy these values to your Render environment variables:\n');

console.log('JWT_SECRET=');
console.log(jwtSecret);
console.log('');

console.log('JWT_REFRESH_SECRET=');
console.log(jwtRefreshSecret);
console.log('');

console.log('SESSION_SECRET=');
console.log(sessionSecret);
console.log('');

console.log('=' .repeat(60));
console.log('\n✅ Secrets generated successfully!');
console.log('\n⚠️  IMPORTANT: Keep these secrets secure and never commit them to Git!\n');

// Also output as .env format
console.log('📄 .env format (for local testing only):\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('');
