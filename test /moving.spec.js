import { test, expect } from "@playwright/test";

test.describe("Moving", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("");

        // I hate this, but it doesn't seem like there's an easy way for PW
        // to see window events
        await page.evaluate(() => {
            window.fired = 0;

            window.addEventListener("snekmoved", () => {
                window.fired++;
            });
        });
    });

    test("Using arrow keys fires a snek moved event", async ({ page }) => {
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowLeft");

        const fired = await page.evaluate(() => window.fired);

        await expect(fired).toBe(4);
     });

     test("Using WASD keys fires a snek moved event", async({ page }) => {
        await page.keyboard.press("CapsLock");
        await page.keyboard.press("W");
        await page.keyboard.press("A");
        await page.keyboard.press("S");
        await page.keyboard.press("D");

        const fired = await page.evaluate(() => window.fired);

        await expect(fired).toBe(4);
     });

     test("Using wasd keys fires a snek moved event", async({ page }) => {
        await page.keyboard.press("w");
        await page.keyboard.press("a");
        await page.keyboard.press("s");
        await page.keyboard.press("d");

        const fired = await page.evaluate(() => window.fired);

        await expect(fired).toBe(4);
     });
});
