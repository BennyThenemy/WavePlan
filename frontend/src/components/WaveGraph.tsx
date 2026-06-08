"use client";

import { BEACHES, weekly } from "@/lib/data";
import { makeT } from "@/lib/strings";
import * as I from "./Icons";

interface DayData {
  offset: number;
  slashLabel: string;
  weekday: number;
  waveCm: number;
  windDir: string;
  windDeg: number;
}

const CW = 340, CH = 120;
const TOP = 46, AMP = 24;

function smoothPath(pts: Array<{ x: number; y: number }>) {
  if (pts.length < 2) return "";
  let d = "M " + pts[0].x + " " + pts[0].y;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += " C " + c1x + " " + c1y + ", " + c2x + " " + c2y + ", " + p2.x + " " + p2.y;
  }
  return d;
}

function WeekChart({ days, lang, t }: { days: DayData[]; lang: string; t: ReturnType<typeof makeT> }) {
  const cms = days.map((d) => d.waveCm);
  const min = Math.min(...cms), max = Math.max(...cms);
  const span = max - min || 1;
  const colW = CW / days.length;

  const pts = days.map((d, i) => ({
    x: (i + 0.5) * colW,
    y: TOP + (1 - (d.waveCm - min) / span) * AMP,
    cm: d.waveCm,
  }));

  const edge = [{ x: 0, y: pts[0].y }, ...pts, { x: CW, y: pts[pts.length - 1].y }];
  const line = smoothPath(edge);
  const area = line + " L " + CW + " " + CH + " L 0 " + CH + " Z";

  return (
    <div className="wp-week">
      <h2 className="wp-week-title">{t("weekTitle")}</h2>
      <div className="wp-week-head" dir="ltr">
        {days.map((d, i) => (
          <div key={i} className={"wp-day" + (d.offset === 0 ? " is-today" : "")}>
            <span className="wp-day-name">{d.offset === 0 ? t("today") : t("wds_" + d.weekday)}</span>
            <span className="wp-day-date">{d.slashLabel}</span>
            <span className="wp-day-arrow" style={{ transform: `rotate(${d.windDeg}deg)` }}>
              <I.NavArrow size={16} />
            </span>
          </div>
        ))}
      </div>
      <svg className="wp-week-svg" viewBox={`0 0 ${CW} ${CH}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <path d={area} fill="var(--secondary)" fillOpacity="0.85" />
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <text x={p.x} y={p.y - 12} textAnchor="middle"
              className="wp-week-val">{p.cm + " " + t("cmUnit")}</text>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function WaveGraph({ beachIdx, lang, t }: {
  beachIdx: number;
  lang: string;
  t: ReturnType<typeof makeT>;
}) {
  const weekData = weekly(beachIdx);
  const days = lang === "he" && weekData ? [...weekData].reverse() : weekData;

  if (!days) return null;

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <WeekChart days={days} lang={lang} t={t} />
    </div>
  );
}
