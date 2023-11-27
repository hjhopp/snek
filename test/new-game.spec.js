import { test, expect } from "@playwright/test";

import wait from "./util/wait";

test.describe("New Game", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("");
    });

    test("Clicking new game creates a new snek and game id and removes the gameover overlay", async ({ page }) => {
        const { 
            snek   : prevSnek,
            gameId : prevGameId
        } = await page.evaluate(() => state);

        const gameover = await page.locator(".gameover");
        
        await wait(5000);

        await expect(gameover).toBeVisible();
        await page.click("[data-test=new-game]");

        const {
            snek   : nextSnek,
            gameId : nextGameId
        } = await page.evaluate(() => state);

        await expect(prevSnek.id).not.toEqual(nextSnek.id);
        await expect(prevGameId).not.toEqual(nextGameId);
        await expect(gameover).not.toBeVisible();
    });
});