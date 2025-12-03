#!/bin/bash

# Comprehensive API Test Script for Lavoro AI Ferri
# Tests all major API endpoints with variable requests

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"
COMPANY_ID="${COMPANY_ID:-}"

# Test Results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper Functions
print_header() {
    echo -e "\n${YELLOW}========================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\nTesting: $description"
    echo "Endpoint: $method $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_success "$description (HTTP $http_code)"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
        return 0
    else
        print_error "$description (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Check prerequisites
if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}ERROR: ACCESS_TOKEN environment variable not set${NC}"
    echo "Please set ACCESS_TOKEN with a valid JWT token"
    echo "Example: export ACCESS_TOKEN='your-jwt-token'"
    exit 1
fi

if [ -z "$COMPANY_ID" ]; then
    echo -e "${RED}ERROR: COMPANY_ID environment variable not set${NC}"
    echo "Please set COMPANY_ID with your company/tenant ID"
    echo "Example: export COMPANY_ID='your-company-id'"
    exit 1
fi

print_header "LAVORO AI FERRI - COMPREHENSIVE API TESTS"
echo "API Base URL: $API_BASE_URL"
echo "Company ID: $COMPANY_ID"

# ============================================
# HEALTH CHECK
# ============================================
print_header "1. HEALTH CHECK"
test_endpoint "GET" "/health" "" "Health check"

# ============================================
# CUSTOMER MANAGEMENT
# ============================================
print_header "2. CUSTOMER MANAGEMENT"

# Create Customer
CUSTOMER_DATA='{
  "name": "Test Customer",
  "customerType": "BUSINESS",
  "companyName": "Test Company Ltd",
  "customerCategory": "REGULAR",
  "email": "test@customer.com",
  "phone": "+1234567890",
  "billingCity": "Mumbai",
  "billingCountry": "India",
  "currency": "INR",
  "paymentTerms": "NET_30"
}'
test_endpoint "POST" "/companies/$COMPANY_ID/customers" "$CUSTOMER_DATA" "Create customer"

# List Customers
test_endpoint "GET" "/companies/$COMPANY_ID/customers?page=1&limit=10" "" "List customers"

# Search Customers
test_endpoint "GET" "/companies/$COMPANY_ID/customers?search=Test" "" "Search customers"

# ============================================
# SUPPLIER MANAGEMENT
# ============================================
print_header "3. SUPPLIER MANAGEMENT"

# Create Supplier
SUPPLIER_DATA='{
  "name": "Test Supplier",
  "supplierType": "MANUFACTURER",
  "email": "test@supplier.com",
  "phone": "+1234567890",
  "city": "Delhi",
  "country": "India",
  "currency": "INR",
  "paymentTerms": "NET_60"
}'
test_endpoint "POST" "/companies/$COMPANY_ID/suppliers" "$SUPPLIER_DATA" "Create supplier"

# List Suppliers
test_endpoint "GET" "/companies/$COMPANY_ID/suppliers?page=1&limit=10" "" "List suppliers"

# ============================================
# PRODUCT MANAGEMENT
# ============================================
print_header "4. PRODUCT MANAGEMENT"

# Create Product
PRODUCT_DATA='{
  "name": "Cotton Fabric",
  "productType": "RAW_MATERIAL",
  "unitOfMeasure": "METERS",
  "costPrice": 100,
  "sellingPrice": 150,
  "stockQuantity": 1000,
  "reorderLevel": 100
}'
test_endpoint "POST" "/products" "$PRODUCT_DATA" "Create product"

# List Products
test_endpoint "GET" "/products?page=1&limit=10" "" "List products"

# Get Product Categories
test_endpoint "GET" "/products/categories" "" "Get product categories"

# ============================================
# TEXTILE OPERATIONS - FABRIC PRODUCTION
# ============================================
print_header "5. FABRIC PRODUCTION"

# Create Fabric Production
FABRIC_DATA='{
  "fabricType": "COTTON",
  "fabricName": "Premium Cotton Fabric",
  "composition": "100% Cotton",
  "weightGsm": 200,
  "widthInches": 60,
  "color": "White",
  "pattern": "Plain",
  "finishType": "Mercerized",
  "quantityMeters": 1000,
  "productionDate": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "batchNumber": "BATCH-001",
  "qualityGrade": "A_GRADE",
  "notes": "Test fabric production"
}'
test_endpoint "POST" "/textile/fabrics" "$FABRIC_DATA" "Create fabric production"

# List Fabric Productions
test_endpoint "GET" "/textile/fabrics" "" "List fabric productions"

# Filter by Fabric Type
test_endpoint "GET" "/textile/fabrics?fabricType=COTTON" "" "Filter fabrics by type"

