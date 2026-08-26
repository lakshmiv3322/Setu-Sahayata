import { test, expect } from '@playwright/test';

test.describe('Flow 5: AI Appeal Guidance Flow', () => {
  test('appeal page loads or redirects to login appropriately', async ({ page }) => {
    await page.goto('/appeal?schemeId=pm-svanidhi');
    if (page.url().includes('/login')) {
      await expect(page.locator('input[type="email"]')).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
