"use client";

import { useEffect, useState } from "react";

const SUBTITLES = [
  "Checking swell & wind…",
  "Reading the 7-day outlook…",
  "Finding your best window…",
];

export default function WaveLoader({
  compact = false,
  title = "Reading the water",
}: {
  compact?: boolean;
  title?: string;
}) {
  const [sub, setSub] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSub((i) => (i + 1) % SUBTITLES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const orb = (
    <div
      className="wl-orb"
      role="status"
      aria-live="polite"
      aria-label="Loading conditions"
    >
      <div className="wl-water">
        <svg className="wl-wave1" viewBox="0 0 240 120" preserveAspectRatio="none">
          <path d="M0,30 C30,10 60,50 120,30 C180,10 210,50 240,30 L240,120 L0,120 Z" />
        </svg>
        <svg className="wl-wave2" viewBox="0 0 240 120" preserveAspectRatio="none">
          <path d="M0,40 C40,60 70,20 120,40 C170,60 200,20 240,40 L240,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="wl-compact">
        {orb}
        <div className="wl-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  return (
    <div className="wl-full">
      {orb}
      <div className="wl-text">
        <div className="wl-title">{title}</div>
        <div className="wl-sub" key={sub}>{SUBTITLES[sub]}</div>
      </div>
      <div className="wl-dots" aria-hidden="true">
        <span /><span /><span />
      </div>
    </div>
  );
}
