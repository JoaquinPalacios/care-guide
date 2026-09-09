import type { MarketingPageHeroVariant } from "@/app/(marketing)/components/marketing-page-hero";

const PRICING_FILL = "M0 36C240 48 780 18 1440 32V48H0Z";
const PRICING_EDGE = "M0 36C240 48 780 18 1440 32";
const CONTACT_FILL = "M0 40C180 38 720 28 1440 42V48H0Z";
const CONTACT_EDGE = "M220 34C520 16 860 48 1220 30";

export function MarketingPageHeroEdge({
  variant,
}: {
  variant: MarketingPageHeroVariant;
}) {
  const strokeId =
    variant === "pricing" ? "mkPricingStroke" : "mkContactStroke";
  const glowId = variant === "pricing" ? "mkPricingGlow" : "mkContactGlow";
  const fill = variant === "pricing" ? PRICING_FILL : CONTACT_FILL;
  const edge = variant === "pricing" ? PRICING_EDGE : CONTACT_EDGE;
  const className =
    variant === "pricing"
      ? "mkPageWave mkPageWavePricing"
      : "mkPageWave mkPageWaveContact";

  return (
    <div className={className} aria-hidden="true">
      <svg
        className="mkPageWaveInner"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={strokeId}
            x1="0"
            y1="0"
            x2="1440"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0"
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0"
            />
            <stop
              offset={variant === "pricing" ? "0.16" : "0.22"}
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0.5"
            />
            <stop
              offset="0.5"
              stopColor="var(--mk-wave-cyan)"
              stopOpacity={variant === "pricing" ? "0.88" : "0.72"}
            />
            <stop
              offset={variant === "pricing" ? "0.84" : "0.78"}
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0.5"
            />
            <stop
              offset="1"
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0"
            />
          </linearGradient>
          <filter
            id={glowId}
            x="-12%"
            y="-240%"
            width="124%"
            height="580%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              stdDeviation={variant === "pricing" ? "2.6" : "2.1"}
            />
          </filter>
        </defs>
        <path className="mkPageWaveFill" d={fill} />
        <path
          className="mkPageWaveGlow"
          d={edge}
          fill="none"
          stroke={`url(#${strokeId})`}
          filter={`url(#${glowId})`}
        />
        <path
          className="mkPageWaveEdge"
          d={edge}
          fill="none"
          stroke={`url(#${strokeId})`}
        />
      </svg>
    </div>
  );
}
