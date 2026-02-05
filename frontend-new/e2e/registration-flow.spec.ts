import { test, expect } from '@playwright/test';

test.describe('Complete Registration Flow', () => {
  test('should complete registration → login → company creation → dashboard flow', async ({
    page,
  }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill Registration Form
    await expect(page.locator('h1')).toContainText('Create Account');

    const uniqueId = Date.now();
    const uniqueEmail = `test${uniqueId}@example.com`;
    const companyName = `Test Company ${uniqueId}`;

    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#emailOrPhone', uniqueEmail);
    await page.fill('#password', 'Test@123');
    await page.fill('#confirmPassword', 'Test@123');

    // Accept terms
    await page.check('input[type="checkbox"]');

    // Submit
    await page.click('button:has-text("Create Account")');

    // Wait for redirect to login page
    await page.waitForURL('**/login', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Welcome');

    // Step 2: Login with the new account
    await page.fill('#emailOrPhone', uniqueEmail);
    await page.fill('#password', 'Test@123');
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to company selection/creation page
    await page.waitForURL('**/companies', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Select Company');

    // Check if we need to create a company
    const noCompanies = await page.isVisible('text=No companies yet');
    if (noCompanies) {
      await page.click('button:has-text("Add Company")');
      await page.fill('input[name="name"]', companyName);
      // Wait for industry select - checking if it uses name or id
      await page.selectOption('select[name="industry"]', 'textile');
      await page.click('button:has-text("Create")');
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    } else {
      // If there are companies (unlikely for a new user but possible in shared DB), pick first
      await page.click('[data-testid="company-row"]:first-child');
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    }

    // Verify dashboard loaded
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/register');

    // Try to submit without filling required fields
    await page.click('button:has-text("Create Account")');

    // Should show validation errors from RegisterPage.tsx
    await expect(page.locator('text=Please input your first name!')).toBeVisible();
    await expect(page.locator('text=Please input your last name!')).toBeVisible();
    await expect(page.locator('text=Invalid email or phone')).toBeVisible();
    await expect(page.locator('text=Please input your password!')).toBeVisible();
    await expect(page.locator('text=Please accept the terms and conditions')).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');

    // Try weak password
    await page.fill('#password', '1234567');
    await page.fill('#confirmPassword', '1234567');

    // Trigger validation
    await page.click('button:has-text("Create Account")');

    // Should show password strength error
    await expect(page.locator('text=Password must be at least 8 characters long')).toBeVisible();
  });
});
