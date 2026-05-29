# CLAUDE.md — Wave Plan Cron Job

## Overview
The cron job is a standalone Python service that runs once daily at 05:00 Israel time (02:00 UTC).

**Its only job:**
1. Fetch 7 days of hourly weather data from Open-Meteo for each active beach
2. Send that data to the backend via `PATCH /weather` — one request per beach per day
3. Never talk to MongoDB directly

---

## Tech Stack
- Python 3.12
- `httpx` — async HTTP client (Open-Meteo + backend calls)
- `supercronic` — reliable cron scheduler inside Docker

---

## Project Structure
```
cron/
├── Dockerfile
├── requirements.txt
├── main.py           # entry point — orchestrates the full run
├── fetcher.py        # Open-Meteo API calls + data transformation
├── patcher.py        # PATCH /weather calls to backend
├── beaches.py        # hardcoded beach list with coordinates
└── .env              # local dev only
```

---

## Beach List
Hardcoded in `beaches.py`. To add a beach, add an entry here — the cron will automatically fetch and patch data for it.

```python
# beaches.py
BEACHES = [
    {"_id": "gordon-beach",   "name": "Gordon Beach",       "lat": 32.0853, "lng": 34.7692},
    {"_id": "frishman-beach", "name": "Frishman Beach",     "lat": 32.0772, "lng": 34.7685},
    {"_id": "hilton-beach",   "name": "Hilton Beach",       "lat": 32.0891, "lng": 34.7658},
    {"_id": "banana-beach",   "name": "Banana Beach",       "lat": 32.0651, "lng": 34.7712},
    {"_id": "ashdod-beach",   "name": "Ashdod Beach",       "lat": 31.7683, "lng": 34.6414},
    {"_id": "rishon-beach",   "name": "Rishon LeZion Beach", "lat": 31.9730, "lng": 34.7290},
]
```

---

## Open-Meteo API

### Two API calls per beach (marine + weather)
Open-Meteo requires separate endpoints for marine and atmospheric data.

```python
# fetcher.py
import httpx
from datetime import datetime

MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

MARINE_VARS = [
    "wave_height",
    "wave_period",
    "wave_direction",
    "swell_wave_height",
    "swell_wave_period",
    "swell_wave_direction",
]

WEATHER_VARS = [
    "wind_speed_10m",
    "wind_direction_10m",
    "temperature_2m",
    "apparent_temperature",
    "uv_index",
]

def fetch_marine(lat: float, lng: float) -> dict:
    response = httpx.get(MARINE_URL, params={
        "latitude": lat,
        "longitude": lng,
        "hourly": ",".join(MARINE_VARS),
        "forecast_days": 7,
        "timezone": "Asia/Jerusalem"
    }, timeout=30)
    response.raise_for_status()
    return response.json()

def fetch_weather(lat: float, lng: float) -> dict:
    response = httpx.get(WEATHER_URL, params={
        "latitude": lat,
        "longitude": lng,
        "hourly": ",".join(WEATHER_VARS),
        "forecast_days": 7,
        "timezone": "Asia/Jerusalem"
    }, timeout=30)
    response.raise_for_status()
    return response.json()
```

### Open-Meteo Response Shape
Both APIs return data in this columnar format:
```json
{
  "hourly": {
    "time": ["2026-05-29T00:00", "2026-05-29T01:00", ...],
    "wave_height": [0.7, 0.8, 0.9, ...],
    "wave_period": [8.0, 8.2, 8.1, ...]
  }
}
```
168 values per variable (7 days × 24 hours).

---

## Data Transformation

### Merge + Group by Day
Transform Open-Meteo's columnar format into per-day arrays of hour objects.

