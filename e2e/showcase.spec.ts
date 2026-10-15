import { test, expect } from "@playwright/test";
import project from "../project.json";

test("capture project showcase", async ({ page }) => {
  for (const path of project.demoPaths) {
    await page.goto(path);

    await expect(page.locator("body")).toBeVisible();

    const filename = path === "/"
      ? "home"
      : path.replace(/^\/+|\/+$/g, "").replaceAll("/", "-");

    await page.screenshot({
      path: `showcase/screenshots/${filename}.png`,
      fullPage: true,
    });
  }
});
