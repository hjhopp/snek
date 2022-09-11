"use strict";

import { test, expect } from "@playwright/test";

test.describe("Setting up Snek", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("");
    });

    test("homepage has Snek in title", async ({ page }) => {
        await expect(page).toHaveTitle(/Snek/);
    });

    test("Game has a logo", async ({ page }) => {
        const logo = await page.locator("h1");

        await expect(logo).toHaveCount(1);
    });

    test("Game has a board", async ({ page }) => {
        const board = await page.locator("div.board");

        await expect(board).toHaveCount(1);
    });

    test("Fud is placed", async ({ page }) => {
        const fud = await page.locator("[data-type=fud]");

        await expect(fud).toHaveCount(1);
    });

    test("Snek is placed and is length 4", async ({ page }) => {
        const snek = await page.locator("[data-type=snek]");

        await expect(snek).toHaveCount(4);
    });
});
