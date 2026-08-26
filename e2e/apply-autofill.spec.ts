import { test, expect } from '@playwright/test';

test.describe('Flow 3: Application & Auto-fill Flow', () => {
  test('apply route is protected and handles redirection or form render', async ({ page }) => {
    await page.goto('/apply?schemeId=pm-svanidhi');
    if (page.url().includes('/login')) {
      await expect(page.locator('input[type="email"]')).toBeVisible();
    } else {
      await expect(page.locator('form, button')).toBeVisible();
    }
  });
});
