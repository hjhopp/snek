import { test, expect } from "@playwright/test";

async function pressKeysAndReturnFired ({ page, keys }) {
    await Promise.all(keys.map((key) => page.keyboard.press(key)));

    return page.evaluate(() => window.fired);
}

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
        const fired = await pressKeysAndReturnFired({
            page,
            keys : [
                "ArrowUp",
                "ArrowRight",
                "ArrowDown",
                "ArrowLeft"
            ]
        });

        await expect(fired).toBe(4);
     });

     test("Using WASD keys fires a snek moved event", async({ page }) => {
        const fired = await pressKeysAndReturnFired({
            page,
            keys : [
                "CapsLock",
                "W",
                "A",
                "S",
                "D"
            ]
        });

        await expect(fired).toBe(4);
     });

     test("Using wasd keys fires a snek moved event", async({ page }) => {
        const fired = await pressKeysAndReturnFired({
            page,
            keys : [
                "w",
                "a",
                "s",
                "d"
            ]
        });

        await expect(fired).toBe(4);
     });

     test("Going 'up' moves the snek head up", async ({ page }) => {
        await page.keyboard.press("ArrowUp");

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBe(prevX);
        await expect(y).toBeLessThan(prevY);
     });

     test("Going 'left' moves snek head left", async ({ page }) => {
        await page.keyboard.press("ArrowLeft");

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBeLessThan(prevX);
        await expect(y).toBe(prevY);
     });

     test("Going 'right' moves snek head right", async ({ page }) => {
        await page.keyboard.press("ArrowRight");

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBeGreaterThan(prevX);
        await expect(y).toBe(prevY);
     })

     // Have to go right before bc game starts with snek going up
     test("Going 'down' moves the snek head down", async ({ page }) => {
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBe(prevX);
        await expect(y).toBeGreaterThan(prevY);
     });

     test("Can't go down if snek moving up", async ({ page }) => {
        const fired = await pressKeysAndReturnFired({ page, keys : [ "ArrowDown" ] });

        await expect(fired).toBe(0);
     });
});
