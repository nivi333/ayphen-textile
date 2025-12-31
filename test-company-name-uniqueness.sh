#!/usr/bin/env bash

# =========================================
# TEST: Company Name Uniqueness Validation
# =========================================
# This script tests that duplicate company names are rejected

set +e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"
CONTENT_TYPE="Content-Type: application/json"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Testing Company Name Uniqueness${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Step 1: Register first user
echo -e "${YELLOW}Step 1: Register first user${NC}"
TIMESTAMP1=$(date +%s)
USER1_EMAIL="test1_${TIMESTAMP1}@lavoro.com"

REGISTER1=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"email\": \"$USER1_EMAIL\",
    \"phone\": \"+91${TIMESTAMP1}\",
    \"password\": \"Test@123\",
    \"firstName\": \"User\",
    \"lastName\": \"One\",
    \"hasConsentedToTerms\": true,
    \"hasConsentedToPrivacy\": true,
    \"hasConsentedToCookies\": true
  }")

USER1_TOKEN=$(echo $REGISTER1 | jq -r '.tokens.accessToken')

if [ "$USER1_TOKEN" != "null" ] && [ -n "$USER1_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} User 1 registered successfully"
else
    echo -e "${RED}✗${NC} Failed to register user 1"
    exit 1
fi

# Step 2: Create first company with name "Test Company"
echo -e "\n${YELLOW}Step 2: Create first company (name: 'Test Company')${NC}"

COMPANY1=$(curl -s -X POST "$BASE_URL/companies" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d '{
    "name": "Test Company",
    "slug": "test-company-'$TIMESTAMP1'",
    "industry": "TEXTILE_MANUFACTURING",
    "country": "India",
    "establishedDate": "2020-01-01",
    "businessType": "PRIVATE_LIMITED",
    "defaultLocation": "HQ",
    "addressLine1": "123 Test St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "contactInfo": "{\"email\": \"test@test.com\", \"phone\": \"+919876543210\"}"
  }')

COMPANY1_ID=$(echo $COMPANY1 | jq -r '.data.id')
COMPANY1_SUCCESS=$(echo $COMPANY1 | jq -r '.success')

if [ "$COMPANY1_SUCCESS" == "true" ] && [ "$COMPANY1_ID" != "null" ]; then
    echo -e "${GREEN}✓${NC} Company 1 created successfully (ID: $COMPANY1_ID)"
else
    echo -e "${RED}✗${NC} Failed to create company 1"
    echo "Response: $COMPANY1"
    exit 1
fi

# Step 3: Register second user
echo -e "\n${YELLOW}Step 3: Register second user${NC}"
sleep 1
TIMESTAMP2=$(date +%s)
USER2_EMAIL="test2_${TIMESTAMP2}@lavoro.com"

REGISTER2=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"email\": \"$USER2_EMAIL\",
    \"phone\": \"+91${TIMESTAMP2}\",
    \"password\": \"Test@123\",
    \"firstName\": \"User\",
    \"lastName\": \"Two\",
    \"hasConsentedToTerms\": true,
    \"hasConsentedToPrivacy\": true,
    \"hasConsentedToCookies\": true
  }")

USER2_TOKEN=$(echo $REGISTER2 | jq -r '.tokens.accessToken')

if [ "$USER2_TOKEN" != "null" ] && [ -n "$USER2_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} User 2 registered successfully"
else
    echo -e "${RED}✗${NC} Failed to register user 2"
    exit 1
fi

# Step 4: Try to create second company with SAME name but different slug
echo -e "\n${YELLOW}Step 4: Try to create company with duplicate name 'Test Company'${NC}"
echo -e "${BLUE}Expected: Should FAIL (name already exists)${NC}"

COMPANY2=$(curl -s -X POST "$BASE_URL/companies" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -d '{
    "name": "Test Company",
    "slug": "test-company-different-'$TIMESTAMP2'",
    "industry": "TEXTILE_MANUFACTURING",
    "country": "India",
    "establishedDate": "2020-01-01",
    "businessType": "PRIVATE_LIMITED",
    "defaultLocation": "HQ",
    "addressLine1": "456 Different St",
    "city": "Delhi",
    "state": "Delhi",
    "contactInfo": "{\"email\": \"test2@test.com\", \"phone\": \"+919876543211\"}"
  }')

COMPANY2_SUCCESS=$(echo $COMPANY2 | jq -r '.success')
COMPANY2_MESSAGE=$(echo $COMPANY2 | jq -r '.message // .error // "Unknown error"')

echo ""
echo -e "${BLUE}Response:${NC}"
echo "$COMPANY2" | jq '.'

echo ""
if [ "$COMPANY2_SUCCESS" == "false" ] || [ "$COMPANY2_SUCCESS" == "null" ]; then
    echo -e "${GREEN}✓ VALIDATION WORKING!${NC} Duplicate company name was rejected"
    echo -e "${GREEN}  Message: $COMPANY2_MESSAGE${NC}"
    VALIDATION_WORKS=true
else
    echo -e "${RED}✗ VALIDATION NOT WORKING!${NC} Duplicate company name was accepted"
    echo -e "${RED}  This means backend doesn't enforce company name uniqueness${NC}"
    VALIDATION_WORKS=false
fi

# Step 5: Test check-name API endpoint
echo -e "\n${YELLOW}Step 5: Test check-name API endpoint${NC}"

CHECK_NAME=$(curl -s -X GET "$BASE_URL/companies/check-name?name=Test%20Company" \
  -H "Authorization: Bearer $USER2_TOKEN")

echo "Response: $CHECK_NAME"

AVAILABLE=$(echo $CHECK_NAME | jq -r '.available')

if [ "$AVAILABLE" == "false" ]; then
    echo -e "${GREEN}✓${NC} check-name API correctly reports name as unavailable"
elif [ "$AVAILABLE" == "true" ]; then
    echo -e "${YELLOW}⚠${NC} check-name API reports name as available (might not be implemented)"
else
    echo -e "${YELLOW}⚠${NC} check-name API endpoint might not exist"
fi

# Summary
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}=========================================${NC}"

if [ "$VALIDATION_WORKS" == "true" ]; then
    echo -e "${GREEN}✓ Backend enforces company name uniqueness${NC}"
    echo -e "${GREEN}✓ Frontend validation will provide additional UX${NC}"
else
    echo -e "${YELLOW}⚠ Backend does NOT enforce company name uniqueness${NC}"
    echo -e "${YELLOW}⚠ Frontend validation is CRITICAL for data integrity${NC}"
    echo -e "${BLUE}ℹ Recommendation: Add backend validation for company names${NC}"
fi

echo ""
echo "Created companies:"
echo "  1. Name: 'Test Company', Slug: 'test-company-$TIMESTAMP1' (User 1)"
if [ "$VALIDATION_WORKS" == "false" ]; then
    echo "  2. Name: 'Test Company', Slug: 'test-company-different-$TIMESTAMP2' (User 2) ⚠ DUPLICATE NAME"
fi
