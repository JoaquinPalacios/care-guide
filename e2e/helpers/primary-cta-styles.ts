import type { Locator } from "@playwright/test";

export interface PrimaryCtaComputedStyles {
  appearance: string;
  webkitAppearance: string;
  height: number;
  minHeight: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  borderTopWidth: string;
  borderRightWidth: string;
  borderBottomWidth: string;
  borderLeftWidth: string;
  borderTopStyle: string;
  borderRightStyle: string;
  borderBottomStyle: string;
  borderLeftStyle: string;
  borderTopColor: string;
  borderRightColor: string;
  borderBottomColor: string;
  borderLeftColor: string;
  borderTopLeftRadius: string;
  boxShadow: string;
  outlineStyle: string;
  outlineWidth: string;
  outlineColor: string;
  outlineOffset: string;
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  fontFamily: string;
}

export async function readPrimaryCtaStyles(
  locator: Locator
): Promise<PrimaryCtaComputedStyles> {
  return locator.evaluate((element) => {
    const styles = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      appearance: styles.appearance,
      webkitAppearance: styles.getPropertyValue("-webkit-appearance"),
      height: Math.round(box.height),
      minHeight: styles.minHeight,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      borderTopWidth: styles.borderTopWidth,
      borderRightWidth: styles.borderRightWidth,
      borderBottomWidth: styles.borderBottomWidth,
      borderLeftWidth: styles.borderLeftWidth,
      borderTopStyle: styles.borderTopStyle,
      borderRightStyle: styles.borderRightStyle,
      borderBottomStyle: styles.borderBottomStyle,
      borderLeftStyle: styles.borderLeftStyle,
      borderTopColor: styles.borderTopColor,
      borderRightColor: styles.borderRightColor,
      borderBottomColor: styles.borderBottomColor,
      borderLeftColor: styles.borderLeftColor,
      borderTopLeftRadius: styles.borderTopLeftRadius,
      boxShadow: styles.boxShadow,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
      outlineColor: styles.outlineColor,
      outlineOffset: styles.outlineOffset,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
      fontFamily: styles.fontFamily,
    };
  });
}
