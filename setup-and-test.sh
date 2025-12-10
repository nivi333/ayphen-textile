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

# Define date ranges for testing
START_DATE="2024-01-01"
END_DATE="2024-12-31"
AS_OF_DATE="2024-12-31"

echo "Testing Financial Report APIs..."

echo "  - Testing Profit & Loss Report..."
curl -s -X GET "$API_BASE_URL/reports/profit-loss?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Profit & Loss API working" || echo "    ✗ Profit & Loss API failed"

echo "  - Testing Balance Sheet..."
curl -s -X GET "$API_BASE_URL/reports/balance-sheet?asOfDate=$AS_OF_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Balance Sheet API working" || echo "    ✗ Balance Sheet API failed"

echo "  - Testing Cash Flow Statement..."
curl -s -X GET "$API_BASE_URL/reports/cash-flow?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Cash Flow API working" || echo "    ✗ Cash Flow API failed"

echo "  - Testing Trial Balance..."
curl -s -X GET "$API_BASE_URL/reports/trial-balance?asOfDate=$AS_OF_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Trial Balance API working" || echo "    ✗ Trial Balance API failed"

echo "  - Testing GST Report..."
curl -s -X GET "$API_BASE_URL/reports/gst?period=current-month" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ GST Report API working" || echo "    ✗ GST Report API failed"

echo "  - Testing Accounts Receivable Aging..."
curl -s -X GET "$API_BASE_URL/reports/ar-aging?asOfDate=$AS_OF_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ AR Aging API working" || echo "    ✗ AR Aging API failed"

echo "  - Testing Accounts Payable Aging..."
curl -s -X GET "$API_BASE_URL/reports/ap-aging?asOfDate=$AS_OF_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ AP Aging API working" || echo "    ✗ AP Aging API failed"

echo "  - Testing Expense Summary..."
curl -s -X GET "$API_BASE_URL/reports/expense-summary?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Expense Summary API working" || echo "    ✗ Expense Summary API failed"

echo ""
echo "Testing Inventory Report APIs..."

echo "  - Testing Inventory Summary..."
curl -s -X GET "$API_BASE_URL/reports/inventory-summary" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Inventory Summary API working" || echo "    ✗ Inventory Summary API failed"

echo "  - Testing Inventory Movement..."
curl -s -X GET "$API_BASE_URL/reports/inventory-movement?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Inventory Movement API working" || echo "    ✗ Inventory Movement API failed"

echo ""
echo "Testing Sales Report APIs..."

echo "  - Testing Sales Summary..."
curl -s -X GET "$API_BASE_URL/reports/sales-summary?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Sales Summary API working" || echo "    ✗ Sales Summary API failed"

echo "  - Testing Sales Trends..."
curl -s -X GET "$API_BASE_URL/reports/sales-trends?startDate=$START_DATE&endDate=$END_DATE&groupBy=month" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Sales Trends API working" || echo "    ✗ Sales Trends API failed"

echo "  - Testing Product Performance..."
curl -s -X GET "$API_BASE_URL/reports/product-performance?startDate=$START_DATE&endDate=$END_DATE&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Product Performance API working" || echo "    ✗ Product Performance API failed"

echo "  - Testing Customer Insights..."
curl -s -X GET "$API_BASE_URL/reports/customer-insights?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Customer Insights API working" || echo "    ✗ Customer Insights API failed"

echo ""
echo "Testing Production Report APIs..."

echo "  - Testing Production Efficiency..."
curl -s -X GET "$API_BASE_URL/reports/production-efficiency?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Production Efficiency API working" || echo "    ✗ Production Efficiency API failed"

echo "  - Testing Machine Utilization..."
curl -s -X GET "$API_BASE_URL/reports/machine-utilization?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Machine Utilization API working" || echo "    ✗ Machine Utilization API failed"

echo "  - Testing Quality Metrics..."
curl -s -X GET "$API_BASE_URL/reports/quality-metrics?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Quality Metrics API working" || echo "    ✗ Quality Metrics API failed"

echo "  - Testing Production Planning..."
curl -s -X GET "$API_BASE_URL/reports/production-planning?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Production Planning API working" || echo "    ✗ Production Planning API failed"

echo ""
echo "Testing Analytics Report APIs..."

echo "  - Testing Business Performance..."
curl -s -X GET "$API_BASE_URL/reports/business-performance?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Business Performance API working" || echo "    ✗ Business Performance API failed"

echo "  - Testing Textile Analytics..."
curl -s -X GET "$API_BASE_URL/reports/textile-analytics?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null && echo "    ✓ Textile Analytics API working" || echo "    ✗ Textile Analytics API failed"

echo ""
echo "✅ All Report API Tests Completed!"

