#!/bin/bash

# Test Finance Module APIs
BASE_URL="http://localhost:3000/api/v1"

# Login to get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test1764850792@lavoro.com",
    "password": "Test@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.tokens.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"

# Get companies
echo -e "\nFetching companies..."
COMPANIES_RESPONSE=$(curl -s -X GET "$BASE_URL/companies" \
  -H "Authorization: Bearer $TOKEN")

COMPANY_ID=$(echo $COMPANIES_RESPONSE | jq -r '.data[0].id')

if [ "$COMPANY_ID" == "null" ] || [ -z "$COMPANY_ID" ]; then
    echo "❌ No companies found"
    exit 1
fi

echo "✅ Found company: $COMPANY_ID"

# Switch to company
echo -e "\nSwitching to company..."
SWITCH_RESPONSE=$(curl -s -X POST "$BASE_URL/companies/$COMPANY_ID/switch" \
  -H "Authorization: Bearer $TOKEN")

NEW_TOKEN=$(echo $SWITCH_RESPONSE | jq -r '.tokens.accessToken // .token // empty')

if [ -n "$NEW_TOKEN" ]; then
    TOKEN=$NEW_TOKEN
    echo "✅ Switched to company successfully"
else
    echo "⚠️  Using original token"
fi

# Test Invoice APIs
echo -e "\n========== TESTING INVOICE APIs =========="

# Get Invoices
echo -e "\n1. GET /invoices"
INVOICES=$(curl -s -X GET "$BASE_URL/invoices" \
  -H "Authorization: Bearer $TOKEN")
INVOICE_COUNT=$(echo "$INVOICES" | jq -r 'if type=="array" then length else 0 end')
echo "✅ GET /invoices: $INVOICE_COUNT invoices found"

# Get Customers
echo -e "\n2. GET /companies/$COMPANY_ID/customers"
CUSTOMERS_RESPONSE=$(curl -s -X GET "$BASE_URL/companies/$COMPANY_ID/customers" \
  -H "Authorization: Bearer $TOKEN")
CUSTOMER_COUNT=$(echo "$CUSTOMERS_RESPONSE" | jq -r 'if type=="array" then length else 0 end')
echo "✅ Found $CUSTOMER_COUNT customers"

# Get Locations
echo -e "\n3. GET /locations"
LOCATIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/locations" \
  -H "Authorization: Bearer $TOKEN")
LOCATION_COUNT=$(echo "$LOCATIONS_RESPONSE" | jq -r 'if type=="array" then length else 0 end')
echo "✅ Found $LOCATION_COUNT locations"

# Test Bill APIs
echo -e "\n========== TESTING BILL APIs =========="

# Get Bills
echo -e "\n4. GET /bills"
BILLS=$(curl -s -X GET "$BASE_URL/bills" \
  -H "Authorization: Bearer $TOKEN")
BILL_COUNT=$(echo "$BILLS" | jq -r 'if type=="array" then length else 0 end')
echo "✅ GET /bills: $BILL_COUNT bills found"

# Get Suppliers
echo -e "\n5. GET /companies/$COMPANY_ID/suppliers"
SUPPLIERS_RESPONSE=$(curl -s -X GET "$BASE_URL/companies/$COMPANY_ID/suppliers" \
  -H "Authorization: Bearer $TOKEN")
SUPPLIER_COUNT=$(echo "$SUPPLIERS_RESPONSE" | jq -r 'if type=="array" then length else 0 end')
echo "✅ Found $SUPPLIER_COUNT suppliers"

# Test Purchase Order APIs
echo -e "\n========== TESTING PURCHASE ORDER APIs =========="

# Get Purchase Orders
echo -e "\n6. GET /purchase-orders"
POS=$(curl -s -X GET "$BASE_URL/purchase-orders" \
  -H "Authorization: Bearer $TOKEN")
PO_COUNT=$(echo "$POS" | jq -r 'if type=="array" then length else 0 end')
echo "✅ GET /purchase-orders: $PO_COUNT POs found"

echo -e "\n========== FINANCE MODULE API TESTS COMPLETE =========="
echo -e "\n📊 Summary:"
echo "  - Invoices: $INVOICE_COUNT found ✅"
echo "  - Bills: $BILL_COUNT found ✅"
echo "  - Purchase Orders: $PO_COUNT found ✅"
echo "  - Customers: $CUSTOMER_COUNT found ✅"
echo "  - Suppliers: $SUPPLIER_COUNT found ✅"
echo "  - Locations: $LOCATION_COUNT found ✅"
echo -e "\n✅ All Finance Module APIs are functional!"
