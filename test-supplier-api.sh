#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/v1"

echo "=========================================="
echo "SUPPLIER API COMPREHENSIVE TEST"
echo "=========================================="
echo ""

# Step 1: Login to get token
echo "Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "admin@example.com",
    "password": "Admin@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.tokens.accessToken')
TENANT_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.companies[0].id')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo $LOGIN_RESPONSE | jq '.'
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo "Tenant ID: $TENANT_ID"
echo ""

# Step 2: Test CREATE with ONLY mandatory fields (name and supplierType)
echo "=========================================="
echo "TEST 1: Create Supplier - ONLY Mandatory Fields"
echo "=========================================="
CREATE_MINIMAL=$(curl -s -X POST "$API_URL/suppliers/$TENANT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Minimal Supplier Test",
    "supplierType": "MANUFACTURER"
  }')

echo "Response:"
echo $CREATE_MINIMAL | jq '.'

if [ "$(echo $CREATE_MINIMAL | jq -r '.success')" == "true" ]; then
  echo -e "${GREEN}✅ TEST 1 PASSED: Created with only mandatory fields${NC}"
  SUPPLIER_ID_1=$(echo $CREATE_MINIMAL | jq -r '.data.id')
else
  echo -e "${RED}❌ TEST 1 FAILED${NC}"
fi
echo ""

# Step 3: Test CREATE with empty strings for optional fields
echo "=========================================="
echo "TEST 2: Create Supplier - With Empty Strings"
echo "=========================================="
CREATE_EMPTY_STRINGS=$(curl -s -X POST "$API_URL/suppliers/$TENANT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Supp 1",
    "supplierType": "DISTRIBUTOR",
    "companyRegNo": "",
    "email": "",
    "phone": "",
    "alternatePhone": "",
    "website": "",
    "fax": "",
    "addressLine1": "",
    "addressLine2": "",
    "city": "",
    "state": "",
    "country": "",
    "postalCode": "",
    "paymentTerms": "",
    "currency": "",
    "taxId": "",
    "panNumber": "",
    "bankDetails": "",
    "qualityRating": "",
    "complianceStatus": "",
    "supplierCategory": "",
    "assignedManager": "",
    "notes": "",
    "isActive": true
  }')

echo "Response:"
echo $CREATE_EMPTY_STRINGS | jq '.'

if [ "$(echo $CREATE_EMPTY_STRINGS | jq -r '.success')" == "true" ]; then
  echo -e "${GREEN}✅ TEST 2 PASSED: Created with empty strings${NC}"
  SUPPLIER_ID_2=$(echo $CREATE_EMPTY_STRINGS | jq -r '.data.id')
else
  echo -e "${RED}❌ TEST 2 FAILED${NC}"
fi
echo ""

# Step 4: Test CREATE with all valid fields
echo "=========================================="
echo "TEST 3: Create Supplier - All Valid Fields"
echo "=========================================="
CREATE_FULL=$(curl -s -X POST "$API_URL/suppliers/$TENANT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Complete Supplier Ltd",
    "supplierType": "MANUFACTURER",
    "companyRegNo": "REG123456",
    "email": "supplier@example.com",
    "phone": "+919876543210",
    "alternatePhone": "+919876543211",
    "website": "https://supplier.com",
    "fax": "0221234567",
    "addressLine1": "123 Industrial Area",
    "addressLine2": "Phase 2",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "postalCode": "400001",
    "paymentTerms": "NET_30",
    "creditPeriod": 30,
    "currency": "INR",
    "taxId": "TAX123",
    "panNumber": "ABCDE1234F",
    "bankDetails": "Bank: HDFC, Account: 123456789",
    "leadTimeDays": 7,
    "minOrderQty": 100,
    "minOrderValue": 10000,
    "qualityRating": "EXCELLENT",
    "complianceStatus": "COMPLIANT",
    "supplierCategory": "PREFERRED",
    "notes": "Reliable supplier with good track record",
    "isActive": true
  }')

echo "Response:"
echo $CREATE_FULL | jq '.'

if [ "$(echo $CREATE_FULL | jq -r '.success')" == "true" ]; then
  echo -e "${GREEN}✅ TEST 3 PASSED: Created with all fields${NC}"
  SUPPLIER_ID_3=$(echo $CREATE_FULL | jq -r '.data.id')
