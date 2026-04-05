# Tennis Booker

Automated tennis court booking using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

   The project uses `date-fns` for date manipulation.

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

   **Note**: If your password contains special characters like `#`, wrap it in quotes to prevent it from being treated as a comment.

## Running Tests

- Run all tests: `npm run test:e2e`
- Run in headed mode: `npm run test:e2e:headed`
- Debug mode: `npm run test:e2e:debug`
- UI mode: `npm run test:e2e:ui`
- Generate code: `npm run test:e2e:codegen`

## Date Utilities

The project uses [date-fns](https://date-fns.org/) for date manipulation. Example usage:

```javascript
const { addWeeks, format } = require('date-fns');

const today = new Date();
const nextWeek = addWeeks(today, 1);
const formatted = format(nextWeek, 'yyyy-MM-dd'); // "2026-04-12"
```
