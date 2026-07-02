import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage.ts';
import * as path from 'path';

// ESM safe relative reference resolution
const AUTH_STATE_PATH = path.resolve('auth/standard_user.json');

setup('Authenticate standard_user and cache session state securely', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // CRITICAL FIX: Pass fully qualified domain to bypass project context configurations
  await page.goto('https://www.saucedemo.com');
  await loginPage.loginWithCredentials('standard_user', 'secret_sauce');

  // CRITICAL SYNCHRONIZATION GATE: Guard persistence until navigation satisfies truth conditions
  await page.waitForURL(/.*inventory.html/);

  // Write out the validated cookie and local storage snapshot once
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
