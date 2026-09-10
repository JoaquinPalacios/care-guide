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

export function localStaffCredentials(): {
  email: string;
  password: string;
} | null {
  const email = process.env.LOCAL_STAFF_EMAIL?.trim();
  const password = process.env.LOCAL_STAFF_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

export function localOperatorCredentials(): {
  email: string;
  password: string;
} | null {
  const email = process.env.LOCAL_OPERATOR_EMAIL?.trim();
  const password = process.env.LOCAL_OPERATOR_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

async function signInWith(
  page: Page,
  credentials: { email: string; password: string },
  expectedPath: string
): Promise<void> {
  await page.goto(staffUrl("/login"), { waitUntil: "load" });
  await expect(
    page.getByRole("button", { name: "Show password" })
  ).toBeVisible();
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(staffUrl(expectedPath));
}

export async function signInAsLocalAdmin(page: Page): Promise<void> {
  const credentials = localAdminCredentials();
  expect(
    credentials,
    "LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD must be set"
  ).not.toBeNull();
  await signInWith(page, credentials!, "/dashboard");
}

export async function signInAsLocalStaff(page: Page): Promise<void> {
  const credentials = localStaffCredentials();
  expect(
    credentials,
    "LOCAL_STAFF_EMAIL and LOCAL_STAFF_PASSWORD must be set"
  ).not.toBeNull();
  await signInWith(page, credentials!, "/dashboard");
}

export async function signInAsLocalOperator(page: Page): Promise<void> {
  const credentials = localOperatorCredentials();
  expect(
    credentials,
    "LOCAL_OPERATOR_EMAIL and LOCAL_OPERATOR_PASSWORD must be set"
  ).not.toBeNull();
  await signInWith(page, credentials!, "/operator/clinics");
}
