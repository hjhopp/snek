"use strict";

const { test, expect } = require("@playwright/test");

test.describe("Moving", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("");
    });

    test.only("Using arrow keys fires a snek moved event", async ({ page }) => {
        let fired = 0;

        await page.on("snekmoved", () => {
            fired++;
        });

        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowLeft");

        await expect(fired).toBe(4);
     });

     test("Using WASD keys fires a snek moved event", async({ page }) => {

     });

     test("Using wasd keys fires a snek moved event", async({ page }) => {

     });
});
