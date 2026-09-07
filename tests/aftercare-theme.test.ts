import { describe, expect, it } from "vitest";

import {
  AFTERCARE_THEME_SCOPE,
  AFTERCARE_THEME_TOKEN_KEYS,
  DEFAULT_AFTERCARE_THEME,
  RADIUS_PRESET_VALUES,
  resolveAftercareTheme,
  serializeAftercareThemeCss,
  toAftercareThemeStyle,
} from "@/lib/branding/aftercare-theme";

describe("resolveAftercareTheme", () => {
  it("returns the default light and dark themes when the clinic profile is missing", () => {
    expect(resolveAftercareTheme(null)).toEqual(DEFAULT_AFTERCARE_THEME);
  });

  it("returns the default theme when colours and radius are missing", () => {
    expect(
      resolveAftercareTheme({
        primaryColor: null,
        accentColor: null,
        neutralColor: null,
        radiusPreset: null,
      })
    ).toEqual(DEFAULT_AFTERCARE_THEME);
  });

  it("maps a valid clinic primary onto the brand token in both schemes", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: null,
      neutralColor: null,
      radiusPreset: null,
    });

    expect(theme.light["--cg-brand"]).toBe("#0f766e");
    expect(theme.dark["--cg-brand"]).toBe("#0f766e");
    expect(theme.light["--cg-on-brand"]).toBe("#ffffff");
    expect(theme.dark["--cg-on-brand"]).toBe("#ffffff");
    expect(theme.light["--cg-accent"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-accent"]
    );
  });

  it("maps a valid clinic accent onto the accent token", () => {
    const theme = resolveAftercareTheme({
      primaryColor: null,
      accentColor: "#f59e0b",
      neutralColor: null,
      radiusPreset: null,
    });

    expect(theme.light["--cg-accent"]).toBe("#f59e0b");
    expect(theme.dark["--cg-accent"]).toBe("#f59e0b");
    expect(theme.light["--cg-brand"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-brand"]
    );
  });

  it("keeps the light page canvas white and uses clinic paper only as a subtle tint", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: null,
      neutralColor: "#f4efe6",
      radiusPreset: null,
    });

    expect(theme.light["--cg-surface"]).toBe("#ffffff");
    expect(theme.light["--cg-surface-subtle"]).not.toBe("#ffffff");
    expect(theme.light["--cg-text"]).toBe("#111318");
    expect(theme.light["--cg-brand"]).toBe("#0f766e");
    expect(theme.dark["--cg-surface"]).toBe("#111318");
    expect(theme.dark["--cg-text"]).toBe("#f4f1ea");
  });

  it("uses a white light canvas and a calm dark page by default", () => {
    const theme = resolveAftercareTheme(null);

    expect(theme.light["--cg-surface"]).toBe("#ffffff");
    expect(theme.light["--cg-surface-subtle"]).toBe("#f7f7f5");
    expect(theme.dark["--cg-surface"]).toBe("#111318");
    expect(theme.dark["--cg-surface-subtle"]).toBe("#171a1f");
    expect(theme.dark["--cg-text"]).toBe("#f4f1ea");
  });

  it("maps radius presets onto a single semantic radius token", () => {
    expect(
      resolveAftercareTheme({
        primaryColor: null,
        accentColor: null,
        neutralColor: null,
        radiusPreset: "SHARP",
      }).light["--cg-radius"]
    ).toBe(RADIUS_PRESET_VALUES.SHARP);
    expect(
      resolveAftercareTheme({
        primaryColor: null,
        accentColor: null,
        neutralColor: null,
        radiusPreset: "MEDIUM",
      }).light["--cg-radius"]
    ).toBe(RADIUS_PRESET_VALUES.MEDIUM);
    expect(
      resolveAftercareTheme({
        primaryColor: null,
        accentColor: null,
        neutralColor: null,
        radiusPreset: "SOFT",
      }).dark["--cg-radius"]
    ).toBe(RADIUS_PRESET_VALUES.SOFT);
  });

  it("expands 3-digit hex colours", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0a8",
      accentColor: "#fc0",
      neutralColor: "#eee",
      radiusPreset: null,
    });

    expect(theme.light["--cg-brand"]).toBe("#00aa88");
    expect(theme.light["--cg-accent"]).toBe("#ffcc00");
    expect(theme.light["--cg-surface"]).toBe("#ffffff");
    expect(theme.light["--cg-surface-subtle"]).not.toBe("#ffffff");
  });

  it("chooses a dark on-brand foreground for a light brand colour", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#fef3c7",
      accentColor: null,
      neutralColor: null,
      radiusPreset: null,
    });

    expect(theme.light["--cg-brand"]).toBe("#fef3c7");
    expect(theme.light["--cg-on-brand"]).toBe("#0f172a");
    expect(theme.dark["--cg-on-brand"]).toBe("#0f172a");
  });

  it("normalizes surrounding whitespace on otherwise valid hex colours", () => {
    const theme = resolveAftercareTheme({
      primaryColor: " #0f766e ",
      accentColor: " #f59e0b ",
      neutralColor: " #f8fafc ",
      radiusPreset: " medium ",
    });

    expect(theme.light["--cg-brand"]).toBe("#0f766e");
    expect(theme.light["--cg-accent"]).toBe("#f59e0b");
    expect(theme.light["--cg-surface"]).toBe("#ffffff");
    expect(theme.light["--cg-radius"]).toBe(RADIUS_PRESET_VALUES.MEDIUM);
  });

  it("falls back when a colour cannot produce readable on-brand text", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#7a7a7a",
      accentColor: null,
      neutralColor: null,
      radiusPreset: null,
    });

    expect(theme.light["--cg-brand"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-brand"]
    );
    expect(theme.light["--cg-on-brand"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-on-brand"]
    );
  });

  it("falls back when a dark or unreadable neutral is supplied", () => {
    const theme = resolveAftercareTheme({
      primaryColor: null,
      accentColor: null,
      neutralColor: "#0f172a",
      radiusPreset: "weird",
    });

    expect(theme.light["--cg-surface"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-surface"]
    );
    expect(theme.light["--cg-radius"]).toBe(RADIUS_PRESET_VALUES.MEDIUM);
  });

  it("returns only the expected semantic token names in each scheme", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: "#f59e0b",
      neutralColor: "#f4efe6",
      radiusPreset: "SOFT",
    });

    expect(Object.keys(theme.light).sort()).toEqual(
      [...AFTERCARE_THEME_TOKEN_KEYS].sort()
    );
    expect(Object.keys(theme.dark).sort()).toEqual(
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
      neutralColor: value,
      radiusPreset: value,
    });

    expect(theme.light["--cg-brand"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-brand"]
    );
    expect(theme.light["--cg-accent"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-accent"]
    );
    expect(theme.light["--cg-surface"]).toBe(
      DEFAULT_AFTERCARE_THEME.light["--cg-surface"]
    );
    expect(theme.light["--cg-radius"]).toBe(RADIUS_PRESET_VALUES.MEDIUM);
  });
});

