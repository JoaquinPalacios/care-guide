import { MarketingRevealCard } from "@/app/(marketing)/components/marketing-experience";

import styles from "../marketing.module.css";

export function MarketingNumberedSteps({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ol
      className={
        className
          ? `${styles.numberedSteps} ${className}`
          : styles.numberedSteps
      }
      data-mk-numbered-steps=""
    >
      {items.map((copy, index) => (
        <MarketingRevealCard
          key={copy}
          as="li"
          index={index}
          className={styles.numberedStep}
        >
          <span className={styles.numberedStepIndex} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={styles.numberedStepRule} aria-hidden="true" />
          <p className={styles.numberedStepCopy}>{copy}</p>
        </MarketingRevealCard>
      ))}
    </ol>
  );
}
