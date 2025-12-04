#!/bin/bash

# Textile Operations Comprehensive API Test Script
# Tests all CRUD operations for Fabric, Yarn, Dyeing, Garment, and Design modules

set -e

BASE_URL="http://localhost:3000/api/v1"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test results
print_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "========================================="
echo "TEXTILE OPERATIONS API TEST SUITE"
echo "========================================="
echo ""

# Step 1: Register/Login and get token
echo -e "${YELLOW}Step 1: Authentication${NC}"
echo "Registering test user..."

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "textile_test_'$(date +%s)'@test.com",
    "phone": "+91'$(date +%s | tail -c 11)'",
    "password": "Test@123",
    "firstName": "Textile",
    "lastName": "Tester"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.tokens.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    print_test 0 "User registration and token retrieval"
else
    print_test 1 "User registration and token retrieval"
    echo "Error: Failed to get authentication token"
    exit 1
fi

# Step 2: Create Company
echo ""
echo -e "${YELLOW}Step 2: Company Creation${NC}"

COMPANY_RESPONSE=$(curl -s -X POST "$BASE_URL/companies" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Textile Test Company",
    "slug": "textile-test-'$(date +%s)'",
    "industry": "textile_manufacturing",
    "country": "India",
    "establishedDate": "2024-01-01",
    "businessType": "PRIVATE_LIMITED",
    "defaultLocation": "Test HQ",
    "addressLine1": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "contactInfo": "{\"email\": \"test@textile.com\", \"phone\": \"+919876543210\"}"
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.data.id')

if [ "$COMPANY_ID" != "null" ] && [ -n "$COMPANY_ID" ]; then
    print_test 0 "Company creation"
else
    print_test 1 "Company creation"
    echo "Error: Failed to create company"
    exit 1
fi

# Step 3: Switch to Company Context
echo ""
echo -e "${YELLOW}Step 3: Switch Company Context${NC}"

SWITCH_RESPONSE=$(curl -s -X POST "$BASE_URL/companies/$COMPANY_ID/switch" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN")

NEW_TOKEN=$(echo $SWITCH_RESPONSE | jq -r '.data.tokens.accessToken')

if [ "$NEW_TOKEN" != "null" ] && [ -n "$NEW_TOKEN" ]; then
    TOKEN=$NEW_TOKEN
    print_test 0 "Company context switch"
else
    print_test 1 "Company context switch"
    echo "Error: Failed to switch company context"
    exit 1
fi

# ==========================================
# FABRIC PRODUCTION TESTS
# ==========================================
echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}FABRIC PRODUCTION MODULE TESTS${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Test 1: Create Fabric
echo ""
echo "Test 1: Create Fabric Production"
FABRIC_CREATE=$(curl -s -X POST "$BASE_URL/textile/fabrics" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fabricType": "COTTON",
    "fabricName": "Premium Cotton Fabric",
    "composition": "100% Cotton",
    "weightGsm": 150,
    "widthInches": 60,
    "color": "White",
    "pattern": "Plain",
    "finishType": "Mercerized",
    "quantityMeters": 1000,
    "productionDate": "2024-12-04",
    "batchNumber": "FAB-BATCH-001",
    "qualityGrade": "A_GRADE",
    "isActive": true
  }')

FABRIC_ID=$(echo $FABRIC_CREATE | jq -r '.data.fabricId')
[ "$FABRIC_ID" != "null" ] && print_test 0 "Create fabric production" || print_test 1 "Create fabric production"

# Test 2: Get All Fabrics
echo "Test 2: Get All Fabrics"
FABRICS_LIST=$(curl -s -X GET "$BASE_URL/textile/fabrics" \
  -H "Authorization: Bearer $TOKEN")
FABRIC_COUNT=$(echo $FABRICS_LIST | jq -r '.data | length')
[ "$FABRIC_COUNT" -gt 0 ] && print_test 0 "Get all fabrics" || print_test 1 "Get all fabrics"

# Test 3: Get Fabric by ID
echo "Test 3: Get Fabric by ID"
FABRIC_DETAIL=$(curl -s -X GET "$BASE_URL/textile/fabrics/$FABRIC_ID" \
  -H "Authorization: Bearer $TOKEN")
FABRIC_NAME=$(echo $FABRIC_DETAIL | jq -r '.data.fabricName')
[ "$FABRIC_NAME" == "Premium Cotton Fabric" ] && print_test 0 "Get fabric by ID" || print_test 1 "Get fabric by ID"

# Test 4: Update Fabric
echo "Test 4: Update Fabric"
FABRIC_UPDATE=$(curl -s -X PUT "$BASE_URL/textile/fabrics/$FABRIC_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fabricType": "COTTON",
    "fabricName": "Updated Premium Cotton Fabric",
    "composition": "100% Organic Cotton",
    "weightGsm": 160,
    "widthInches": 60,
    "color": "White",
    "quantityMeters": 1200,
    "productionDate": "2024-12-04",
    "batchNumber": "FAB-BATCH-001",
    "qualityGrade": "A_GRADE",
    "isActive": true
  }')
UPDATED_NAME=$(echo $FABRIC_UPDATE | jq -r '.data.fabricName')
[ "$UPDATED_NAME" == "Updated Premium Cotton Fabric" ] && print_test 0 "Update fabric" || print_test 1 "Update fabric"

# Test 5: Delete Fabric
echo "Test 5: Delete Fabric"
FABRIC_DELETE=$(curl -s -X DELETE "$BASE_URL/textile/fabrics/$FABRIC_ID" \
  -H "Authorization: Bearer $TOKEN")
DELETE_MSG=$(echo $FABRIC_DELETE | jq -r '.message')
[ "$DELETE_MSG" == "Fabric deleted successfully" ] && print_test 0 "Delete fabric" || print_test 1 "Delete fabric"

# ==========================================
# YARN MANUFACTURING TESTS
# ==========================================
echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}YARN MANUFACTURING MODULE TESTS${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Test 6: Create Yarn
echo ""
echo "Test 6: Create Yarn Manufacturing"
YARN_CREATE=$(curl -s -X POST "$BASE_URL/textile/yarns" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "yarnName": "Cotton Yarn 30s",
    "fiberContent": "100% Cotton",
    "yarnType": "COTTON",
    "yarnCount": "30s",
    "twistType": "Z-Twist",
    "ply": 2,
    "color": "Natural White",
    "quantityKg": 500,
    "productionDate": "2024-12-04",
    "batchNumber": "YARN-BATCH-001",
    "processType": "SPINNING",
    "qualityGrade": "A_GRADE",
    "isActive": true
  }')

YARN_ID=$(echo $YARN_CREATE | jq -r '.data.yarnId')
[ "$YARN_ID" != "null" ] && print_test 0 "Create yarn manufacturing" || print_test 1 "Create yarn manufacturing"

# Test 7: Get All Yarns
echo "Test 7: Get All Yarns"
YARNS_LIST=$(curl -s -X GET "$BASE_URL/textile/yarns" \
  -H "Authorization: Bearer $TOKEN")
YARN_COUNT=$(echo $YARNS_LIST | jq -r '.data | length')
[ "$YARN_COUNT" -gt 0 ] && print_test 0 "Get all yarns" || print_test 1 "Get all yarns"

# Test 8: Get Yarn by ID
echo "Test 8: Get Yarn by ID"
YARN_DETAIL=$(curl -s -X GET "$BASE_URL/textile/yarns/$YARN_ID" \
  -H "Authorization: Bearer $TOKEN")
YARN_NAME=$(echo $YARN_DETAIL | jq -r '.data.yarnName')
[ "$YARN_NAME" == "Cotton Yarn 30s" ] && print_test 0 "Get yarn by ID" || print_test 1 "Get yarn by ID"

# Test 9: Update Yarn
echo "Test 9: Update Yarn"
YARN_UPDATE=$(curl -s -X PUT "$BASE_URL/textile/yarns/$YARN_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "yarnName": "Updated Cotton Yarn 30s",
    "fiberContent": "100% Organic Cotton",
    "yarnType": "COTTON",
    "yarnCount": "30s",
    "ply": 2,
    "color": "Natural White",
    "quantityKg": 600,
    "productionDate": "2024-12-04",
    "batchNumber": "YARN-BATCH-001",
    "processType": "SPINNING",
    "qualityGrade": "A_GRADE",
    "isActive": true
  }')
UPDATED_YARN=$(echo $YARN_UPDATE | jq -r '.data.yarnName')
[ "$UPDATED_YARN" == "Updated Cotton Yarn 30s" ] && print_test 0 "Update yarn" || print_test 1 "Update yarn"

# Test 10: Delete Yarn
echo "Test 10: Delete Yarn"
YARN_DELETE=$(curl -s -X DELETE "$BASE_URL/textile/yarns/$YARN_ID" \
  -H "Authorization: Bearer $TOKEN")
DELETE_MSG=$(echo $YARN_DELETE | jq -r '.message')
[ "$DELETE_MSG" == "Yarn deleted successfully" ] && print_test 0 "Delete yarn" || print_test 1 "Delete yarn"

# ==========================================
# DYEING & FINISHING TESTS
# ==========================================
echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}DYEING & FINISHING MODULE TESTS${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Test 11: Create Dyeing Process
echo ""
echo "Test 11: Create Dyeing & Finishing Process"
DYEING_CREATE=$(curl -s -X POST "$BASE_URL/textile/dyeing" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "processType": "DYEING",
    "colorCode": "#FF5733",
    "colorName": "Coral Red",
    "quantityMeters": 800,
    "processDate": "2024-12-04",
    "batchNumber": "DYE-BATCH-001",
    "machineNumber": "DYE-M001",
    "temperatureC": 85,
    "durationMinutes": 120,
    "qualityCheck": true,
    "isActive": true
  }')

DYEING_ID=$(echo $DYEING_CREATE | jq -r '.data.processId')
[ "$DYEING_ID" != "null" ] && print_test 0 "Create dyeing process" || print_test 1 "Create dyeing process"

# Test 12: Get All Dyeing Processes
echo "Test 12: Get All Dyeing Processes"
DYEING_LIST=$(curl -s -X GET "$BASE_URL/textile/dyeing" \
  -H "Authorization: Bearer $TOKEN")
DYEING_COUNT=$(echo $DYEING_LIST | jq -r '.data | length')
[ "$DYEING_COUNT" -gt 0 ] && print_test 0 "Get all dyeing processes" || print_test 1 "Get all dyeing processes"

# Test 13: Get Dyeing by ID
echo "Test 13: Get Dyeing Process by ID"
DYEING_DETAIL=$(curl -s -X GET "$BASE_URL/textile/dyeing/$DYEING_ID" \
  -H "Authorization: Bearer $TOKEN")
DYEING_COLOR=$(echo $DYEING_DETAIL | jq -r '.data.colorName')
[ "$DYEING_COLOR" == "Coral Red" ] && print_test 0 "Get dyeing process by ID" || print_test 1 "Get dyeing process by ID"

# Test 14: Update Dyeing Process
echo "Test 14: Update Dyeing Process"
DYEING_UPDATE=$(curl -s -X PUT "$BASE_URL/textile/dyeing/$DYEING_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "processType": "DYEING",
    "colorCode": "#A52A2A",
    "colorName": "Updated Brown",
    "quantityMeters": 900,
    "processDate": "2024-12-04",
    "batchNumber": "DYE-BATCH-001",
    "temperatureC": 90,
    "durationMinutes": 130,
    "qualityCheck": true,
    "isActive": true
  }')
UPDATED_COLOR=$(echo $DYEING_UPDATE | jq -r '.data.colorName')
[ "$UPDATED_COLOR" == "Updated Brown" ] && print_test 0 "Update dyeing process" || print_test 1 "Update dyeing process"

# Test 15: Delete Dyeing Process
echo "Test 15: Delete Dyeing Process"
DYEING_DELETE=$(curl -s -X DELETE "$BASE_URL/textile/dyeing/$DYEING_ID" \
  -H "Authorization: Bearer $TOKEN")
DELETE_MSG=$(echo $DYEING_DELETE | jq -r '.message')
[ "$DELETE_MSG" == "Dyeing process deleted successfully" ] && print_test 0 "Delete dyeing process" || print_test 1 "Delete dyeing process"

# ==========================================
# GARMENT MANUFACTURING TESTS
# ==========================================
echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}GARMENT MANUFACTURING MODULE TESTS${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Test 16: Create Garment
echo ""
echo "Test 16: Create Garment Manufacturing"
GARMENT_CREATE=$(curl -s -X POST "$BASE_URL/textile/garments" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "garmentType": "T_SHIRT",
    "styleNumber": "TS-001",
    "size": "L",
    "color": "Blue",
    "quantity": 100,
    "productionStage": "CUTTING",
    "qualityPassed": true,
    "defectCount": 0,
    "isActive": true
  }')

GARMENT_ID=$(echo $GARMENT_CREATE | jq -r '.data.garmentId')
[ "$GARMENT_ID" != "null" ] && print_test 0 "Create garment manufacturing" || print_test 1 "Create garment manufacturing"

# Test 17: Get All Garments
echo "Test 17: Get All Garments"
GARMENTS_LIST=$(curl -s -X GET "$BASE_URL/textile/garments" \
  -H "Authorization: Bearer $TOKEN")
GARMENT_COUNT=$(echo $GARMENTS_LIST | jq -r '.data | length')
[ "$GARMENT_COUNT" -gt 0 ] && print_test 0 "Get all garments" || print_test 1 "Get all garments"

# Test 18: Get Garment by ID
echo "Test 18: Get Garment by ID"
GARMENT_DETAIL=$(curl -s -X GET "$BASE_URL/textile/garments/$GARMENT_ID" \
  -H "Authorization: Bearer $TOKEN")
GARMENT_STYLE=$(echo $GARMENT_DETAIL | jq -r '.data.styleNumber')
[ "$GARMENT_STYLE" == "TS-001" ] && print_test 0 "Get garment by ID" || print_test 1 "Get garment by ID"

# Test 19: Update Garment
echo "Test 19: Update Garment"
GARMENT_UPDATE=$(curl -s -X PUT "$BASE_URL/textile/garments/$GARMENT_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "garmentType": "T_SHIRT",
    "styleNumber": "TS-001-UPDATED",
    "size": "L",
    "color": "Navy Blue",
    "quantity": 120,
    "productionStage": "SEWING",
    "qualityPassed": true,
    "defectCount": 0,
    "isActive": true
  }')
UPDATED_STYLE=$(echo $GARMENT_UPDATE | jq -r '.data.styleNumber')
[ "$UPDATED_STYLE" == "TS-001-UPDATED" ] && print_test 0 "Update garment" || print_test 1 "Update garment"

# Test 20: Delete Garment
echo "Test 20: Delete Garment"
GARMENT_DELETE=$(curl -s -X DELETE "$BASE_URL/textile/garments/$GARMENT_ID" \
  -H "Authorization: Bearer $TOKEN")
DELETE_MSG=$(echo $GARMENT_DELETE | jq -r '.message')
[ "$DELETE_MSG" == "Garment deleted successfully" ] && print_test 0 "Delete garment" || print_test 1 "Delete garment"

# ==========================================
# DESIGN & PATTERNS TESTS
# ==========================================
echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}DESIGN & PATTERNS MODULE TESTS${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Test 21: Create Design
echo ""
echo "Test 21: Create Design Pattern"
DESIGN_CREATE=$(curl -s -X POST "$BASE_URL/textile/designs" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "designName": "Floral Print Design",
    "designCategory": "PRINT",
    "designerName": "John Designer",
    "season": "Spring 2025",
    "colorPalette": ["#FF5733", "#33FF57", "#3357FF"],
    "status": "CONCEPT",
    "isActive": true
  }')

DESIGN_ID=$(echo $DESIGN_CREATE | jq -r '.data.designId')
[ "$DESIGN_ID" != "null" ] && print_test 0 "Create design pattern" || print_test 1 "Create design pattern"

# Test 22: Get All Designs
echo "Test 22: Get All Designs"
DESIGNS_LIST=$(curl -s -X GET "$BASE_URL/textile/designs" \
  -H "Authorization: Bearer $TOKEN")
DESIGN_COUNT=$(echo $DESIGNS_LIST | jq -r '.data | length')
[ "$DESIGN_COUNT" -gt 0 ] && print_test 0 "Get all designs" || print_test 1 "Get all designs"

# Test 23: Get Design by ID
echo "Test 23: Get Design by ID"
DESIGN_DETAIL=$(curl -s -X GET "$BASE_URL/textile/designs/$DESIGN_ID" \
  -H "Authorization: Bearer $TOKEN")
DESIGN_NAME=$(echo $DESIGN_DETAIL | jq -r '.data.designName')
DESIGN_ACTIVE=$(echo $DESIGN_DETAIL | jq -r '.data.isActive')
[ "$DESIGN_NAME" == "Floral Print Design" ] && [ "$DESIGN_ACTIVE" == "true" ] && print_test 0 "Get design by ID (with isActive)" || print_test 1 "Get design by ID (with isActive)"

# Test 24: Update Design
echo "Test 24: Update Design"
DESIGN_UPDATE=$(curl -s -X PUT "$BASE_URL/textile/designs/$DESIGN_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "designName": "Updated Floral Print Design",
    "designCategory": "PRINT",
    "designerName": "Jane Designer",
    "season": "Summer 2025",
    "colorPalette": ["#FF5733", "#33FF57", "#3357FF", "#F0F000"],
    "status": "APPROVED",
    "isActive": true
  }')
UPDATED_DESIGN=$(echo $DESIGN_UPDATE | jq -r '.data.designName')
[ "$UPDATED_DESIGN" == "Updated Floral Print Design" ] && print_test 0 "Update design" || print_test 1 "Update design"

# Test 25: Delete Design
echo "Test 25: Delete Design"
DESIGN_DELETE=$(curl -s -X DELETE "$BASE_URL/textile/designs/$DESIGN_ID" \
  -H "Authorization: Bearer $TOKEN")
DELETE_MSG=$(echo $DESIGN_DELETE | jq -r '.message')
[ "$DELETE_MSG" == "Design deleted successfully" ] && print_test 0 "Delete design" || print_test 1 "Delete design"

# ==========================================
# FINAL SUMMARY
# ==========================================
echo ""
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo "========================================="

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi
