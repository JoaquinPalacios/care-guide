export function MarketingWave() {
  return (
    <div className="mkWave" aria-hidden="true">
      <svg
        className="mkWaveInner"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="mkWaveStroke"
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
              offset="0.18"
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0.58"
            />
            <stop
              offset="0.5"
              stopColor="var(--mk-wave-cyan)"
              stopOpacity="0.92"
            />
            <stop
              offset="0.82"
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0.58"
            />
            <stop
              offset="1"
              stopColor="var(--mk-wave-periwinkle)"
              stopOpacity="0"
            />
          </linearGradient>
          <filter
            id="mkWaveGlow"
            x="-10%"
            y="-220%"
            width="120%"
            height="540%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="3.1" />
          </filter>
        </defs>
        <path className="mkWaveFill" d="M0 28C360 42 1080 14 1440 28V56H0Z" />
        <path
          className="mkWaveGlow"
          d="M0 28C360 42 1080 14 1440 28"
          fill="none"
          stroke="url(#mkWaveStroke)"
          filter="url(#mkWaveGlow)"
        />
        <path
          className="mkWaveEdge"
          d="M0 28C360 42 1080 14 1440 28"
          fill="none"
          stroke="url(#mkWaveStroke)"
        />
      </svg>
    </div>
  );
}
