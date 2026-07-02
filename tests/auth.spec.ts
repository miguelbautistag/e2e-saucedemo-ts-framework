import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage.ts';

test.describe('SauceDemo Login Security & Access Controls', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  // 1. This test handles the 'setup' project requirement and builds the global cache
  test('Valid credentials should successfully redirect user and cache session state', async ({ page, context }) => {
    await loginPage.loginWithCredentials('standard_user', 'secret_sauce');
    
    // Validate that the login handshake completed successfully
    await expect(page).toHaveURL(/.*inventory.html/);
    
    // CRITICAL STAFF PRACICE: Serialize the cookies and storage state to disk.
    // Because this test is marked as a dependency in playwright.config.ts,
    // this file is guaranteed to populate before downstream tests run.
    await context.storageState({ path: 'auth/standard_user.json' });
  });

  // 2. This is a standard negative test. It will run in the setup block but won't alter the cache
  test('Locked out user should be denied access and see a precise security banner error', async () => {
    await loginPage.loginWithCredentials('locked_out_user', 'secret_sauce');
    
    const errorText = await loginPage.getErrorMessage();
    
    expect(errorText).toContain('Epic sadface: Sorry, this user has been locked out.');
  });
});