# Filter by Quality Grade
test_endpoint "GET" "/textile/fabrics?qualityGrade=A_GRADE" "" "Filter fabrics by quality"

# ============================================
# TEXTILE OPERATIONS - YARN MANUFACTURING
# ============================================
print_header "6. YARN MANUFACTURING"

# Create Yarn Manufacturing
YARN_DATA='{
  "yarnType": "COTTON",
  "yarnCount": "40s",
  "twistPerInch": 15.5,
  "ply": 2,
  "color": "Natural",
  "quantityKg": 500,
  "productionDate": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "batchNumber": "YARN-001",
  "processType": "SPINNING",
  "qualityGrade": "A_GRADE",
  "notes": "Test yarn manufacturing"
}'
test_endpoint "POST" "/textile/yarns" "$YARN_DATA" "Create yarn manufacturing"

# List Yarn Manufacturing
test_endpoint "GET" "/textile/yarns" "" "List yarn manufacturing"

# Filter by Yarn Type
test_endpoint "GET" "/textile/yarns?yarnType=COTTON" "" "Filter yarns by type"

# Filter by Process Type
test_endpoint "GET" "/textile/yarns?processType=SPINNING" "" "Filter yarns by process"

# ============================================
# TEXTILE OPERATIONS - DYEING & FINISHING
# ============================================
print_header "7. DYEING & FINISHING"

# Create Dyeing & Finishing
DYEING_DATA='{
  "processType": "DYEING",
  "colorCode": "#FF0000",
  "colorName": "Red",
  "dyeMethod": "Reactive Dyeing",
  "recipeCode": "REC-001",
  "quantityMeters": 800,
  "processDate": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "batchNumber": "DYE-001",
  "machineNumber": "M-01",
  "temperatureC": 80,
  "durationMinutes": 120,
  "qualityCheck": true,
  "colorFastness": "Grade 4",
  "shrinkagePercent": 2.5,
  "notes": "Test dyeing process"
}'
test_endpoint "POST" "/textile/dyeing" "$DYEING_DATA" "Create dyeing & finishing"

# List Dyeing & Finishing
test_endpoint "GET" "/textile/dyeing" "" "List dyeing & finishing"

# Filter by Process Type
test_endpoint "GET" "/textile/dyeing?processType=DYEING" "" "Filter by process type"

# ============================================
# SALES ORDERS
# ============================================
print_header "8. SALES ORDERS"

# List Sales Orders
test_endpoint "GET" "/orders?page=1&limit=10" "" "List sales orders"

# Filter by Status
test_endpoint "GET" "/orders?status=PENDING" "" "Filter orders by status"

# ============================================
# PURCHASE ORDERS
# ============================================
print_header "9. PURCHASE ORDERS"

# List Purchase Orders
test_endpoint "GET" "/purchase-orders?page=1&limit=10" "" "List purchase orders"

# Filter by Status
test_endpoint "GET" "/purchase-orders?status=PENDING" "" "Filter POs by status"

# ============================================
# INVOICES
# ============================================
print_header "10. INVOICES"

# List Invoices
test_endpoint "GET" "/invoices?page=1&limit=10" "" "List invoices"

# Filter by Status
test_endpoint "GET" "/invoices?status=PENDING" "" "Filter invoices by status"

# ============================================
# BILLS
# ============================================
print_header "11. BILLS"

# List Bills
test_endpoint "GET" "/bills?page=1&limit=10" "" "List bills"

# Filter by Status
test_endpoint "GET" "/bills?status=PENDING" "" "Filter bills by status"

# ============================================
# INVENTORY
# ============================================
print_header "12. INVENTORY"

# List Inventory
test_endpoint "GET" "/inventory?page=1&limit=10" "" "List inventory"

# Low Stock Items
test_endpoint "GET" "/inventory?lowStock=true" "" "Get low stock items"

# ============================================
# MACHINES
# ============================================
print_header "13. MACHINES"

# List Machines
test_endpoint "GET" "/machines?page=1&limit=10" "" "List machines"

# Filter by Status
test_endpoint "GET" "/machines?status=OPERATIONAL" "" "Filter machines by status"

# ============================================
# QUALITY CONTROL
# ============================================
print_header "14. QUALITY CONTROL"

# List Quality Inspections
test_endpoint "GET" "/inspections?page=1&limit=10" "" "List quality inspections"

# Filter by Status
test_endpoint "GET" "/inspections?status=PENDING" "" "Filter inspections by status"

# ============================================
# LOCATIONS
# ============================================
print_header "15. LOCATIONS"

# List Locations
test_endpoint "GET" "/locations?page=1&limit=10" "" "List locations"

# Filter Active Locations
test_endpoint "GET" "/locations?isActive=true" "" "Filter active locations"

# ============================================
# TEST SUMMARY
# ============================================
print_header "TEST SUMMARY"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
