export const BEACHES = [
  { id: "hilton", name: { en: "Tel Aviv · Hilton", he: "תל אביב · הילטון" }, region: { en: "Central coast", he: "חוף המרכז" }, bias: { swell: 0.0, wind: 0 } },
  { id: "acadia", name: { en: "Herzliya · Acadia", he: "הרצליה · אכדיה" }, region: { en: "Sharon coast", he: "חוף השרון" }, bias: { swell: 0.25, wind: 2 } },
  { id: "sironit", name: { en: "Netanya · Sironit", he: "נתניה · סירונית" }, region: { en: "Sharon coast", he: "חוף השרון" }, bias: { swell: 0.4, wind: 4 } },
  { id: "lido", name: { en: "Ashdod · Lido", he: "אשדוד · לידו" }, region: { en: "Southern coast", he: "חוף הדרום" }, bias: { swell: -0.15, wind: -2 } },
];

export const BASE = new Date(2026, 4, 29);

const SWELL_DIRS = ["NW", "WNW", "W", "WSW", "SW"] as const;
const WIND_DIRS = ["NW", "N", "NE", "W", "SW", "S"] as const;

function rng(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function pick<T>(arr: readonly T[], r: number): T { return arr[Math.floor(r * arr.length) % arr.length]; }
function round(v: number, d = 0) { const m = Math.pow(10, d); return Math.round(v * m) / m; }

export interface HourRow {
  time: string;
  hour: number;
  wave: number;
  period: number;
  swellDir: string;
  wind: number;
  windDir: string;
}

function hourly(beachIdx: number, dayOffset: number): HourRow[] {
  const rows: HourRow[] = [];
  for (let h = 0; h < 24; h += 3) {
    const s = beachIdx * 1000 + dayOffset * 97 + h;
    const bias = BEACHES[beachIdx].bias;
    const windBase = 6 + bias.wind + Math.max(0, (h - 9)) * 1.7 + rng(s + 0.3) * 6;
    const wind = Math.max(3, round(windBase));
    const waveBase = 0.6 + bias.swell + rng(s + 0.7) * 1.1 + (h >= 6 && h <= 12 ? 0.15 : 0);
    const wave = round(Math.max(0.3, waveBase), 1);
    const period = round(6 + rng(s + 1.3) * 7, 0);
    rows.push({
      time: String(h).padStart(2, "0") + ":00",
      hour: h,
      wave,
      period,
      swellDir: pick(SWELL_DIRS, rng(s + 2.1)),
      wind,
      windDir: pick(WIND_DIRS, rng(s + 2.9)),
    });
  }
  return rows;
}

export interface Metrics {
  swellHeight: number;
  swellPeriod: number;
  windSpeed: number;
  windDir: string;
  airTemp: number;
  waterTemp: number;
  uv: number;
  swellDir: string;
}

function metrics(beachIdx: number, dayOffset: number, hrs: HourRow[]): Metrics {
  const s = beachIdx * 1000 + dayOffset * 97;
  const day = hrs.filter((r) => r.hour >= 6 && r.hour <= 18);
  const avgWave = round(day.reduce((a, r) => a + r.wave, 0) / day.length, 1);
  const avgPeriod = round(day.reduce((a, r) => a + r.period, 0) / day.length, 0);
  const avgWind = round(day.reduce((a, r) => a + r.wind, 0) / day.length, 0);
  const windDir = day[Math.floor(day.length / 2)].windDir;
  const swellDir = pick(SWELL_DIRS, rng(s + 5.5));
  return {
    swellHeight: avgWave,
    swellPeriod: avgPeriod,
    windSpeed: avgWind,
    windDir,
    airTemp: round(23 + rng(s + 3.1) * 7),
    waterTemp: round(20 + rng(s + 4.2) * 6),
    uv: round(4 + rng(s + 6.6) * 7),
    swellDir,
  };
}


export interface DayParts {
  offset: number;
  slashLabel: string;
  weekday: number;
  waveCm: number;
  windDir: string;
  windDeg: number;
}

const WIND_DEG: Record<string, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };

function dayParts(offset: number) {
  const d = new Date(BASE);
  d.setDate(d.getDate() + offset);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return {
    offset,
    slashLabel: dd + "/" + mm,
    weekday: d.getDay(),
  };
}

export function weekly(beachIdx: number): DayParts[] {
  const out: DayParts[] = [];
  for (let o = 0; o < 7; o++) {
    const hrs = hourly(beachIdx, o);
    const m = metrics(beachIdx, o, hrs);
    const p = dayParts(o);
    out.push({
      offset: p.offset,
      slashLabel: p.slashLabel,
      weekday: p.weekday,
      waveCm: Math.round(m.swellHeight * 100),
      windDir: m.windDir,
      windDeg: (WIND_DEG[m.windDir] ?? 0) + 180,
    });
  }
  return out;
}
