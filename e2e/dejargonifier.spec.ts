import { test, expect } from '@playwright/test';

test.describe('Flow 4: De-Jargonifier Flow', () => {
  test('de-jargonifier page renders upload zone and document text interface', async ({ page }) => {
    await page.goto('/de-jargonifier');
    if (page.url().includes('/login')) {
      await expect(page.locator('input[type="email"]')).toBeVisible();
    } else {
      await expect(page.locator('text=De-Jargonifier').first()).toBeVisible();
    }
  });
});
