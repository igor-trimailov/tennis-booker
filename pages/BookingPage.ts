import { expect, Locator, Page } from '@playwright/test';

type WaitForSlotAvailabilityOptions = {
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  pollIntervalMs?: number;
  maxWaitMs?: number;
  reloadTimeoutMs?: number;
};

export class BookingPage {
  constructor(private readonly page: Page) {}

  async gotoBookingDate(baseBookingUrl: string, bookingDate: string): Promise<void> {
    const bookingUrl = `${baseBookingUrl}#?date=${bookingDate}`;
    console.log(`Navigating to booking page for date ${bookingDate}.`);
    await this.page.goto(bookingUrl);
    await expect(this.page).toHaveTitle(/Eastville Park/);
  }

  getSlotContainer(slotStartTime: string, slotEndTime: string): Locator {
    return this.page.locator(
      `div[data-system-start-time="${slotStartTime}"][data-system-end-time="${slotEndTime}"]`
    );
  }

  getBookingLinkForDate(bookingDate: string, slotStartTime: string, slotEndTime: string): Locator {
    return this.getSlotContainer(slotStartTime, slotEndTime)
      .locator(`a[data-test-id$="|${bookingDate}|${slotStartTime}"]:has-text("Book at")`)
      .first();
  }

  getTakenSessionForDate(bookingDate: string, slotStartTime: string, slotEndTime: string): Locator {
    return this.getSlotContainer(slotStartTime, slotEndTime)
      .locator(`a[data-test-id$="|${bookingDate}|${slotStartTime}"]:has-text("Booked")`)
      .first();
  }

  async waitForSlotAvailability(options: WaitForSlotAvailabilityOptions): Promise<Locator> {
    const {
      bookingDate,
      slotStartTime,
      slotEndTime,
      pollIntervalMs = 30_000,
      maxWaitMs = 30 * 60 * 1000,
      reloadTimeoutMs = 120_000,
    } = options;

    const loopDeadline = Date.now() + maxWaitMs;
    const slot = this.getSlotContainer(slotStartTime, slotEndTime).first();
    const bookingLink = this.getBookingLinkForDate(bookingDate, slotStartTime, slotEndTime);
    const takenSession = this.getTakenSessionForDate(bookingDate, slotStartTime, slotEndTime);

    let attempt = 1;
    while (Date.now() < loopDeadline) {
      await slot.waitFor({ state: 'visible', timeout: 30_000 });

      if ((await takenSession.count()) > 0) {
        throw new Error(`Slot ${slotStartTime}-${slotEndTime} is already booked by someone else.`);
      }

      if ((await bookingLink.count()) > 0) {
        await expect(bookingLink).toBeVisible();
        console.log(`Slot is now available on attempt ${attempt}.`);
        return bookingLink;
      }

      console.log(`Attempt ${attempt}: slot unavailable, reloading in 30 seconds...`);
      await this.page.waitForTimeout(pollIntervalMs);
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: reloadTimeoutMs });
      attempt += 1;
    }

    throw new Error(`Timed out waiting for slot ${slotStartTime}-${slotEndTime} to become available.`);
  }

  async bookWhenAvailable(
    options: WaitForSlotAvailabilityOptions & { stepTimeoutMs?: number }
  ): Promise<void> {
    const { stepTimeoutMs = 3 * 60 * 1000 } = options;
    const bookingLink = await this.waitForSlotAvailability(options);

    await bookingLink.click();
    console.log('Clicked available booking slot.');

    const continueBookingButton = this.page.locator('button#submit-booking');
    await continueBookingButton.waitFor({ state: 'visible', timeout: stepTimeoutMs });
    await continueBookingButton.click();
    console.log('Clicked Continue booking.');

    const confirmButton = this.page.locator('button#paynow');
    await confirmButton.waitFor({ state: 'visible', timeout: stepTimeoutMs });
    await confirmButton.click();
    console.log('Clicked Confirm.');
  }
}