else
  echo -e "${RED}❌ TEST 3 FAILED${NC}"
fi
echo ""

# Step 5: Test CREATE with missing mandatory field (should fail)
echo "=========================================="
echo "TEST 4: Create Supplier - Missing Mandatory Field (Negative Test)"
echo "=========================================="
CREATE_MISSING=$(curl -s -X POST "$API_URL/suppliers/$TENANT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "supplierType": "MANUFACTURER"
  }')

echo "Response:"
echo $CREATE_MISSING | jq '.'

if [ "$(echo $CREATE_MISSING | jq -r '.success')" == "false" ]; then
  echo -e "${GREEN}✅ TEST 4 PASSED: Correctly rejected missing mandatory field${NC}"
else
  echo -e "${RED}❌ TEST 4 FAILED: Should have rejected${NC}"
fi
echo ""

# Step 6: Test UPDATE with only mandatory fields
echo "=========================================="
echo "TEST 5: Update Supplier - Change Name Only"
echo "=========================================="
if [ ! -z "$SUPPLIER_ID_1" ]; then
  UPDATE_MINIMAL=$(curl -s -X PUT "$API_URL/suppliers/$TENANT_ID/$SUPPLIER_ID_1" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Updated Minimal Supplier"
    }')

  echo "Response:"
  echo $UPDATE_MINIMAL | jq '.'

  if [ "$(echo $UPDATE_MINIMAL | jq -r '.success')" == "true" ]; then
    echo -e "${GREEN}✅ TEST 5 PASSED: Updated successfully${NC}"
  else
    echo -e "${RED}❌ TEST 5 FAILED${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  TEST 5 SKIPPED: No supplier ID from TEST 1${NC}"
fi
echo ""

# Step 7: Test UPDATE with empty strings
echo "=========================================="
echo "TEST 6: Update Supplier - Set Fields to Empty"
echo "=========================================="
if [ ! -z "$SUPPLIER_ID_3" ]; then
  UPDATE_EMPTY=$(curl -s -X PUT "$API_URL/suppliers/$TENANT_ID/$SUPPLIER_ID_3" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "email": "",
      "phone": "",
      "qualityRating": "",
      "currency": ""
    }')

  echo "Response:"
  echo $UPDATE_EMPTY | jq '.'

  if [ "$(echo $UPDATE_EMPTY | jq -r '.success')" == "true" ]; then
    echo -e "${GREEN}✅ TEST 6 PASSED: Updated with empty strings${NC}"
  else
    echo -e "${RED}❌ TEST 6 FAILED${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  TEST 6 SKIPPED: No supplier ID from TEST 3${NC}"
fi
echo ""

# Step 8: Test GET all suppliers
echo "=========================================="
echo "TEST 7: Get All Suppliers"
echo "=========================================="
GET_ALL=$(curl -s -X GET "$API_URL/suppliers/$TENANT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo $GET_ALL | jq '.'

SUPPLIER_COUNT=$(echo $GET_ALL | jq -r '.data | length')
if [ "$SUPPLIER_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ TEST 7 PASSED: Retrieved $SUPPLIER_COUNT suppliers${NC}"
else
  echo -e "${RED}❌ TEST 7 FAILED${NC}"
fi
echo ""

# Step 9: Test GET single supplier
echo "=========================================="
echo "TEST 8: Get Single Supplier by ID"
echo "=========================================="
if [ ! -z "$SUPPLIER_ID_3" ]; then
  GET_SINGLE=$(curl -s -X GET "$API_URL/suppliers/$TENANT_ID/$SUPPLIER_ID_3" \
    -H "Authorization: Bearer $TOKEN")

  echo "Response:"
  echo $GET_SINGLE | jq '.'

  if [ "$(echo $GET_SINGLE | jq -r '.success')" == "true" ]; then
    echo -e "${GREEN}✅ TEST 8 PASSED: Retrieved supplier details${NC}"
  else
    echo -e "${RED}❌ TEST 8 FAILED${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  TEST 8 SKIPPED: No supplier ID${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo "All tests completed. Review results above."
echo ""
