export const BEACHES = [
  { id: "hilton", name: { en: "Tel Aviv · Hilton", he: "תל אביב · הילטון" }, region: { en: "Central coast", he: "חוף המרכז" }, bias: { swell: 0.0, wind: 0 } },
  { id: "acadia", name: { en: "Herzliya · Acadia", he: "הרצליה · אכדיה" }, region: { en: "Sharon coast", he: "חוף השרון" }, bias: { swell: 0.25, wind: 2 } },
  { id: "sironit", name: { en: "Netanya · Sironit", he: "נתניה · סירונית" }, region: { en: "Sharon coast", he: "חוף השרון" }, bias: { swell: 0.4, wind: 4 } },
  { id: "lido", name: { en: "Ashdod · Lido", he: "אשדוד · לידו" }, region: { en: "Southern coast", he: "חוף הדרום" }, bias: { swell: -0.15, wind: -2 } },
];

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

function bestWindow(hrs: HourRow[]): string {
  const day = hrs.filter((r) => r.hour >= 6 && r.hour <= 18);
  let best: { score: number; start: number; end: number } | null = null;
  for (let i = 0; i < day.length - 1; i++) {
    const score = day[i].wind + day[i + 1].wind;
    if (!best || score < best.score) {
      best = { score, start: day[i].hour, end: day[i + 1].hour + 3 };
    }
  }
  const fmt = (h: number) => String(h).padStart(2, "0") + ":00";
  return fmt(best!.start) + " – " + fmt(Math.min(best!.end, 21));
}

function windWarning(hrs: HourRow[]): { key: string; time: string } | null {
  const breach = hrs.find((r) => r.hour >= 9 && r.wind >= 20);
  if (breach) return { key: "wind", time: breach.time };
  return null;
}

export interface AISummary {
  bestFor: string[];
  board: string[] | null;
  warning: { key: string; time: string } | null;
  window: string;
  text: { key: string; period: boolean };
}

function summarize(activity: string, m: Metrics, hrs: HourRow[]): AISummary {
  const win = bestWindow(hrs);
  const warn = windWarning(hrs);
  const h = m.swellHeight, p = m.swellPeriod, w = m.windSpeed;

  if (activity === "surfing") {
    let bestFor: string[], board: string[], textKey: string;
    if (h < 0.7) {
      bestFor = ["beginners"]; board = ["softtop", "longboard"]; textKey = "surf_small";
    } else if (h < 1.4) {
      bestFor = ["beginners", "intermediate"]; board = ["longboard", "funboard"]; textKey = "surf_work";
    } else {
      bestFor = ["intermediate", "advanced"]; board = ["shortboard", "fish"]; textKey = "surf_solid";
    }
    return { bestFor, board, warning: warn, window: win, text: { key: textKey, period: p >= 10 } };
  }

  if (activity === "sup") {
    let bestFor: string[], textKey: string;
    if (h <= 0.6 && w < 16) {
      bestFor = ["beginners", "intermediate"]; textKey = "sup_calm";
    } else if (h <= 1.1) {
      bestFor = ["intermediate"]; textKey = "sup_bump";
    } else {
      bestFor = ["advanced"]; textKey = "sup_chop";
    }
    return { bestFor, board: null, warning: warn, window: win, text: { key: textKey, period: false } };
  }

  let bestFor: string[], textKey: string;
  if (w < 14 && m.airTemp >= 26) {
    bestFor = ["everyone"]; textKey = "casual_warm";
  } else if (w < 22) {
    bestFor = ["families", "swimmers"]; textKey = "casual_light";
  } else {
    bestFor = ["hardy"]; textKey = "casual_breezy";
  }
  return { bestFor, board: null, warning: warn, window: win, text: { key: textKey, period: false } };
}

export function conditionsFor(beachIdx: number, dayOffset: number, activity: string) {
  const hrs = hourly(beachIdx, dayOffset);
  const m = metrics(beachIdx, dayOffset, hrs);
  const ai = summarize(activity, m, hrs);
  return { hrs, m, ai };
}
