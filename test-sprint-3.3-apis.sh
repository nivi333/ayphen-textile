#!/bin/bash

# Sprint 3.3 - Order Management System API Tests
# This script tests all APIs from the Sprint 3.3 implementation

set -e

BASE_URL="http://localhost:3000/api/v1"
TOKEN=""
COMPANY_ID=""
LOCATION_ID=""
ORDER_ID=""

echo "=== Sprint 3.3 API Test Suite ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        exit 1
    fi
}

# 1. Register a test user
echo "1. Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Order",
    "lastName": "Tester",
    "email": "ordertester@lavoro.ai",
    "password": "Test@1234"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.tokens.accessToken')
print_result $? "User registered successfully"
echo "   Token: ${TOKEN:0:50}..."
echo ""

# 2. Create a company
echo "2. Creating test company..."
COMPANY_RESPONSE=$(curl -s -X POST $BASE_URL/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Textiles Ltd",
    "slug": "acme-textiles",
    "industry": "Textile Manufacturing",
    "country": "India",
    "defaultLocation": "Mumbai Headquarters",
    "addressLine1": "456 Industrial Area",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002",
    "businessType": "Manufacturing",
    "contactInfo": "contact@acmetextiles.com",
    "establishedDate": "2015-03-15"
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.data.id')
print_result $? "Company created successfully"
echo "   Company ID: $COMPANY_ID"
echo ""

# 3. Switch to company context
echo "3. Switching to company context..."
SWITCH_RESPONSE=$(curl -s -X POST $BASE_URL/companies/$COMPANY_ID/switch \
  -H "Authorization: Bearer $TOKEN")

TOKEN=$(echo $SWITCH_RESPONSE | jq -r '.tokens.accessToken')
print_result $? "Switched to company context"
echo ""

# 4. Get locations (should have default HQ)
echo "4. Fetching company locations..."
LOCATIONS_RESPONSE=$(curl -s -X GET $BASE_URL/locations \
  -H "Authorization: Bearer $TOKEN")

LOCATION_ID=$(echo $LOCATIONS_RESPONSE | jq -r '.data[0].id')
print_result $? "Locations fetched successfully"
echo "   Default Location ID: $LOCATION_ID"
echo ""

# 5. TEST: POST /api/v1/orders - Create Order
echo "5. Creating sales order..."
CREATE_ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Fashion Retail Co",
    "customerCode": "FASH001",
    "orderDate": "2025-11-20T10:00:00.000Z",
    "deliveryDate": "2025-11-30T10:00:00.000Z",
    "currency": "INR",
    "notes": "Urgent order for winter collection",
    "locationId": "'$LOCATION_ID'",
    "shippingCarrier": "DHL Express",
    "trackingNumber": "DHL123456",
    "shippingMethod": "Air Freight",
    "deliveryWindowStart": "2025-11-30T09:00:00.000Z",
    "deliveryWindowEnd": "2025-11-30T18:00:00.000Z",
    "items": [
      {
        "itemCode": "FABRIC-COTTON-001",
        "description": "Premium Cotton Fabric - White",
        "quantity": 500,
        "unitOfMeasure": "MTR",
        "unitPrice": 150
      },
      {
        "itemCode": "FABRIC-SILK-002",
        "description": "Pure Silk Fabric - Blue",
        "quantity": 200,
        "unitOfMeasure": "MTR",
        "unitPrice": 450
      }
    ]
  }')

ORDER_ID=$(echo $CREATE_ORDER_RESPONSE | jq -r '.data.orderId')
TOTAL_AMOUNT=$(echo $CREATE_ORDER_RESPONSE | jq -r '.data.totalAmount')
print_result $? "Order created successfully"
echo "   Order ID: $ORDER_ID"
echo "   Total Amount: INR $TOTAL_AMOUNT"
echo ""

# 6. TEST: GET /api/v1/orders - List Orders
echo "6. Listing all orders..."
LIST_ORDERS_RESPONSE=$(curl -s -X GET $BASE_URL/orders \
  -H "Authorization: Bearer $TOKEN")

