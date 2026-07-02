import { test, expect } from '../src/fixtures/baseFixture.ts';
import { InventoryPage } from '../src/pages/InventoryPage.ts';

test.describe('Product Catalogue & Performance Diagnostics', () => {

  test('Should bypass login screen using storageState injection', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/inventory.html');
    
    const inventory = new InventoryPage(authenticatedPage);
    await expect(inventory.productGrid).toBeVisible();
  });

  /**
   * TASK B LEAD REQUIREMENT: performance_glitch_user verification.
   * This account experiences an artificial 5-second server-side degradation.
   * We apply an explicit 6000ms threshold (5000ms bottleneck + 1000ms network buffer)
   * to guarantee the framework handles strict performance SLAs reliably.
   */
  test('Catalog should load within acceptable SLA under performance degradation', async ({ loginPage, page }) => {
    await page.goto('/');
    await loginPage.loginWithCredentials('performance_glitch_user', 'secret_sauce');
    
    const inventory = new InventoryPage(page);
    
    await expect(inventory.productGrid).toBeVisible({ timeout: 6000 });
  });
});
