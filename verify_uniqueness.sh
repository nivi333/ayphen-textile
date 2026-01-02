#!/usr/bin/env bash

BASE_URL="http://localhost:3000/api/v1"
CONTENT_TYPE="Content-Type: application/json"
TIMESTAMP=$(date +%s)

echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "verify_'${TIMESTAMP}'@test.com",
    "password": "Password123!",
    "firstName": "Verify",
    "lastName": "User",
    "phone": "+91'${TIMESTAMP}'",
    "hasConsentedToTerms": true,
    "hasConsentedToPrivacy": true,
    "hasConsentedToCookies": true
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.tokens.accessToken')
if [ "$TOKEN" == "null" ]; then echo "Failed to get token"; exit 1; fi

echo "2. Creating Company..."
COMPANY_NAME="Verify Co ${TIMESTAMP}"
COMPANY_RESPONSE=$(curl -s -X POST "$BASE_URL/companies" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "'"$COMPANY_NAME"'",
    "slug": "verify-co-'${TIMESTAMP}'",
    "industry": "TEXTILE_MANUFACTURING",
    "country": "India",
    "establishedDate": "2020-01-01",
    "businessType": "PRIVATE_LIMITED",
    "defaultLocation": "Head Office",
    "addressLine1": "1 Main St",
    "city": "Mumbai",
    "state": "MH",
    "contactInfo": "{\"email\": \"contact@verify.com\", \"phone\": \"+919876543210\"}"
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.data.id')
if [ "$COMPANY_ID" == "null" ]; then echo "Failed to create company: $COMPANY_RESPONSE"; exit 1; fi

echo "3. Switching to Company..."
SWITCH_RESPONSE=$(curl -s -X POST "$BASE_URL/companies/$COMPANY_ID/switch" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN")
COMPANY_TOKEN=$(echo $SWITCH_RESPONSE | jq -r '.data.tokens.accessToken')
if [ "$COMPANY_TOKEN" == "null" ]; then echo "Failed to switch company"; exit 1; fi

test_duplicate() {
  local ENTITY=$1
  local ENDPOINT=$2
  local PAYLOAD=$3
  
  echo "Testing $ENTITY uniqueness..."
  echo "Creating first $ENTITY..."
  RESP1=$(curl -s -X POST "$BASE_URL$ENDPOINT" -H "$CONTENT_TYPE" -H "Authorization: Bearer $COMPANY_TOKEN" -d "$PAYLOAD")
  ID=$(echo $RESP1 | jq -r '.data.id')
  
  if [ "$ID" == "null" ] && [ "$ENTITY" != "Company" ]; then # Company already created
     echo "Failed to create first $ENTITY: $RESP1"
     return 1
  fi
  
  echo "Creating duplicate $ENTITY..."
  RESP2=$(curl -s -X POST "$BASE_URL$ENDPOINT" -H "$CONTENT_TYPE" -H "Authorization: Bearer $COMPANY_TOKEN" -d "$PAYLOAD")
  
  if echo "$RESP2" | grep -q "already exists\|duplicate"; then
    echo "SUCCESS: $ENTITY duplicate validation passed!"
  else
    echo "FAILURE: $ENTITY duplicate validation FAILED. Response: $RESP2"
  fi
}

# Payload variables
LOC_PAYLOAD='{
  "name": "Duplicate Loc",
  "locationType": "BRANCH",
  "country": "India",
  "addressLine1": "Addr",
  "city": "City",
  "state": "State",
  "pincode": "123456",
  "isActive": true
}'

PROD_PAYLOAD='{
  "name": "Duplicate Product",
  "description": "Desc",
  "unitOfMeasure": "PCS",
  "productType": "FINISHED_GOODS",
  "costPrice": 100,
  "sellingPrice": 150,
  "stockQuantity": 10,
  "reorderLevel": 5,
  "isActive": true
}'

CUST_PAYLOAD='{
  "name": "Duplicate Customer",
  "customerType": "INDIVIDUAL",
  "email": "cust@dup.com",
  "phone": "+919876543212",
  "billingCountry": "India",
  "billingCity": "City",
  "billingState": "State",
  "billingAddressLine1": "Addr",
  "paymentTerms": "NET_30",
  "currency": "INR"
}'

SUPP_PAYLOAD='{
  "name": "Duplicate Supplier",
  "supplierType": "MANUFACTURER",
  "email": "supp@dup.com",
  "phone": "+919876543213",
  "country": "India",
  "addressLine1": "Addr",
  "city": "City",
  "state": "State",
  "postalCode": "123456",
  "paymentTerms": "NET_30",
  "currency": "INR",
  "isActive": true
}'

test_duplicate "Location" "/locations" "$LOC_PAYLOAD"
test_duplicate "Product" "/products" "$PROD_PAYLOAD"
test_duplicate "Customer" "/companies/$COMPANY_ID/customers" "$CUST_PAYLOAD"
test_duplicate "Supplier" "/companies/$COMPANY_ID/suppliers" "$SUPP_PAYLOAD"
