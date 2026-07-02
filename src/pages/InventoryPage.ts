import { Locator, Page } from '@playwright/test';

/**
 * Handles all UI interactions on the core product catalogue screen.
 */
export class InventoryPage {
  private readonly page: Page;
  public readonly productGrid: Locator;
  private readonly addToCartSauceLabsBackpack: Locator;
  private readonly burgerMenuButton: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productGrid = page.locator('[data-test="inventory-container"]');
    this.addToCartSauceLabsBackpack = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  /**
   * Adds the standard backpack item into the active cart session.
   */
  async addBackpackToCart(): Promise<void> {
    await this.addToCartSauceLabsBackpack.click();
  }

  /**
   * Opens the sidebar menu wrapper and selects the explicit logout control.
   */
  async executeLogout(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}