describe("serializeAftercareThemeCss", () => {
  it("emits scoped light-dark tokens and the SYSTEM color-scheme without arbitrary CSS", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: "#f59e0b",
      neutralColor: "#f4efe6",
      radiusPreset: "SOFT",
    });
    const css = serializeAftercareThemeCss(theme);

    expect(css).toContain("html{color-scheme:light dark}");
    expect(css).toContain(`.${AFTERCARE_THEME_SCOPE}{`);
    expect(css).toContain("--cg-brand:#0f766e");
    expect(css).toContain("--cg-accent:#f59e0b");
    expect(css).toContain("--cg-surface:light-dark(#ffffff,");
    expect(css).toContain(`--cg-radius:${RADIUS_PRESET_VALUES.SOFT}`);
    expect(css).toContain("--cg-text:light-dark(#111318,#f4f1ea)");
    expect(css).not.toContain("@media (prefers-color-scheme: dark)");
    expect(css).not.toContain("customCss");
    expect(css).not.toContain("<");
    expect(css).not.toContain("url(");
    expect(css).not.toContain("expression(");
  });

  it.each([
    ["LIGHT", "light"],
    ["DARK", "dark"],
    ["SYSTEM", "light dark"],
  ] as const)(
    "locks clinic theme mode %s to color-scheme %s",
    (mode, scheme) => {
      const css = serializeAftercareThemeCss(DEFAULT_AFTERCARE_THEME, {
        themeMode: mode,
      });

      expect(css).toContain(`html{color-scheme:${scheme}}`);
    }
  );
});

describe("toAftercareThemeStyle", () => {
  it("exposes the light semantic tokens as a serializable style object", () => {
    const theme = resolveAftercareTheme({
      primaryColor: "#0f766e",
      accentColor: "#f59e0b",
      neutralColor: null,
      radiusPreset: "SHARP",
    });
    const style = toAftercareThemeStyle(theme);

    expect(style).toEqual(
      expect.objectContaining({
        "--cg-brand": "#0f766e",
        "--cg-accent": "#f59e0b",
        "--cg-on-brand": "#ffffff",
        "--cg-radius": RADIUS_PRESET_VALUES.SHARP,
      })
    );
  });
});
