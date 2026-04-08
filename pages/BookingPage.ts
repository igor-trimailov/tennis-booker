import { expect, Locator, Page } from '@playwright/test';

type WaitForSlotAvailabilityOptions = {
  bookingDate: string;
  timeSlotStartTime: string;
  timeSlotEndTime: string;
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

  getTimeSlotContainers(timeSlotStartTime: string, timeSlotEndTime: string): Locator {
    return this.page.locator(
      `div[data-system-start-time="${timeSlotStartTime}"][data-system-end-time="${timeSlotEndTime}"]`
    );
  }

  getAvailableTimeSlotForDate(
    bookingDate: string,
    timeSlotStartTime: string,
    timeSlotEndTime: string
  ): Locator {
    // Why: `data-test-id` contains UUID + date + start time. Suffix match keeps us stable when UUIDs change.
    return this.getAvailableTimeSlotsForDate(bookingDate, timeSlotStartTime, timeSlotEndTime).first();
  }

  getAvailableTimeSlotsForDate(
    bookingDate: string,
    timeSlotStartTime: string,
    timeSlotEndTime: string
  ): Locator {
    return this.getTimeSlotContainers(timeSlotStartTime, timeSlotEndTime).locator(
      `a[data-test-id$="|${bookingDate}|${timeSlotStartTime}"]:has-text("Book at")`
    );
  }

  getUnavailableTimeSlotsForDate(
    bookingDate: string,
    timeSlotStartTime: string,
    timeSlotEndTime: string
  ): Locator {
    // Why: "Booked" is the explicit terminal state where another user has already claimed this slot.
    return this.getTimeSlotContainers(timeSlotStartTime, timeSlotEndTime)
      .locator(`a[data-test-id$="|${bookingDate}|${timeSlotStartTime}"]:has-text("Booked")`);
  }

  async waitForTimeSlotAvailability(options: WaitForSlotAvailabilityOptions): Promise<Locator> {
    const {
      bookingDate,
      timeSlotStartTime,
      timeSlotEndTime,
      pollIntervalMs = 30_000,
      maxWaitMs = 30 * 60 * 1000,
      reloadTimeoutMs = 120_000,
    } = options;

    const loopDeadline = Date.now() + maxWaitMs;
    const timeSlotContainers = this.getTimeSlotContainers(timeSlotStartTime, timeSlotEndTime);
    const availableTimeSlots = this.getAvailableTimeSlotsForDate(
      bookingDate,
      timeSlotStartTime,
      timeSlotEndTime
    );
    const unavailableTimeSlots = this.getUnavailableTimeSlotsForDate(
      bookingDate,
      timeSlotStartTime,
      timeSlotEndTime
    );

    let attempt = 1;
    while (Date.now() < loopDeadline) {
      await timeSlotContainers.first().waitFor({ state: 'visible', timeout: 30_000 });

      const totalTimeSlots = await timeSlotContainers.count();
      const availableTimeSlotCount = await availableTimeSlots.count();
      const unavailableTimeSlotCount = await unavailableTimeSlots.count();

      if (totalTimeSlots === 0) {
        throw new Error(`No time slots found for ${timeSlotStartTime}-${timeSlotEndTime}.`);
      }

      if (availableTimeSlotCount > 0) {
        const availableTimeSlot = availableTimeSlots.first();
        await expect(availableTimeSlot).toBeVisible();
        console.log(`Time slot is available on attempt ${attempt}.`);
        return availableTimeSlot;
      }

      if (unavailableTimeSlotCount === totalTimeSlots) {
        throw new Error(`All time slots for ${timeSlotStartTime}-${timeSlotEndTime} are unavailable.`);
      }

      console.log(`Attempt ${attempt}: time slots not yet available, reloading in 30 seconds...`);
      // Why: fixed polling cadence avoids hammering the site but still reacts quickly when slots open.
      await this.page.waitForTimeout(pollIntervalMs);
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: reloadTimeoutMs });
      attempt += 1;
    }

    throw new Error(
      `Timed out waiting for time slot ${timeSlotStartTime}-${timeSlotEndTime} to become available.`
    );
  }

  async bookWhenAvailable(
    options: WaitForSlotAvailabilityOptions & { stepTimeoutMs?: number }
  ): Promise<void> {
    // Why: follow-up modals can appear slowly; explicit step timeout gives a clear failure reason.
    const { stepTimeoutMs = 3 * 60 * 1000 } = options;
    const availableTimeSlot = await this.waitForTimeSlotAvailability(options);

    await availableTimeSlot.click();
    console.log('Clicked available time slot.');

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
