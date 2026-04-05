import { test, expect } from '@playwright/test';
const { addDays, format } = require('date-fns');

test('login to tennis booking website', async ({ page }) => {
  // Load environment variables
  const baseBookingUrl = process.env.TENNIS_BOOKING_URL;
  const username = process.env.TENNIS_USERNAME;
  const password = process.env.TENNIS_PASSWORD;

  if (!baseBookingUrl) {
    throw new Error('TENNIS_BOOKING_URL is not set in .env file');
  }

  if (!username || !password) {
    throw new Error('TENNIS_USERNAME and TENNIS_PASSWORD must be set in .env file');
  }

  // Calculate booking date: today + 7 days
  const bookingDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  const bookingUrl = baseBookingUrl + bookingDate;

  // Navigate to the tennis booking website
  await page.goto(bookingUrl);

  // Basic check - ensure the page loaded
  await expect(page).toHaveTitle(/Eastville Park/);

  // Click sign in link
  await page.getByTestId('sign-in-link').click();

  // In new page, click login button
  
  await page.getByRole('button', { name: 'Login' }).click();

  // Fill in credentials
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByPlaceholder('Password').fill(password);

  // Submit login
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for login to complete - adjust selector based on what appears after login
  await page.waitForLoadState('networkidle');



  // Verify login success - adjust this based on what indicates successful login
  // For example, check for a logout button or user profile element
  // await expect(page.getByText('Welcome')).toBeVisible();

  console.log('Login completed successfully');
});