const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Beach {
  _id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  slug?: string;
}

export interface HourData {
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

export interface WeatherData {
  _id: string;
  beach_id: string;
  date: string;
  fetched_at: string;
  hours: HourData[];
}

export interface AISummaryResponse {
  best_for: string[];
  board: string | null;
  warning: string | null;
  best_window: string;
  free_text: string;
}

export interface SummaryResponse {
  status: "pending" | "ready" | "error";
  summary?: AISummaryResponse;
  message?: string;
}

export async function fetchBeaches(): Promise<Beach[]> {
  const res = await fetch(`${API_BASE}/beaches`);
  if (!res.ok) throw new Error("Failed to fetch beaches");
  return res.json();
}

export async function fetchBeachBySlug(slug: string): Promise<Beach> {
  const res = await fetch(`${API_BASE}/beaches/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch beach");
  return res.json();
}

export async function fetchWeather(
  beachId: string,
  date: string
): Promise<WeatherData> {
  const res = await fetch(`${API_BASE}/weather?beach_id=${beachId}&date=${date}`);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}

export async function fetchSummary(
  beachId: string,
  date: string,
  activity: string
): Promise<SummaryResponse> {
  const res = await fetch(
    `${API_BASE}/summary?beach_id=${beachId}&date=${date}&activity=${activity}`
  );
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}
