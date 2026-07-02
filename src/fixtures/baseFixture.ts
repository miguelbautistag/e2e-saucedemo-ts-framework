import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.ts';
import { InventoryPage } from '../pages/InventoryPage.ts';
import { CartPage } from '../pages/CartPage.ts';

// Explicitly define your Dependency Injection framework graph[cite: 2, 4]
type SauceFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  authenticatedPage: Page;
};

export const test = base.extend<SauceFixtures>({
  // Construct page abstractions automatically upon invocation
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },

  // Pre-hydrated page context. Playwright automatically passes down the correct
  // storageState defined inside your configuration project declarations.
  authenticatedPage: async ({ page }, use) => {
    await use(page);
  }
});

export { expect };
