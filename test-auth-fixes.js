#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/v1';

async function testAuthenticationFixes() {
  console.log('🧪 Testing Authentication Fixes...\n');

  // Test 1: Login with invalid credentials (should return proper error, not Prisma error)
  console.log('1. Testing login with invalid credentials...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrPhone: 'nonexistent@example.com',
        password: 'wrongpassword123'
      })
    });

    const result = await response.json();
    
    if (response.status === 404 && result.message === 'User not found') {
      console.log('✅ PASS: Proper "User not found" error returned');
    } else if (response.status === 401 && result.message === 'Invalid credentials') {
      console.log('✅ PASS: Proper "Invalid credentials" error returned');
    } else {
      console.log('❌ FAIL: Unexpected response:', result);
    }
  } catch (error) {
    console.log('❌ FAIL: Network error:', error.message);
  }

  // Test 2: Login with missing fields
  console.log('\n2. Testing login with missing fields...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrPhone: '',
        password: ''
      })
    });

    const result = await response.json();
    
    if (response.status === 400) {
      console.log('✅ PASS: Proper validation error returned');
    } else {
      console.log('❌ FAIL: Expected 400 validation error, got:', result);
    }
  } catch (error) {
    console.log('❌ FAIL: Network error:', error.message);
  }

  // Test 3: Registration with existing email (should return proper error)
  console.log('\n3. Testing registration with duplicate email...');
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'TestPassword123!'
      })
    });

    const result = await response.json();
    console.log('Registration response status:', response.status);
    console.log('Registration response:', result);
  } catch (error) {
    console.log('❌ FAIL: Network error:', error.message);
  }

  console.log('\n🏁 Authentication tests completed!');
}

// Run tests
testAuthenticationFixes().catch(console.error);
