#!/bin/bash

# Inventory and Sales Reports API Test Script
# This script tests all report endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000/api"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test an endpoint
test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected_status="${3:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    echo "Endpoint: $endpoint"
    
    # Make the request
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Check status code
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ Status Code: $http_code${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Check if response has data
        if echo "$body" | grep -q '"success":true'; then
            echo -e "${GREEN}✓ Response has success:true${NC}"
        else
            echo -e "${YELLOW}⚠ Response doesn't have success:true${NC}"
        fi
        
        # Show summary of response
        if echo "$body" | grep -q '"summary"'; then
            echo -e "${GREEN}✓ Response contains summary data${NC}"
        fi
    else
        echo -e "${RED}✗ Status Code: $http_code (expected $expected_status)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Response: $body" | head -5
    fi
}

echo "=========================================="
echo "  Inventory & Sales Reports API Tests"
echo "=========================================="

# Date range for testing
START_DATE="2024-01-01"
END_DATE="2024-12-31"

echo -e "\n${YELLOW}=== INVENTORY REPORTS ===${NC}"

# 1. Inventory Summary Report
test_endpoint \
    "Inventory Summary Report" \
    "/reports/inventory-summary" \
    401  # Expecting 401 without auth token

# 2. Inventory Movement Report  
test_endpoint \
    "Inventory Movement Report" \
    "/reports/inventory-movement?startDate=$START_DATE&endDate=$END_DATE" \
    401

# 3. Low Stock Report
test_endpoint \
    "Low Stock Report" \
    "/reports/low-stock" \
    401

# 4. Stock Valuation Report
test_endpoint \
    "Stock Valuation Report" \
    "/reports/stock-valuation" \
    401

echo -e "\n${YELLOW}=== SALES REPORTS ===${NC}"

# 5. Sales Summary Report
test_endpoint \
    "Sales Summary Report" \
    "/reports/sales-summary?startDate=$START_DATE&endDate=$END_DATE" \
    401

# 6. Sales Trends Report
test_endpoint \
    "Sales Trends Report (Month)" \
    "/reports/sales-trends?startDate=$START_DATE&endDate=$END_DATE&groupBy=month" \
    401

test_endpoint \
    "Sales Trends Report (Week)" \
    "/reports/sales-trends?startDate=$START_DATE&endDate=$END_DATE&groupBy=week" \
    401

# 7. Product Performance Report
test_endpoint \
    "Product Performance Report" \
    "/reports/product-performance?startDate=$START_DATE&endDate=$END_DATE" \
    401

echo -e "\n=========================================="
echo -e "  Test Results Summary"
echo -e "=========================================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo -e "=========================================="

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! ✓${NC}"
    echo -e "${YELLOW}Note: All endpoints correctly require authentication (401)${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed! ✗${NC}"
    exit 1
fi
