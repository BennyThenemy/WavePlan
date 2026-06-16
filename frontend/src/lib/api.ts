const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BeachAPI {
  _id: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  slug: string;
}

export async function fetchBeaches(): Promise<BeachAPI[]> {
  const res = await fetch(`${API_BASE}/beaches`);
  if (!res.ok) throw new Error("Failed to fetch beaches");
  return res.json();
}

export interface HourAPI {
  time: string;
  wave_height: number;
  swell_period: number;
  swell_direction: string;
  wind_speed: number;
  wind_direction: string;
  air_temp: number;
  water_temp: number;
  uv_index: number;
}

export interface DaytimeMetrics {
  air_temp: number;
  water_temp: number;
  uv_index: number;
  wind_speed: number;
}

export interface WeatherAPI {
  beach_id: string;
  date: string;
  hours: HourAPI[];
  daytime_metrics: DaytimeMetrics | null;
}

export interface SummaryData {
  best_for: string[];
  board: string | null;
  warning: string | null;
  best_window: string;
  free_text: string;
}

export type SummaryAPI =
  | { status: "ready"; summary: SummaryData }
  | { status: "pending" }
  | { status: "error"; message: string };

export async function fetchWeather(beachId: string, date: string): Promise<WeatherAPI> {
  const res = await fetch(
    `${API_BASE}/weather?beach_id=${encodeURIComponent(beachId)}&date=${encodeURIComponent(date)}`
  );
  if (!res.ok) throw new Error("No weather data");
  return res.json();
}

export async function fetchSummary(
  beachId: string,
  date: string,
  activity: string
): Promise<SummaryAPI> {
  const res = await fetch(
    `${API_BASE}/summary?beach_id=${encodeURIComponent(beachId)}&date=${encodeURIComponent(date)}&activity=${encodeURIComponent(activity)}`
  );
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}
