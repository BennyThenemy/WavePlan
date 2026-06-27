import json
import os
from google import genai
from datetime import datetime, timezone
from services.db import db
from schemas.activity_schemas import ACTIVITY_SCHEMAS

SYSTEM_PROMPT = """
You are a sea conditions expert for Israeli Mediterranean beaches.
You receive hourly weather data and a schema defining good/bad ranges for an activity.
Respond ONLY with a valid JSON object — no markdown, no preamble, no explanation.

Output format:
{
  "best_for": ["Beginners", "Intermediate"],
  "board": "Soft top",
  "warning": "Wind picking up after 13:00",
  "best_window": "09:00 - 12:00",
  "free_text": "1-2 sentences plain language summary."
}

Rules:
- best_for: list from ["Beginners", "Intermediate", "Advanced"]. Empty list if not suitable for anyone.
- board: surfing only. null for other activities.
- warning: null if no warning needed.
- best_window: based on hourly data. "Not recommended" if no good window exists.
- free_text: plain language, 1-2 sentences max.
"""


def build_user_prompt(beach, date, activity, hours):
    return f"""
Activity: {activity}
Beach: {beach['name']} (offshore wind direction: {beach['good_wind_direction']})
Date: {date}

Activity schema (good/bad thresholds):
{json.dumps(ACTIVITY_SCHEMAS[activity], indent=2)}

Hourly weather data (24 hours):
{json.dumps(hours, indent=2)}
"""

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    enterprise=False,
    vertexai=False
)


async def generate_and_save_summary(beach_id: str, date: str, activity: str):
    try:
        beach = await db.beaches.find_one({"slug": beach_id})
        weather = await db.weather_data.find_one({"beach_id": beach_id, "date": date})

        if not beach or not weather:
            raise ValueError(f"Missing beach or weather data for {beach_id}/{date}")

        response = await client.aio.models.generate_content(
            model=os.getenv("GEMINI_MODEL"),
            contents=f"{SYSTEM_PROMPT}\n\n{build_user_prompt(beach, date, activity, weather['hours'])}"
        )

        raw = (response.text or "").strip()
        if not raw:
            raise ValueError(f"Empty response from Gemini for {beach_id}/{date}/{activity}")
        # Strip markdown fences if model ignored the prompt instruction
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        summary = json.loads(raw)

        await db.ai_summaries.update_one(
            {"beach_id": beach_id, "date": date, "activity": activity},
            {"$set": {
                "status": "ready",
                "summary": summary,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    except Exception as e:
        await db.ai_summaries.update_one(
            {"beach_id": beach_id, "date": date, "activity": activity},
            {"$set": {"status": "failed"}}
        )
        raise e
