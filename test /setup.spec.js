// @ts-check
const { test, expect } = require('@playwright/test');

test('homepage has Snek in title', async ({ page }) => {
  await page.goto('');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Snek/);
});
