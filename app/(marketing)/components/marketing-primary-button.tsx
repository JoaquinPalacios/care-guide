import type { ComponentProps, ReactNode } from "react";

import { marketingPrimaryClassName } from "@/app/(marketing)/components/marketing-primary-class";

import styles from "../marketing.module.css";

interface MarketingPrimaryButtonProps extends ComponentProps<"button"> {
  busy?: boolean;
  busyLabel?: ReactNode;
}

export function MarketingPrimaryButton({
  busy = false,
  busyLabel = "Sending…",
  children,
  className,
  disabled,
  type = "button",
  ...props
}: MarketingPrimaryButtonProps) {
  return (
    <button
      className={marketingPrimaryClassName(className)}
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy ? (
        <span className={styles.primaryButtonSwap}>
          <span className={styles.primaryButtonReserve} aria-hidden="true">
            {children}
          </span>
          <span className={styles.primaryButtonLive}>{busyLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
