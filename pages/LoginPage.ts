import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async login(username: string, password: string): Promise<void> {
    await this.page.getByTestId('sign-in-link').click();
    await this.page.getByRole('button', { name: 'Login' }).click();
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Log in' }).click();
    // Why: this confirms we are authenticated and have returned from SSO to the booking page shell.
    await expect(this.page.locator('#account-bar')).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByTestId('sign-in-link')).toBeHidden({ timeout: 30_000 });
  }
}
