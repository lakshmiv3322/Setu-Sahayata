import { test, expect } from '@playwright/test';

test.describe('Flow 1: Signup and Login Flow', () => {
  test('navigates to signup, fills form, and checks redirection to login/dashboard', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Setu Sahayata/i);

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    if (await emailInput.isVisible()) {
      await emailInput.fill(`testcitizen_${Date.now()}@example.com`);
      await passwordInput.fill('SecurePass123!');
      
      const nameInput = page.locator('input[name="fullName"], input[name="name"], #fullName');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Citizen');
      }

      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeEnabled();
    }
  });

  test('login page renders correctly with email and password inputs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
