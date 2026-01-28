import { test, expect } from '@playwright/test';

test.describe('Login and Navigation Flow', () => {
  test('should login → select company → navigate to all modules', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill login credentials
    await page.fill('input[name="identifier"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    // Wait for company selection page
    await page.waitForURL('**/companies', { timeout: 5000 });
    
    // Select a company
    await page.click('[data-testid="company-row"]:first-child');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Navigate to Products
    await page.click('a[href="/products"]');
    await page.waitForURL('**/products');
    await expect(page.locator('h1')).toContainText('Products');
    
    // Navigate to Inventory
    await page.click('a[href="/inventory"]');
    await page.waitForURL('**/inventory');
    await expect(page.locator('h1')).toContainText('Inventory');
    
    // Navigate to Machines
    await page.click('a[href="/machines"]');
    await page.waitForURL('**/machines');
    await expect(page.locator('h1')).toContainText('Machines');
    
    // Navigate to Orders
    await page.click('a[href="/orders"]');
    await page.waitForURL('**/orders');
    await expect(page.locator('h1')).toContainText('Orders');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="identifier"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 3000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email or phone is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should switch between companies', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="identifier"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/companies');
    await page.click('[data-testid="company-row"]:first-child');
    await page.waitForURL('**/dashboard');
    
    // Open company switcher
    await page.click('[data-testid="company-switcher"]');
    
    // Select different company
    await page.click('[data-testid="company-option"]:nth-child(2)');
    
    // Should reload dashboard with new company context
    await expect(page.locator('[data-testid="current-company"]')).toBeVisible();
  });

  test('should persist navigation state', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="identifier"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/companies');
    await page.click('[data-testid="company-row"]:first-child');
    await page.waitForURL('**/dashboard');
    
    // Navigate to products
    await page.click('a[href="/products"]');
    await page.waitForURL('**/products');
    
    // Refresh page
    await page.reload();
    
    // Should still be on products page
    await expect(page).toHaveURL(/.*products/);
    await expect(page.locator('h1')).toContainText('Products');
  });
});
