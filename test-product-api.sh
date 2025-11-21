#!/bin/bash

# Test Product Management APIs
# Base URL
BASE_URL="http://localhost:3000/api/v1"

echo "=== Testing Product Management APIs ==="
echo ""

# Step 1: Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Test@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.tokens.accessToken')
COMPANY_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.companyId // empty')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Creating test user..."
  
  # Register new user
  REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "password": "Test@123"
    }')
  
  TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.tokens.accessToken')
  echo "✅ User registered successfully"
fi

echo "✅ Logged in successfully"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get or create company
if [ -z "$COMPANY_ID" ] || [ "$COMPANY_ID" == "null" ]; then
  echo "2. Creating test company..."
  COMPANY_RESPONSE=$(curl -s -X POST "$BASE_URL/companies" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Test Textile Company",
      "industry": "Textile Manufacturing",
      "country": "India",
      "addressLine1": "123 Test Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "establishedDate": "2020-01-01",
      "businessType": "Manufacturing",
      "defaultLocation": "Head Office",
      "contactInfo": {"phone": "+91-9876543210"}
    }')
  
  COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.data.id')
  echo "✅ Company created: $COMPANY_ID"
  
  # Switch to company context
  SWITCH_RESPONSE=$(curl -s -X POST "$BASE_URL/companies/$COMPANY_ID/switch" \
    -H "Authorization: Bearer $TOKEN")
  
  TOKEN=$(echo $SWITCH_RESPONSE | jq -r '.data.tokens.accessToken')
  echo "✅ Switched to company context"
fi

echo ""

# Step 3: Create product category
echo "3. Creating product category..."
CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/products/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Cotton Fabric",
    "description": "High quality cotton fabrics"
  }')

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.data.id')
echo "Response: $CATEGORY_RESPONSE"
echo ""

# Step 4: Create product
echo "4. Creating product..."
PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoryId": "'"$CATEGORY_ID"'",
    "name": "Premium Cotton Fabric",
    "description": "100% pure cotton fabric, 60s count",
    "material": "Cotton",
    "color": "White",
    "size": "60 inches width",
    "weight": 150.5,
    "unitOfMeasure": "MTR",
    "costPrice": 250.00,
    "sellingPrice": 350.00,
    "stockQuantity": 1000,
    "reorderLevel": 100,
    "barcode": "CTN-FAB-001",
    "specifications": {
      "threadCount": "60s",
      "width": "60 inches",
      "gsm": "150"
    }
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.data.id')
echo "Response: $PRODUCT_RESPONSE"
echo ""

# Step 5: Get products list
echo "5. Getting products list..."
PRODUCTS_LIST=$(curl -s -X GET "$BASE_URL/products?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PRODUCTS_LIST"
echo ""

# Step 6: Get product by ID
if [ "$PRODUCT_ID" != "null" ] && [ -n "$PRODUCT_ID" ]; then
  echo "6. Getting product by ID..."
  PRODUCT_DETAIL=$(curl -s -X GET "$BASE_URL/products/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response: $PRODUCT_DETAIL"
  echo ""
  
  # Step 7: Update product
  echo "7. Updating product..."
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/products/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "sellingPrice": 375.00,
      "reorderLevel": 150
    }')
  
  echo "Response: $UPDATE_RESPONSE"
  echo ""
  
  # Step 8: Adjust stock
  echo "8. Adjusting stock (ADD 500 units)..."
  STOCK_RESPONSE=$(curl -s -X POST "$BASE_URL/products/$PRODUCT_ID/stock-adjustment" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "adjustmentType": "ADD",
      "quantity": 500,
      "reason": "New stock received",
      "notes": "Purchase order PO-001",
      "adjustedBy": "Test User"
    }')
  
  echo "Response: $STOCK_RESPONSE"
  echo ""
  
  # Step 9: Get categories
  echo "9. Getting product categories..."
  CATEGORIES_LIST=$(curl -s -X GET "$BASE_URL/products/categories" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response: $CATEGORIES_LIST"
  echo ""
fi

echo "=== Product API Testing Complete ==="
