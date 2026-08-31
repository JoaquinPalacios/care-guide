import { describe, expect, it } from "vitest";

import {
  AFTERCARE_THEME_TOKEN_KEYS,
  DEFAULT_AFTERCARE_THEME,
  resolveAftercareTheme,
  toAftercareThemeStyle,
} from "@/lib/branding/aftercare-theme";

describe("resolveAftercareTheme", () => {
  it("returns the default theme when the clinic profile is missing", () => {
    expect(resolveAftercareTheme(null)).toEqual(DEFAULT_AFTERCARE_THEME);
  });

  it("returns the default theme when both colours are missing", () => {
    expect(
      resolveAftercareTheme({ primaryColor: null, accentColor: null })
    ).toEqual(DEFAULT_AFTERCARE_THEME);
  });

  it("maps a valid clinic primary onto the brand token", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: null,
    });

    expect(theme["--cg-brand"]).toBe("#0f766e");
    expect(theme["--cg-on-brand"]).toBe("#ffffff");
    expect(theme["--cg-accent"]).toBe(DEFAULT_AFTERCARE_THEME["--cg-accent"]);
  });

  it("maps a valid clinic accent onto the accent token", () => {
    const theme = resolveAftercareTheme({
      primaryColor: null,
      accentColor: "#f59e0b",
    });

    expect(theme["--cg-accent"]).toBe("#f59e0b");
    expect(theme["--cg-brand"]).toBe(DEFAULT_AFTERCARE_THEME["--cg-brand"]);
  });

  it("expands 3-digit hex colours", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0a8",
      accentColor: "#fc0",
    });

    expect(theme["--cg-brand"]).toBe("#00aa88");
    expect(theme["--cg-accent"]).toBe("#ffcc00");
  });

  it("chooses a dark on-brand foreground for a light brand colour", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#fef3c7",
      accentColor: null,
    });

    expect(theme["--cg-brand"]).toBe("#fef3c7");
    expect(theme["--cg-on-brand"]).toBe("#0f172a");
  });

  it("normalizes surrounding whitespace on otherwise valid hex colours", () => {
    const theme = resolveAftercareTheme({
      primaryColor: " #0f766e ",
      accentColor: " #f59e0b ",
    });

    expect(theme["--cg-brand"]).toBe("#0f766e");
    expect(theme["--cg-accent"]).toBe("#f59e0b");
  });

  it("falls back when a colour cannot produce readable on-brand text", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#7a7a7a",
      accentColor: null,
    });

    expect(theme["--cg-brand"]).toBe(DEFAULT_AFTERCARE_THEME["--cg-brand"]);
    expect(theme["--cg-on-brand"]).toBe(
      DEFAULT_AFTERCARE_THEME["--cg-on-brand"]
    );
  });

  it("returns only the expected semantic token names", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: "#f59e0b",
    });

    expect(Object.keys(theme).sort()).toEqual(
      [...AFTERCARE_THEME_TOKEN_KEYS].sort()
    );
  });

  it.each([
    "red",
    "#gggggg",
    "#0f766",
    "#0f766ee",
    "#0f766e!important",
    "#0f766e;background:red",
    "url(https://evil.test/x)",
    "url(#0f766e)",
    "var(--foreground)",
    "var(--cg-brand)",
    "calc(1px + 1px)",
    "rgb(15, 118, 110)",
    "hsl(174 72% 26%)",
    "expression(alert(1))",
    "javascript:alert(1)",
    "",
    "0f766e",
  ])("rejects unsafe or invalid colour %j and falls back", (value) => {
    const theme = resolveAftercareTheme({
      primaryColor: value,
      accentColor: value,
    });

    expect(theme["--cg-brand"]).toBe(DEFAULT_AFTERCARE_THEME["--cg-brand"]);
    expect(theme["--cg-accent"]).toBe(DEFAULT_AFTERCARE_THEME["--cg-accent"]);
  });
});

describe("toAftercareThemeStyle", () => {
  it("exposes the semantic tokens as a serializable style object", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: "#f59e0b",
    });
    const style = toAftercareThemeStyle(theme);

    expect(style).toEqual(
      expect.objectContaining({
        "--cg-brand": "#0f766e",
        "--cg-accent": "#f59e0b",
        "--cg-on-brand": "#ffffff",
      })
    );
  });
});
