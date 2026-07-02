import { Locator, Page } from '@playwright/test';

/**
 * Handles all structural UI mappings and interactions for the Cart 
 * and multi-step Checkout workflows.
 */
export class CartPage {
  private readonly page: Page;
  
  // Header badge elements
  public readonly cartBadge: Locator;
  private readonly cartIcon: Locator;
  
  // Checkout journey buttons
  private readonly checkoutButton: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly finishButton: Locator;
  
  // Order completion elements
  public readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Explicit mappings using SauceDemo's consistent data-test attributes
    this.cartIcon = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  /**
   * Enters the cart page explicitly from the application header view.
   */
  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }

  /**
   * Progresses from the shopping cart review screen into the user data forms.
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Fills out the requested customer details to progress past checkout step 1.
   */
  async fillCustomerInformation(firstName: string, lastName: string, zipCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(zipCode);
    await this.continueButton.click();
  }

  /**
   * Confirms the order summary to trigger final application purchase state.
   */
  async completePurchase(): Promise<void> {
    await this.finishButton.click();
  }
}
