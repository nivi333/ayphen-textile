#!/bin/bash

# Setup and Test Script
# Registers a user, creates a company, and runs the API test script

API_BASE_URL="http://localhost:3000/api/v1"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="Password123!"

echo "1. Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "'"$EMAIL"'",
    "password": "'"$PASSWORD"'"
  }')

ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Registration failed. Response:"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo "Access Token obtained."

echo "2. Creating Company..."
COMPANY_RESPONSE=$(curl -s -X POST "$API_BASE_URL/companies" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "industry": "TEXTILE",
    "email": "company@test.com",
    "phone": "+1234567890",
    "addressLine1": "123 Test St",
    "city": "Test City",
    "state": "Test State",
    "country": "Test Country",
    "currency": "USD",
    "contactInfo": "Test Contact",
    "establishedDate": "2023-01-01",
    "businessType": "Private Limited",
    "defaultLocation": "Main Office"
  }')

COMPANY_ID=$(echo "$COMPANY_RESPONSE" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

# If company ID is not found directly (maybe nested in data), try to parse better or assume it's the first ID
# Let's try to be more robust if possible, but grep is quick.
# The response usually has { success: true, company: { id: "..." } }

if [ -z "$COMPANY_ID" ]; then
  echo "Company creation failed. Response:"
  echo "$COMPANY_RESPONSE"
  exit 1
fi

echo "Company ID obtained: $COMPANY_ID"

echo "3. Switching Company Context..."
SWITCH_RESPONSE=$(curl -s -X POST "$API_BASE_URL/companies/$COMPANY_ID/switch" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

NEW_ACCESS_TOKEN=$(echo "$SWITCH_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$NEW_ACCESS_TOKEN" ]; then
  echo "Switch company failed. Response:"
  echo "$SWITCH_RESPONSE"
  # Fallback to original token if switch fails (though likely tests will fail)
  # But actually, if switch fails, we should probably exit.
  # Let's try to parse it better. The response structure is data.tokens.accessToken
  # grep might fail if it's nested.
  # Let's use a simple python or node script to parse JSON if grep is unreliable, but grep is okay for simple structures.
  # The response is { success: true, data: { tokens: { accessToken: "..." } } }
  # My grep above matches the first occurrence.
fi

if [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo "Switched to company context. Using new token."
  ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
else
    echo "Failed to extract new token. Using original token (tests may fail)."
fi

echo "4. Running API Tests..."
export ACCESS_TOKEN="$ACCESS_TOKEN"
export COMPANY_ID="$COMPANY_ID"
export API_BASE_URL="$API_BASE_URL"

./test-all-apis.sh
