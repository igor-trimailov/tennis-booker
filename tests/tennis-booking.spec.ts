import { test } from '@playwright/test';
import { BookingPage } from '../pages/BookingPage';
import { LoginPage } from '../pages/LoginPage';
const { addDays, format } = require('date-fns');

test('login to tennis booking website', async ({ page }) => {
  const baseBookingUrl = process.env.TENNIS_BOOKING_URL;
  const username = process.env.TENNIS_USERNAME;
  const password = process.env.TENNIS_PASSWORD;

  if (!baseBookingUrl) {
    throw new Error('TENNIS_BOOKING_URL is not set in .env file');
  }

  if (!username || !password) {
    throw new Error('TENNIS_USERNAME and TENNIS_PASSWORD must be set in .env file');
  }

  const bookingDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  const bookingPage = new BookingPage(page);
  const loginPage = new LoginPage(page);

  await bookingPage.gotoBookingDate(baseBookingUrl, bookingDate);
  await loginPage.login(username, password);

  await bookingPage.bookWhenAvailable({
    bookingDate,
    timeSlotStartTime: '1080',
    timeSlotEndTime: '1140',
    stepTimeoutMs: 3 * 60 * 1000,
  });

  console.log('Booking flow completed.');
});
