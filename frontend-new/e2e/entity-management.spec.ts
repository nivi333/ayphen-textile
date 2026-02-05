import { test, expect } from '@playwright/test';

// Common test data
const TEST_USER = {
  email: 'admin_autotest@example.com',
  password: 'Test@123',
  phone: '9998887776',
};

const COMPANY_NAME = 'AutoTest Textiles';

test.describe('Entity Management - Add and Edit Flows', () => {
  let uniqueId: string;

  test.setTimeout(300000); // 5 minutes for the whole suite

  test.beforeAll(async ({ browser }) => {
    uniqueId = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    console.log(`Ensuring prerequisites with uniqueId: ${uniqueId}`);
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Ensure User exists
      await page.goto('/register');
      await page.fill('input[placeholder*="Full Name"]', 'Auto Test User');
      await page.fill('input[placeholder*="Email"]', TEST_USER.email);
      await page.fill('input[name="phone"]', TEST_USER.phone);
      await page.fill('input[placeholder*="Password"]', TEST_USER.password);
      await page.click('button:has-text("Create Account")');
      // Wait for navigation or conflict toast
      await Promise.race([
        page.waitForURL('**/login', { timeout: 10000 }),
        page.waitForSelector('text=already exists', { timeout: 10000 }),
      ]).catch(() => console.log('Registration skipped (already exists or slow)'));

      // Ensure Company exists
      await page.goto('/login');
      await page.fill('#emailOrPhone', TEST_USER.email);
      await page.fill('#password', TEST_USER.password);
      await page.click('button:has-text("Sign In")');
      await page.waitForURL('**/companies', { timeout: 20000 });

      const noCompanies = await page.locator('text=No companies yet').isVisible();
      if (noCompanies || !(await page.locator(`text=${COMPANY_NAME}`).first().isVisible())) {
        console.log('No companies found. Creating default company...');
        await page.click('button:has-text("Add Company")');
        await page.fill('input[name="name"]', COMPANY_NAME);
        await page.fill('input[name="slug"]', `autotest-${uniqueId}`);
        await page.click('[data-testid="industry-select"]');
        await page.click('[data-testid="industry-textile"]');
        await page.click('[data-testid="country-select"]');
        await page.click('[data-testid="country-india"]');
        await page.fill('input[name="defaultLocation"]', 'Main Plant');
        await page.fill('input[name="addressLine1"]', '123 Tech Park');
        await page.fill('input[name="city"]', 'Erode');
        await page.fill('input[name="state"]', 'Tamil Nadu');
        await page.fill('input[name="pincode"]', '638001');
        await page.click('[data-testid="business-type-select"]');
        await page.click('[data-testid="type-manufacturer"]');
        await page.click('[data-testid="established-date-picker"]', { force: true });
        await page.waitForSelector('[data-slot="calendar"]', { state: 'visible', timeout: 10000 });
        await page.locator('[data-slot="calendar"] button[data-day]').first().click();
        await page.fill('input[name="contactInfo"]', 'admin@autotest.com');
        await page.click('button:has-text("Create Company")');
        await page.waitForURL('**/dashboard', { timeout: 30000 });
        console.log('Prerequisite company created.');
      } else {
        console.log('Prerequisite company already exists.');
      }
    } catch (e) {
      console.log('Prerequisite setup failed (possibly already exists). Continuing to tests...');
    } finally {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    console.log(`Starting beforeEach for test with uniqueId: ${uniqueId}`);

    // Add listeners for easier debugging
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('[CompaniesListPage]')) {
        console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
      }
    });

    await page.goto('/login');
    await page.fill('#emailOrPhone', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button:has-text("Sign In")');

    // Wait for /companies OR /dashboard
    await page.waitForURL(
      url => url.pathname.includes('/companies') || url.pathname.includes('/dashboard'),
      { timeout: 30000 }
    );

    if (page.url().includes('/companies')) {
      console.log('On companies page. Waiting for list...');
      // Wait for loader to hide
      await page
        .waitForSelector('text=Loading companies...', { state: 'hidden', timeout: 15000 })
        .catch(() => {});

      const companyToClick = page.locator(`text=${COMPANY_NAME}`).first();
      // Try to find by text first, then by data-testid
      try {
        if (await companyToClick.isVisible({ timeout: 5000 })) {
          console.log(`Found company "${COMPANY_NAME}" by text. Clicking...`);
          await companyToClick.click();
        } else {
          console.log('Company name by text not found, trying data-testid="company-row"...');
          const firstRow = page.locator('[data-testid="company-row"]').first();
          await firstRow.waitFor({ state: 'visible', timeout: 10000 });
          await firstRow.click();
        }
      } catch (e) {
        console.log('Failed to click company row. Content:', await page.content());
        throw e;
      }
    }

    try {
      await page.waitForURL('**/dashboard', { timeout: 30000 });
      console.log('Navigated to dashboard successfully.');
    } catch (e) {
      console.log(`Failed to reach dashboard. Current URL: ${page.url()}`);
      throw e;
    }
  });

  test('should add and edit a customer', async ({ page }) => {
    console.log('Running: should add and edit a customer');
    await page.goto('/customers');
    await page.click('button:has-text("Add Customer")');
    const name = `Cust ${uniqueId}`;
    await page.fill('input[name="name"]', name);

    // Select Customer Type
    await page.click('[data-testid="customer-type-select"]');
    await page.click('[data-testid="type-business"]');
    await page.fill('input[name="companyName"]', `${name} Corp`);

    // Select Customer Category
    await page.click('[data-testid="customer-category-select"]');
    await page.click('[data-testid="category-regular"]');

    await page.fill('input[name="email"]', `cust${uniqueId}@test.com`);
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="billingAddressLine1"]', '123 Main St');
    await page.fill('input[name="billingCity"]', 'Textile City');

    // Wait for button to be enabled and click
    const createBtn = page.locator('button:has-text("Create Customer")');
    await createBtn.waitFor({ state: 'visible' });
    await expect(createBtn).toBeEnabled({ timeout: 10000 });
    await createBtn.click();

    // Wait for sheet to close
    await expect(page.locator('dialog')).not.toBeVisible({ timeout: 15000 });

    // Search for newly created customer and verify it appears
    await page.fill('input[placeholder*="Search"]', name);
    await page.waitForTimeout(1000); // Wait for search to filter
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 15000 });

    console.log('Customer created successfully.');

    // Edit - clear search first
    await page.fill('input[placeholder*="Search"]', '');
    await page.locator('[data-testid="customer-actions"]').first().click();
    await page.click('text=Edit');
    const updatedName = `${name} Updated`;
    await page.fill('input[name="name"]', updatedName);
    const updateBtn = page.locator('button:has-text("Update Customer")');
    await expect(updateBtn).toBeEnabled({ timeout: 10000 });
    await updateBtn.click();

    // Wait for dialog to close and verify updated name in table
    await expect(page.locator('dialog')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text=${updatedName}`)).toBeVisible({ timeout: 10000 });
    console.log('Customer updated successfully.');
  });

  test('should add and edit a supplier', async ({ page }) => {
    console.log('Running: should add and edit a supplier');
    await page.goto('/suppliers');
    await page.click('button:has-text("Add Supplier")');
    const name = `Supp ${uniqueId}`;
    await page.fill('input[name="name"]', name);

    // Select Supplier Type
    await page.click('[data-testid="supplier-type-select"]');
    await page.click('[data-testid="type-manufacturer"]');

    // Select Supplier Category
    await page.click('[data-testid="supplier-category-select"]');
    await page.click('[data-testid="category-regular"]');

    await page.fill('input[name="email"]', `supp${uniqueId}@test.com`);
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="addressLine1"]', '456 Supplier Ave');
    await page.click('button:has-text("Create Supplier")');
    await expect(page.locator('text=Supplier created successfully')).toBeVisible();
    console.log('Supplier created successfully.');

    // Edit
    await page.fill('input[placeholder*="Search"]', name);
    await page.locator('[data-testid="supplier-actions"]').first().click();
    await page.click('text=Edit');
    await page.fill('input[name="name"]', `${name} Updated`);
    await page.click('button:has-text("Update Supplier")');
    await expect(page.locator('text=Supplier updated successfully')).toBeVisible();
    console.log('Supplier updated successfully.');
  });

  test('should add and edit a product', async ({ page }) => {
    console.log('Running: should add and edit a product');
    await page.goto('/products');
    await page.click('button:has-text("Add Product")');
    const name = `Prod ${uniqueId}`;
    await page.fill('input[name="name"]', name);

    // Select Product Type
    await page.click('[data-testid="product-type-select"]');
    await page.click('[data-testid="type-own-manufacture"]');

    // Select UOM
    await page.click('[data-testid="uom-select"]');
    await page.click('[data-testid="uom-pcs"]');

    await page.fill('input[name="costPrice"]', '50');
    await page.fill('input[name="sellingPrice"]', '100');
    await page.click('button:has-text("Create Product")');
    await expect(page.locator('text=Product created successfully')).toBeVisible();
    console.log('Product created successfully.');

    // Edit
    await page.fill('input[placeholder*="Search"]', name);
    await page.locator('[data-testid="product-actions"]').first().click();
    await page.click('text=Edit');
    await page.fill('input[name="name"]', `${name} Updated`);
    await page.click('button:has-text("Update Product")');
    await expect(page.locator('text=Product updated successfully')).toBeVisible();
    console.log('Product updated successfully.');
  });

  test('should add and edit a location', async ({ page }) => {
    console.log('Running: should add and edit a location');
    await page.goto('/locations');
    await page.click('button:has-text("Add Location")');
    const name = `Loc ${uniqueId}`;
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="addressLine1"]', 'Plant A');
    await page.fill('input[name="city"]', 'Erode');
    await page.click('button:has-text("Create Location")');
    await expect(page.locator('text=Location created successfully')).toBeVisible();
    console.log('Location created successfully.');

    // Edit
    await page.fill('input[placeholder*="Search"]', name);
    // Note: Assuming location table has data-testid="location-actions" (standardized earlier)
    await page.locator('[data-testid="location-actions"]').first().click();
    await page.click('text=Edit');
    await page.fill('input[name="name"]', `${name} Updated`);
    await page.click('button:has-text("Update Location")');
    await expect(page.locator('text=Location updated successfully')).toBeVisible();
    console.log('Location updated successfully.');
  });

  test('should create a sales order', async ({ page }) => {
    console.log('Running: should create a sales order');
    await page.goto('/orders');
    await page.click('button:has-text("Add Sales Order")');

    // Select Customer
    await page.click('button:has-text("Select customer")');
    await page.fill('input[placeholder*="Search"]', `Cust ${uniqueId}`);
    await page.click(`text=Cust ${uniqueId}`);

    // Select Location
    await page.click('button:has-text("Select shipping location")');
    await page.click(`text=Main Plant`);

    // Add Item
    await page.click('button:has-text("Add Item")');
    await page.click('button:has-text("Select product")');
    await page.fill('input[placeholder*="Search"]', `Prod ${uniqueId}`);
    await page.click(`text=Prod ${uniqueId}`);

    await page.fill('input[name="items.0.quantity"]', '10');
    await page.fill('input[name="items.0.unitPrice"]', '120');

    await page.click('button:has-text("Create Order")');
    await expect(page.locator('text=Order created successfully')).toBeVisible();
    console.log('Sales Order created successfully.');
  });

  test('should create a bill', async ({ page }) => {
    console.log('Running: should create a bill');
    await page.goto('/bills');
    await page.click('button:has-text("Add Bill")');

    // Select Supplier
    await page.click('button:has-text("Select supplier")');
    await page.fill('input[placeholder*="Search"]', `Supp ${uniqueId}`);
    await page.click(`text=Supp ${uniqueId}`);

    // Select Location
    await page.click('button:has-text("Select storage location")');
    await page.click(`text=Main Plant`);

    // Add Item
    await page.click('button:has-text("Add Item")');
    await page.click('button:has-text("Select product")');
    await page.fill('input[placeholder*="Search"]', `Prod ${uniqueId}`);
    await page.click(`text=Prod ${uniqueId}`);

    await page.fill('input[name="items.0.quantity"]', '20');
    await page.fill('input[name="items.0.unitCost"]', '45');

    await page.click('button:has-text("Create Bill")');
    // The Bill creator has a reload, so we might miss the toast if it's too fast,
    // but usually toast shows before reload or session ends.
    await expect(page.locator('text=Bill created successfully')).toBeVisible();
    console.log('Bill created successfully.');
  });
});
