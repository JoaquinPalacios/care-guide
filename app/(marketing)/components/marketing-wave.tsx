export function MarketingWave() {
  return (
    <div className="mkWave" aria-hidden="true">
      <svg
        className="mkWaveInner"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path className="mkWaveFill" d="M0 30C360 42 1080 18 1440 30V48H0Z" />
        <path
          className="mkWaveGlow"
          d="M0 30C360 42 1080 18 1440 30"
          fill="none"
        />
        <path
          className="mkWaveEdge"
          d="M0 30C360 42 1080 18 1440 30"
          fill="none"
        />
      </svg>
    </div>
  );
}
