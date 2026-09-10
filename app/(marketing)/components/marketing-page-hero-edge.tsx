const INNER_PAGE_FILL = "M0 36C240 48 780 18 1440 32V48H0Z";
const INNER_PAGE_EDGE = "M0 36C240 48 780 18 1440 32";

export function MarketingPageHeroEdge() {
  return (
    <div className="mkPageWave mkPageWaveInnerPage" aria-hidden="true">
      <svg
        className="mkPageWaveInner"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="mkPageStroke"
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
              offset="0.16"
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0.5"
            />
            <stop
              offset="0.5"
              stopColor="var(--mk-wave-cyan)"
              stopOpacity="0.88"
            />
            <stop
              offset="0.84"
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
            id="mkPageGlow"
            x="-12%"
            y="-240%"
            width="124%"
            height="580%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>
        <path className="mkPageWaveFill" d={INNER_PAGE_FILL} />
        <path
          className="mkPageWaveGlow"
          d={INNER_PAGE_EDGE}
          fill="none"
          stroke="url(#mkPageStroke)"
          filter="url(#mkPageGlow)"
        />
        <path
          className="mkPageWaveEdge"
          d={INNER_PAGE_EDGE}
          fill="none"
          stroke="url(#mkPageStroke)"
        />
      </svg>
    </div>
  );
}
