import { Locator, Page } from '@playwright/test';

/**
 * Handles all UI interactions on the SauceDemo login screen.
 * Note: Keeps assertions strictly out of this layer to ensure that structural
 * UI changes only break this page object, not the test files themselves.
 */
export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessageContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Using data-test attributes here because they are decoupled from CSS/layout styling.
    // This makes the selectors resilient against future frontend styling changes.
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessageContainer = page.locator('[data-test="error"]');
  }

  /**
   * Navigates to the login page using the baseURL configured in playwright.config.ts.
   */
  async navigateTo(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Encapsulates the complete login interaction sequence.
   */
  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Grabs the raw text contents of the login error message banner.
   * Returns an empty string if no error banner is displayed.
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessageContainer.textContent()) ?? '';
  }
}
