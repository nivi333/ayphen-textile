import { test, expect } from '@playwright/test';

test.describe('Complete Registration Flow', () => {
  test('should complete registration → company creation → dashboard flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Step 1: Personal Information
    await expect(page.locator('h2')).toContainText('Personal Information');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', '+1234567890');
    await page.click('button:has-text("Next")');
    
    // Step 2: Account Security
    await expect(page.locator('h2')).toContainText('Account Security');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.fill('input[name="confirmPassword"]', 'Test123!@#');
    await page.click('button:has-text("Next")');
    
    // Step 3: Terms and Conditions
    await expect(page.locator('h2')).toContainText('Terms');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Complete Registration")');
    
    // Wait for redirect to company selection/creation page
    await page.waitForURL('**/companies', { timeout: 5000 });
    
    // Create company
    await page.click('button:has-text("Create Company")');
    await page.fill('input[name="name"]', 'Ayphen Textile');
    await page.selectOption('select[name="industry"]', 'textile');
    await page.fill('input[name="location"]', 'Mumbai, India');
    await page.click('button:has-text("Create")');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Verify dashboard loaded
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="stat-total-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-revenue"]')).toBeVisible();
  });

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/register');
    
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');
    
    // Should show validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');
    
    // Fill personal info
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.click('button:has-text("Next")');
    
    // Try weak password
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    
    // Should show password strength error
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should navigate back through registration steps', async ({ page }) => {
    await page.goto('/register');
    
    // Fill step 1
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.click('button:has-text("Next")');
    
    // Go back
    await page.click('button:has-text("Back")');
    
    // Verify data is preserved
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe');
  });
});
