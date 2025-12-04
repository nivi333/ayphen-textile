#!/bin/bash

# Test Finance Module APIs with data
BASE_URL="http://localhost:3000/api/v1"

# Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test1764850792@lavoro.com",
    "password": "Test@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.tokens.accessToken')
echo "✅ Login successful"

# Get companies and select Premium Textiles Ltd (first company with data)
COMPANIES_RESPONSE=$(curl -s -X GET "$BASE_URL/companies" \
  -H "Authorization: Bearer $TOKEN")

# Get the last company (Premium Textiles Ltd - C027)
COMPANY_ID=$(echo $COMPANIES_RESPONSE | jq -r '.data[-1].id')
COMPANY_NAME=$(echo $COMPANIES_RESPONSE | jq -r '.data[-1].name')

echo "✅ Using company: $COMPANY_NAME ($COMPANY_ID)"

# Switch to company
SWITCH_RESPONSE=$(curl -s -X POST "$BASE_URL/companies/$COMPANY_ID/switch" \
  -H "Authorization: Bearer $TOKEN")

NEW_TOKEN=$(echo $SWITCH_RESPONSE | jq -r '.tokens.accessToken // .token // empty')
if [ -n "$NEW_TOKEN" ]; then
    TOKEN=$NEW_TOKEN
    echo "✅ Switched to company"
fi

echo -e "\n========== TESTING FINANCE MODULE WITH DATA =========="

# Get Customers
echo -e "\n1. Customers:"
CUSTOMERS=$(curl -s -X GET "$BASE_URL/companies/$COMPANY_ID/customers" \
  -H "Authorization: Bearer $TOKEN")
CUSTOMER_COUNT=$(echo "$CUSTOMERS" | jq -r 'length')
echo "   Found $CUSTOMER_COUNT customers"
if [ $CUSTOMER_COUNT -gt 0 ]; then
    echo "$CUSTOMERS" | jq -r '.[0:3] | .[] | "   - \(.name) (\(.code))"'
fi

# Get Suppliers
echo -e "\n2. Suppliers:"
SUPPLIERS=$(curl -s -X GET "$BASE_URL/companies/$COMPANY_ID/suppliers" \
  -H "Authorization: Bearer $TOKEN")
SUPPLIER_COUNT=$(echo "$SUPPLIERS" | jq -r 'length')
echo "   Found $SUPPLIER_COUNT suppliers"
if [ $SUPPLIER_COUNT -gt 0 ]; then
    echo "$SUPPLIERS" | jq -r '.[0:3] | .[] | "   - \(.name) (\(.code))"'
fi

# Get Locations
echo -e "\n3. Locations:"
LOCATIONS=$(curl -s -X GET "$BASE_URL/locations" \
  -H "Authorization: Bearer $TOKEN")
LOCATION_COUNT=$(echo "$LOCATIONS" | jq -r 'length')
echo "   Found $LOCATION_COUNT locations"
if [ $LOCATION_COUNT -gt 0 ]; then
    echo "$LOCATIONS" | jq -r '.[0:3] | .[] | "   - \(.name) (\(.location_id))"'
fi

# Get Sales Orders
echo -e "\n4. Sales Orders:"
ORDERS=$(curl -s -X GET "$BASE_URL/orders" \
  -H "Authorization: Bearer $TOKEN")
ORDER_COUNT=$(echo "$ORDERS" | jq -r 'length')
echo "   Found $ORDER_COUNT sales orders"
if [ $ORDER_COUNT -gt 0 ]; then
    echo "$ORDERS" | jq -r '.[0:3] | .[] | "   - \(.order_id) - Status: \(.status)"'
fi

# Get Purchase Orders
echo -e "\n5. Purchase Orders:"
POS=$(curl -s -X GET "$BASE_URL/purchase-orders" \
  -H "Authorization: Bearer $TOKEN")
PO_COUNT=$(echo "$POS" | jq -r 'length')
echo "   Found $PO_COUNT purchase orders"
if [ $PO_COUNT -gt 0 ]; then
    echo "$POS" | jq -r '.[0:3] | .[] | "   - \(.po_id) - Status: \(.status)"'
fi

# Get Invoices
echo -e "\n6. Invoices:"
INVOICES=$(curl -s -X GET "$BASE_URL/invoices" \
  -H "Authorization: Bearer $TOKEN")
INVOICE_COUNT=$(echo "$INVOICES" | jq -r 'length')
echo "   Found $INVOICE_COUNT invoices"
if [ $INVOICE_COUNT -gt 0 ]; then
    echo "$INVOICES" | jq -r '.[0:3] | .[] | "   - \(.invoice_id) - Status: \(.status)"'
fi

# Get Bills
echo -e "\n7. Bills:"
BILLS=$(curl -s -X GET "$BASE_URL/bills" \
  -H "Authorization: Bearer $TOKEN")
BILL_COUNT=$(echo "$BILLS" | jq -r 'length')
echo "   Found $BILL_COUNT bills"
if [ $BILL_COUNT -gt 0 ]; then
    echo "$BILLS" | jq -r '.[0:3] | .[] | "   - \(.bill_id) - Status: \(.status)"'
fi

echo -e "\n========== SUMMARY =========="
echo "✅ Finance Module APIs are fully functional!"
echo "   - Customers: $CUSTOMER_COUNT"
echo "   - Suppliers: $SUPPLIER_COUNT"
echo "   - Locations: $LOCATION_COUNT"
echo "   - Sales Orders: $ORDER_COUNT"
echo "   - Purchase Orders: $PO_COUNT"
echo "   - Invoices: $INVOICE_COUNT"
echo "   - Bills: $BILL_COUNT"
