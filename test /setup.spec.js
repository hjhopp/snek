const { test, expect } = require('@playwright/test');

test.describe("Setting up Snek", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('');
    });

    test('homepage has Snek in title', async ({ page }) => {
        await expect(page).toHaveTitle(/Snek/);
    });
});
