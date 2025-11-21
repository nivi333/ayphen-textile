// Using native fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000/api/v1';
let token = '';
let companyId = '';
let categoryId = '';
let productId = '';

async function testProductAPIs() {
  console.log('=== Testing Product Management APIs ===\n');

  try {
    // Step 1: Register user
    console.log('1. Registering user...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Product',
        lastName: 'Test',
        email: `product.test.${Date.now()}@example.com`,
        password: 'Test@123'
      })
    });
    const registerData = await registerRes.json();
    token = registerData.tokens.accessToken;
    console.log('✅ User registered\n');

    // Step 2: Create company
    console.log('2. Creating company...');
    const companyRes = await fetch(`${BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: `Test Textile ${Date.now()}`,
        industry: 'Textile Manufacturing',
        country: 'India',
        addressLine1: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        establishedDate: '2020-01-01',
        businessType: 'Manufacturing',
        defaultLocation: 'Head Office',
        contactInfo: '+91-9876543210'
      })
    });
    const companyData = await companyRes.json();
    companyId = companyData.data.id;
    console.log(`✅ Company created: ${companyId}\n`);

    // Step 3: Switch to company context
    console.log('3. Switching to company context...');
    const switchRes = await fetch(`${BASE_URL}/companies/${companyId}/switch`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const switchData = await switchRes.json();
    token = switchData.data.tokens.accessToken;
    console.log('✅ Switched to company context\n');

    // Step 4: Create product category
    console.log('4. Creating product category...');
    const categoryRes = await fetch(`${BASE_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Cotton Fabric',
        description: 'High quality cotton fabrics'
      })
    });
    const categoryData = await categoryRes.json();
    console.log('Category Response:', JSON.stringify(categoryData, null, 2));
    
    if (categoryData.success) {
      categoryId = categoryData.data.id;
      console.log(`✅ Category created: ${categoryId}\n`);
    } else {
      console.log('❌ Category creation failed\n');
    }

    // Step 5: Create product
    console.log('5. Creating product...');
    const productRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        categoryId: categoryId || undefined,
        name: 'Premium Cotton Fabric',
        description: '100% pure cotton fabric, 60s count',
        material: 'Cotton',
        color: 'White',
        size: '60 inches width',
        weight: 150.5,
        unitOfMeasure: 'MTR',
        costPrice: 250.00,
        sellingPrice: 350.00,
        stockQuantity: 1000,
        reorderLevel: 100,
        barcode: 'CTN-FAB-001',
        specifications: {
          threadCount: '60s',
          width: '60 inches',
          gsm: '150'
        }
      })
    });
    const productData = await productRes.json();
    console.log('Product Response:', JSON.stringify(productData, null, 2));
    
    if (productData.success) {
      productId = productData.data.id;
      console.log(`✅ Product created: ${productId}\n`);
    } else {
      console.log('❌ Product creation failed\n');
      return;
    }

    // Step 6: Get products list
    console.log('6. Getting products list...');
    const listRes = await fetch(`${BASE_URL}/products?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    console.log('Products List:', JSON.stringify(listData, null, 2));
    console.log(`✅ Found ${listData.data?.length || 0} products\n`);

    // Step 7: Get product by ID
    console.log('7. Getting product by ID...');
    const detailRes = await fetch(`${BASE_URL}/products/${productId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const detailData = await detailRes.json();
    console.log('Product Detail:', JSON.stringify(detailData, null, 2));
    console.log('✅ Product details retrieved\n');

    // Step 8: Update product
    console.log('8. Updating product...');
    const updateRes = await fetch(`${BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sellingPrice: 375.00,
        reorderLevel: 150
      })
    });
    const updateData = await updateRes.json();
    console.log('Update Response:', JSON.stringify(updateData, null, 2));
    console.log('✅ Product updated\n');

    // Step 9: Adjust stock
    console.log('9. Adjusting stock (ADD 500 units)...');
    const stockRes = await fetch(`${BASE_URL}/products/${productId}/stock-adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        adjustmentType: 'ADD',
        quantity: 500,
        reason: 'New stock received',
        notes: 'Purchase order PO-001',
        adjustedBy: 'Product Test'
      })
    });
    const stockData = await stockRes.json();
    console.log('Stock Adjustment Response:', JSON.stringify(stockData, null, 2));
    console.log('✅ Stock adjusted\n');

    // Step 10: Get categories
    console.log('10. Getting product categories...');
    const categoriesRes = await fetch(`${BASE_URL}/products/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categoriesData = await categoriesRes.json();
    console.log('Categories:', JSON.stringify(categoriesData, null, 2));
    console.log(`✅ Found ${categoriesData.data?.length || 0} categories\n`);

    console.log('=== All Product API Tests Completed Successfully! ===');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testProductAPIs();
