import { test, expect } from "@playwright/test";

import wait from "./util/wait";

test.describe("Game over", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("");
    });

    test("Game over overlay not visible when game starts", async ({ page }) => {
        await expect(page.locator(".gameover")).not.toBeVisible();
    });

    test("Game over overlay visible with game fails", async ({ page }) => {
        // let the game fail
        await wait(5000);

        await expect(page.locator(".gameover")).toBeVisible();
    });
});