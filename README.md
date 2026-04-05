# Tennis Booker

Automated tennis court booking using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npm run test:e2e:install
   ```

3. Configure your credentials in `.env`:
   ```env
   TENNIS_BOOKING_URL=https://clubspark.lta.org.uk/eastvillepark/
   TENNIS_USERNAME=your_username
   TENNIS_PASSWORD="your_password"
   HEADLESS=false
   ```

## Running Tests

- Run all tests: `npm run test:e2e`
- Run in headed mode: `npm run test:e2e:headed`
- Debug mode: `npm run test:e2e:debug`
- UI mode: `npm run test:e2e:ui`
- Generate code: `npm run test:e2e:codegen`
