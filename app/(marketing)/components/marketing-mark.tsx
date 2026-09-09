export function MarketingMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="5"
        y="4"
        width="16"
        height="21"
        rx="3.5"
        fill="currentColor"
        opacity="0.38"
      />
      <rect x="11" y="8" width="16" height="21" rx="3.5" fill="currentColor" />
    </svg>
  );
}
