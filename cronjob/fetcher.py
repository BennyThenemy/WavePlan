import httpx
import os
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

MARINE_URL = os.getenv("MARINE_URL", "https://marine-api.open-meteo.com/v1/marine")
WEATHER_URL = os.getenv("WEATHER_URL", "https://api.open-meteo.com/v1/forecast")

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


async def fetch_marine(lat: float, lng: float) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            MARINE_URL,
            params={
                "latitude": lat,
                "longitude": lng,
                "hourly": ",".join(MARINE_VARS),
                "forecast_days": 7,
                "timezone": "Asia/Jerusalem",
            },
            timeout=30,
        )
        response.raise_for_status()
        if not response.text:
            raise ValueError(f"Empty response from {MARINE_URL}")
        return response.json()


async def fetch_weather(lat: float, lng: float) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            WEATHER_URL,
            params={
                "latitude": lat,
                "longitude": lng,
                "hourly": ",".join(WEATHER_VARS),
                "forecast_days": 7,
                "timezone": "Asia/Jerusalem",
            },
            timeout=30,
        )
        response.raise_for_status()
        if not response.text:
            raise ValueError(f"Empty response from {WEATHER_URL}")
        return response.json()


def deg_to_cardinal(deg: float | None) -> str:
    if deg is None:
        return "N/A"
    directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    idx = round(deg / 22.5) % 16
    return directions[idx]


def merge_and_group(marine: dict, weather: dict) -> dict[str, list]:
    """Transform columnar Open-Meteo data into per-day arrays of hour objects."""
    marine_h = marine["hourly"]
    weather_h = weather["hourly"]
    times = marine_h["time"]

    days = defaultdict(list)

    for i, timestamp in enumerate(times):
        date, time = timestamp.split("T")
        hour_obj = {
            "time": time[:5],
            "wave_height": round(marine_h["wave_height"][i] or 0, 2),
            "swell_period": round(marine_h["swell_wave_period"][i] or 0, 1),
            "swell_direction": deg_to_cardinal(marine_h["swell_wave_direction"][i]),
            "wind_speed": round(weather_h["wind_speed_10m"][i] or 0, 1),
            "wind_direction": deg_to_cardinal(weather_h["wind_direction_10m"][i]),
            "air_temp": round(weather_h["temperature_2m"][i] or 0, 1),
            "water_temp": 20.0,
            "uv_index": round(weather_h["uv_index"][i] or 0, 1),
        }
        days[date].append(hour_obj)

    return dict(days)
