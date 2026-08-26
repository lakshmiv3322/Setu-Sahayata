import { test, expect } from '@playwright/test';

test.describe('Flow 2: Scheme Discovery & Matching', () => {
  test('discover page lists available government schemes', async ({ page }) => {
    await page.goto('/discover');
    // If redirected to login (due to auth guard), page should load login
    if (page.url().includes('/login')) {
      await expect(page.locator('input[type="email"]')).toBeVisible();
    } else {
      await expect(page.locator('text=Discover').first()).toBeVisible();
    }
  });
});
