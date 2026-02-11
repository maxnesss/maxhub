import { expect, test, type Page } from "@playwright/test";

import {
  E2E_PROJECT_SLUG_PREFIX,
  E2E_USER_EMAIL,
  E2E_USER_PASSWORD,
} from "./constants";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(E2E_USER_EMAIL);
  await page.getByLabel("Password").fill(E2E_USER_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/profile$/);
}

test.describe("Projects E2E", () => {
  test("redirects anonymous users from protected pages", async ({ page }) => {
    await page.goto("/apps/projects");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("user can create and edit a project via UI", async ({ page }) => {
    await login(page);

    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const baseTitle = `E2E Project ${stamp}`;
    const baseSlug = `${E2E_PROJECT_SLUG_PREFIX}-${stamp}`;
    const updatedTitle = `${baseTitle} Updated`;

    await page.goto("/apps/projects/new");
    await page.getByLabel("Title").fill(baseTitle);
    await page.getByLabel("Slug").fill(baseSlug);
    await page.getByLabel("Description").fill("Created by Playwright E2E test");
    await page.getByLabel("Priority").selectOption("HIGH");
    await page.getByLabel("Notes (Markdown)").fill("## E2E Notes");
    await page.getByRole("button", { name: "Create project" }).click();

    await expect(page).toHaveURL(/\/apps\/projects\/[^/]+\?created=1$/);
    await expect(page.getByText("Project created successfully.")).toBeVisible();
    await expect(page.getByRole("heading", { name: baseTitle })).toBeVisible();
    await expect(page.getByText("High priority")).toBeVisible();

    const createdUrl = page.url();
    const match = createdUrl.match(/\/apps\/projects\/([^/?]+)/);
    expect(match?.[1]).toBeTruthy();
    const projectId = match![1];

    await page.goto(`/apps/projects/${projectId}/edit`);
    await expect(page).toHaveURL(new RegExp(`/apps/projects/${projectId}/edit$`));

    await page.getByLabel("Title").fill(updatedTitle);
    await page.getByLabel("Priority").selectOption("LOW");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/apps\/projects\/[^/]+\?saved=1$/);
    await expect(page.getByText("Project updated successfully.")).toBeVisible();
    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
    await expect(page.getByText("Low priority")).toBeVisible();
  });
});
