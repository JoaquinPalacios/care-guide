import { expect, type Page } from "@playwright/test";

import { staffUrl } from "./origins";

export function localAdminCredentials(): {
  email: string;
  password: string;
} | null {
  const email = process.env.LOCAL_ADMIN_EMAIL?.trim();
  const password = process.env.LOCAL_ADMIN_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

export async function signInAsLocalAdmin(page: Page): Promise<void> {
  const credentials = localAdminCredentials();
  expect(
    credentials,
    "LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD must be set"
  ).not.toBeNull();

  await page.goto(staffUrl("/login"), { waitUntil: "load" });
  await page.getByLabel("Email").fill(credentials!.email);
  await page.getByLabel("Password").fill(credentials!.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(staffUrl("/dashboard"));
}
