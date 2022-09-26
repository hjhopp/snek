import { test, expect } from "@playwright/test";

import { DIRECTIONS } from "./util/constants";
import wait from "./util/wait";

test.describe("Moving", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("");
    });

    test("Game starts with snek moving up", async ({ page }) => {
        const { moveDirection } = await page.evaluate(() => state);

        await expect(moveDirection).toBe(DIRECTIONS.up);
     });

    test("Arrow keys change snek direction", async ({ page }) => {
        await page.keyboard.press("ArrowRight");

        const firstDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("ArrowDown");

        const secondDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("ArrowLeft");

        const thirdDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("ArrowUp");

        const fourthDirection = await page.evaluate(() => state.moveDirection);

        expect(firstDirection).toBe(DIRECTIONS.right);
        expect(secondDirection).toBe(DIRECTIONS.down);
        expect(thirdDirection).toBe(DIRECTIONS.left);
        expect(fourthDirection).toBe(DIRECTIONS.up);
    });

    test("WASD change snek direction", async ({ page }) => {
        await page.keyboard.press("CapsLock");
        await page.keyboard.press("D");

        const firstDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("S");

        const secondDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("A");

        const thirdDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("W");

        const fourthDirection = await page.evaluate(() => state.moveDirection);

        expect(firstDirection).toBe(DIRECTIONS.right);
        expect(secondDirection).toBe(DIRECTIONS.down);
        expect(thirdDirection).toBe(DIRECTIONS.left);
        expect(fourthDirection).toBe(DIRECTIONS.up);
    });

    test("wasd change snek direction", async ({ page }) => {
        await page.keyboard.press("d");

        const firstDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("s");

        const secondDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("a");

        const thirdDirection = await page.evaluate(() => state.moveDirection);

        await page.keyboard.press("w");

        const fourthDirection = await page.evaluate(() => state.moveDirection);

        expect(firstDirection).toBe(DIRECTIONS.right);
        expect(secondDirection).toBe(DIRECTIONS.down);
        expect(thirdDirection).toBe(DIRECTIONS.left);
        expect(fourthDirection).toBe(DIRECTIONS.up);
    });

     test("Going 'up' moves the snek head up", async ({ page }) => {
        await page.keyboard.press("ArrowUp");

        await wait();

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBe(prevX);
        await expect(y).toBeLessThan(prevY);
     });

     test("Going 'left' moves snek head left", async ({ page }) => {
        await page.keyboard.press("ArrowLeft");

        await wait();

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBeLessThan(prevX);
        await expect(y).toBe(prevY);
     });

     test("Going 'right' moves snek head right", async ({ page }) => {
        await page.keyboard.press("ArrowRight");

        await wait();

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBeGreaterThan(prevX);
        await expect(y).toBe(prevY);
     });

     // Have to go right before bc game starts with snek going up
     test("Going 'down' moves the snek head down", async ({ page }) => {
        await page.keyboard.press("ArrowRight");

        await wait();

        await page.keyboard.press("ArrowDown");

        await wait();

        const { prevX, prevY, x, y } = await page.evaluate(() => state.snek.head);

        await expect(x).toBe(prevX);
        await expect(y).toBeGreaterThan(prevY);
     });

     // relies on snek going up by default
     test("Can't go down if snek moving up", async ({ page }) => {
        await page.keyboard.press("ArrowDown");

        const { moveDirection } = await page.evaluate(() => state);

        await expect(moveDirection).toBe(DIRECTIONS.up);
     });

     test("Can't go right if going left", async ({ page }) => {
        await page.keyboard.press("ArrowLeft");

        await wait();

        await page.keyboard.press("ArrowRight");

        const { moveDirection } = await page.evaluate(() => state);

        await expect(moveDirection).toBe(DIRECTIONS.left);
     });

     test("Can't go left if going right", async ({ page }) => {
        await page.keyboard.press("ArrowRight");

        await wait();

        await page.keyboard.press("ArrowLeft");

        const { moveDirection } = await page.evaluate(() => state);

        await expect(moveDirection).toBe(DIRECTIONS.right);
     });

     test("Can't go up if going down", async ({ page }) => {
        await page.keyboard.press("ArrowRight");

        await wait();

        await page.keyboard.press("ArrowDown");

        await wait();

        await page.keyboard.press("ArrowUp");

        await wait();

        const { moveDirection } = await page.evaluate(() => state);

        await expect(moveDirection).toBe(DIRECTIONS.down);
     });
});
