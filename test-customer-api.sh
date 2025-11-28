#!/bin/bash

# Test Customer API endpoints
echo "Testing Customer API endpoints..."

# Base URL
BASE_URL="http://localhost:3000/api/v1"

# Test 1: Create a customer
echo "1. Creating a customer..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "customerType": "BUSINESS",
    "companyName": "Test Company Ltd",
    "primaryContactPerson": "John Doe",
    "email": "test@example.com",
    "phone": "+1234567890",
    "billingCity": "New York",
    "billingCountry": "United States",
    "currency": "USD",
    "paymentTerms": "NET_30"
  }')

echo "Create Response: $CREATE_RESPONSE"

# Extract customer ID from response
CUSTOMER_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')
echo "Customer ID: $CUSTOMER_ID"

# Test 2: Get all customers
echo -e "\n2. Getting all customers..."
GET_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL/customers")
echo "Get All Response: $GET_ALL_RESPONSE"

# Test 3: Get customer by ID
if [ "$CUSTOMER_ID" != "null" ] && [ "$CUSTOMER_ID" != "" ]; then
  echo -e "\n3. Getting customer by ID..."
  GET_BY_ID_RESPONSE=$(curl -s -X GET "$BASE_URL/customers/$CUSTOMER_ID")
  echo "Get by ID Response: $GET_BY_ID_RESPONSE"

  # Test 4: Update customer
  echo -e "\n4. Updating customer..."
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/customers/$CUSTOMER_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Updated Test Customer",
      "creditLimit": 50000,
      "notes": "Updated customer notes"
    }')
  echo "Update Response: $UPDATE_RESPONSE"

  # Test 5: Delete customer
  echo -e "\n5. Deleting customer..."
  DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/customers/$CUSTOMER_ID")
  echo "Delete Response: $DELETE_RESPONSE"
else
  echo "Failed to create customer or extract ID"
fi

echo -e "\nCustomer API tests completed!"
