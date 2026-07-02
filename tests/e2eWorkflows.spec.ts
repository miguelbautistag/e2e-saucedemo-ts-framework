import { test, expect } from '../src/fixtures/baseFixture.ts';
import { InventoryPage } from '../src/pages/InventoryPage.ts';
import { CartPage } from '../src/pages/CartPage.ts';

test.describe('SauceDemo E2E Core Business Workflows', () => {

  test('Should handle addition of items to cart and check out successfully', async ({ authenticatedPage }) => {
    // Navigate straight past login into the authenticated workspace context
    await authenticatedPage.goto('/inventory.html');
    
    const inventory = new InventoryPage(authenticatedPage);
    const cart = new CartPage(authenticatedPage);

    // Act: Selection of structural item configurations
    await inventory.addBackpackToCart();
    await expect(cart.cartBadge).toHaveText('1');

    // Act: Move dynamically into the data form views
    await cart.goToCart();
    await cart.proceedToCheckout();
    
    // Act: Finalize check steps
    await cart.fillCustomerInformation('Miguel', 'Bautista', '12345');
    await cart.completePurchase();

    // Assert: Verify order success header matches the core target confirmation state
    await expect(cart.completeHeader).toHaveText('Thank you for your order!');
  });

  test('Should allow an authenticated user to explicitly log out of the storefront', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/inventory.html');
    
    const inventory = new InventoryPage(authenticatedPage);
    await inventory.executeLogout();

    // Assert: Destruction of session context should land user back cleanly on the index login page
    await expect(authenticatedPage).toHaveURL('https://www.saucedemo.com/');
  });
});
