import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async login(username: string, password: string): Promise<void> {
    await this.page.getByTestId('sign-in-link').click();
    await this.page.getByRole('button', { name: 'Login' }).click();
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Log in' }).click();
    await this.page.waitForSelector('text=Welcome', { timeout: 10_000 });
  }
}