```python
# fetcher.py (continued)
from collections import defaultdict

def merge_and_group(marine: dict, weather: dict) -> dict[str, list]:
    """
    Returns: { "2026-05-29": [ {time, wave_height, ...}, ... ], ... }
    Each day has 24 hour objects.
    """
    marine_h = marine["hourly"]
    weather_h = weather["hourly"]
    times = marine_h["time"]  # "2026-05-29T00:00"

    days = defaultdict(list)

    for i, timestamp in enumerate(times):
        date, time = timestamp.split("T")
        hour_obj = {
            "time": time[:5],                                    # "00:00"
            "wave_height":      round(marine_h["wave_height"][i] or 0, 2),
            "swell_period":     round(marine_h["swell_wave_period"][i] or 0, 1),
            "swell_direction":  deg_to_cardinal(marine_h["swell_wave_direction"][i]),
            "wave_period":      round(marine_h["wave_period"][i] or 0, 1),
            "wind_speed":       round(weather_h["wind_speed_10m"][i] or 0, 1),
            "wind_direction":   deg_to_cardinal(weather_h["wind_direction_10m"][i]),
            "air_temp":         round(weather_h["temperature_2m"][i] or 0, 1),
            "water_temp":       round(marine_h.get("sea_surface_temperature", [0]*len(times))[i] or 0, 1),
            "uv_index":         round(weather_h["uv_index"][i] or 0, 1),
        }
        days[date].append(hour_obj)

    return dict(days)


def deg_to_cardinal(deg: float | None) -> str:
    """Convert degrees to cardinal direction. Returns 'N/A' if None."""
    if deg is None:
        return "N/A"
    directions = ["N","NNE","NE","ENE","E","ESE","SE","SSE",
                  "S","SSW","SW","WSW","W","WNW","NW","NNW"]
    idx = round(deg / 22.5) % 16
    return directions[idx]
```

---

## Backend PATCH Call

```python
# patcher.py
import httpx
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")

def patch_weather(beach_id: str, date: str, hours: list) -> bool:
    """
    Send one day of weather data to the backend.
    Returns True on success, False on failure.
    """
    try:
        response = httpx.patch(
            f"{BACKEND_URL}/weather",
            json={
                "beach_id": beach_id,
                "date": date,
                "hours": hours
            },
            timeout=15
        )
        response.raise_for_status()
        return True
    except httpx.HTTPError as e:
        print(f"[ERROR] PATCH /weather failed for {beach_id}/{date}: {e}")
        return False
```

---

## Main Orchestrator

```python
# main.py
import sys
from beaches import BEACHES
from fetcher import fetch_marine, fetch_weather, merge_and_group
from patcher import patch_weather

def run():
    print(f"[CRON] Starting Wave Plan weather fetch")
    total, success, failed = 0, 0, 0

    for beach in BEACHES:
        print(f"[CRON] Fetching {beach['name']}...")
        try:
            marine = fetch_marine(beach["lat"], beach["lng"])
            weather = fetch_weather(beach["lat"], beach["lng"])
            days = merge_and_group(marine, weather)

            for date, hours in days.items():
                total += 1
                ok = patch_weather(beach["_id"], date, hours)
                if ok:
                    success += 1
                    print(f"  ✓ {beach['_id']} / {date}")
                else:
                    failed += 1
                    print(f"  ✗ {beach['_id']} / {date} — patch failed")

        except Exception as e:
            print(f"[ERROR] Failed to process {beach['name']}: {e}")
            failed += 1

    print(f"[CRON] Done. {success}/{total} patches succeeded, {failed} failed.")
    if failed > 0:
        sys.exit(1)  # non-zero exit so Docker logs the failure

if __name__ == "__main__":
    run()
```

---

## Error Handling Rules
- **Open-Meteo timeout** — log the error, skip that beach, continue with the rest
- **Backend PATCH failure** — log the error, mark as failed, continue. Do not retry in the same run.
- **Partial success is OK** — if 5/6 beaches succeed, that's fine. Next day's run will catch up.
- **Full failure** — exit with code 1 so Docker and logs surface the problem clearly

---

## Schedule
```
# /etc/crontab inside the container
0 2 * * * python /app/main.py
```
02:00 UTC = 05:00 Israel time (UTC+3). Runs before anyone wakes up, fresh data ready by 06:00.

---

## Running Manually (useful for testing)
```bash
# Via Docker Compose
docker compose exec cron python main.py

# Locally (with .env)
cd cron
pip install -r requirements.txt
BACKEND_URL=http://localhost:8000 python main.py
```

---

## requirements.txt
```
httpx==0.27.0
python-dotenv==1.0.1
```

## Environment Variables
```env
BACKEND_URL=http://backend:8000
```