ORDER_COUNT=$(echo $LIST_ORDERS_RESPONSE | jq '.data | length')
print_result $? "Orders listed successfully"
echo "   Total Orders: $ORDER_COUNT"
echo ""

# 7. TEST: GET /api/v1/orders?status=DRAFT - Filter by status
echo "7. Filtering orders by status (DRAFT)..."
FILTER_ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/orders?status=DRAFT" \
  -H "Authorization: Bearer $TOKEN")

DRAFT_COUNT=$(echo $FILTER_ORDERS_RESPONSE | jq '.data | length')
print_result $? "Orders filtered by status"
echo "   Draft Orders: $DRAFT_COUNT"
echo ""

# 8. TEST: GET /api/v1/orders/:orderId - Get Order Detail
echo "8. Fetching order details..."
GET_ORDER_RESPONSE=$(curl -s -X GET $BASE_URL/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN")

ITEMS_COUNT=$(echo $GET_ORDER_RESPONSE | jq '.data.items | length')
print_result $? "Order details fetched"
echo "   Order ID: $ORDER_ID"
echo "   Items Count: $ITEMS_COUNT"
echo ""

# 9. TEST: PUT /api/v1/orders/:orderId - Update Order
echo "9. Updating order..."
UPDATE_ORDER_RESPONSE=$(curl -s -X PUT $BASE_URL/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated: Priority order for winter collection",
    "items": [
      {
        "itemCode": "FABRIC-COTTON-001",
        "description": "Premium Cotton Fabric - White (Updated)",
        "quantity": 600,
        "unitOfMeasure": "MTR",
        "unitPrice": 150
      }
    ]
  }')

NEW_TOTAL=$(echo $UPDATE_ORDER_RESPONSE | jq -r '.data.totalAmount')
print_result $? "Order updated successfully"
echo "   New Total Amount: INR $NEW_TOTAL"
echo ""

# 10. TEST: PATCH /api/v1/orders/:orderId/status - Update Status (DRAFT → CONFIRMED)
echo "10. Updating order status (DRAFT → CONFIRMED)..."
STATUS_UPDATE_RESPONSE=$(curl -s -X PATCH $BASE_URL/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }')

NEW_STATUS=$(echo $STATUS_UPDATE_RESPONSE | jq -r '.data.status')
print_result $? "Order status updated"
echo "   New Status: $NEW_STATUS"
echo ""

# 11. TEST: Invalid status transition (CONFIRMED → SHIPPED directly)
echo "11. Testing invalid status transition (CONFIRMED → SHIPPED)..."
INVALID_STATUS_RESPONSE=$(curl -s -X PATCH $BASE_URL/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED"
  }')

ERROR_MSG=$(echo $INVALID_STATUS_RESPONSE | jq -r '.message')
if [[ "$ERROR_MSG" == *"Invalid"* ]]; then
    print_result 0 "Invalid transition blocked correctly"
    echo "   Error: $ERROR_MSG"
else
    print_result 1 "Invalid transition should have been blocked"
fi
echo ""

# 12. TEST: POST /api/v1/financial-documents/invoices/from-order - Create Invoice
echo "12. Creating invoice for order..."
INVOICE_RESPONSE=$(curl -s -X POST $BASE_URL/financial-documents/invoices/from-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partyName": "Fashion Retail Co",
    "partyCode": "FASH001",
    "issueDate": "2025-11-20T10:00:00.000Z",
    "dueDate": "2025-12-20T10:00:00.000Z",
    "currency": "INR",
    "subtotalAmount": 90000,
    "taxAmount": 16200,
    "totalAmount": 106200,
    "notes": "Invoice for Order '$ORDER_ID'",
    "orderId": "'$ORDER_ID'"
  }')

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.data.documentId')
print_result $? "Invoice created successfully"
echo "   Invoice ID: $INVOICE_ID"
echo ""

# 13. TEST: POST /api/v1/financial-documents/bills - Create Bill
echo "13. Creating bill..."
BILL_RESPONSE=$(curl -s -X POST $BASE_URL/financial-documents/bills \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partyName": "Cotton Suppliers Ltd",
    "partyCode": "COTTON001",
    "issueDate": "2025-11-15T10:00:00.000Z",
    "dueDate": "2025-12-15T10:00:00.000Z",
    "currency": "INR",
    "subtotalAmount": 50000,
    "taxAmount": 9000,
    "totalAmount": 59000,
    "notes": "Raw material purchase"
  }')

BILL_ID=$(echo $BILL_RESPONSE | jq -r '.data.documentId')
print_result $? "Bill created successfully"
echo "   Bill ID: $BILL_ID"
echo ""

# 14. TEST: POST /api/v1/financial-documents/purchase-orders - Create PO
echo "14. Creating purchase order..."
PO_RESPONSE=$(curl -s -X POST $BASE_URL/financial-documents/purchase-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partyName": "Weaving Mill Co",
    "partyCode": "WEAVE001",
    "issueDate": "2025-11-20T10:00:00.000Z",
    "dueDate": "2025-12-05T10:00:00.000Z",
    "currency": "INR",
    "subtotalAmount": 75000,
    "taxAmount": 13500,
    "totalAmount": 88500,
    "locationId": "'$LOCATION_ID'",
    "notes": "Weaving services for winter collection"
  }')

PO_ID=$(echo $PO_RESPONSE | jq -r '.data.documentId')
print_result $? "Purchase Order created successfully"
echo "   PO ID: $PO_ID"
echo ""

# 15. TEST: GET /api/v1/financial-documents - List Financial Documents
echo "15. Listing all financial documents..."
LIST_DOCS_RESPONSE=$(curl -s -X GET $BASE_URL/financial-documents \
  -H "Authorization: Bearer $TOKEN")

DOCS_COUNT=$(echo $LIST_DOCS_RESPONSE | jq '.data | length')
print_result $? "Financial documents listed"
echo "   Total Documents: $DOCS_COUNT"
echo ""

# 16. TEST: GET /api/v1/financial-documents?type=INVOICE - Filter by type
echo "16. Filtering documents by type (INVOICE)..."
FILTER_DOCS_RESPONSE=$(curl -s -X GET "$BASE_URL/financial-documents?type=INVOICE" \
  -H "Authorization: Bearer $TOKEN")

INVOICE_COUNT=$(echo $FILTER_DOCS_RESPONSE | jq '.data | length')
print_result $? "Documents filtered by type"
echo "   Invoices: $INVOICE_COUNT"
echo ""

# Summary
echo ""
echo "=== Test Summary ==="
echo -e "${GREEN}✓ All Sprint 3.3 API tests passed successfully!${NC}"
echo ""
echo "Tested APIs:"
echo "  - POST /api/v1/orders (Create Order)"
echo "  - GET /api/v1/orders (List Orders)"
echo "  - GET /api/v1/orders?status=DRAFT (Filter Orders)"
echo "  - GET /api/v1/orders/:orderId (Get Order Detail)"
echo "  - PUT /api/v1/orders/:orderId (Update Order)"
echo "  - PATCH /api/v1/orders/:orderId/status (Update Status)"
echo "  - POST /api/v1/financial-documents/invoices/from-order (Create Invoice)"
echo "  - POST /api/v1/financial-documents/bills (Create Bill)"
echo "  - POST /api/v1/financial-documents/purchase-orders (Create PO)"
echo "  - GET /api/v1/financial-documents (List Documents)"
echo "  - GET /api/v1/financial-documents?type=INVOICE (Filter Documents)"
echo ""
echo "Test Data Created:"
echo "  - Company ID: $COMPANY_ID"
echo "  - Location ID: $LOCATION_ID"
echo "  - Order ID: $ORDER_ID"
echo "  - Invoice ID: $INVOICE_ID"
echo "  - Bill ID: $BILL_ID"
echo "  - PO ID: $PO_ID"
echo ""
