import json
import os
import anthropic
from datetime import datetime

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


async def generate_and_save_summary(beach_id: str, date: str, activity: str):
    try:
        beach = await db.beaches.find_one({"_id": beach_id})
        weather = await db.weather_data.find_one({"beach_id": beach_id, "date": date})

        client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": build_user_prompt(beach, date, activity, weather["hours"])}]
        )

        summary = json.loads(response.content[0].text)

        await db.ai_summaries.update_one(
            {"beach_id": beach_id, "date": date, "activity": activity},
            {"$set": {
                "status": "ready",
                "summary": summary,
                "generated_at": datetime.utcnow().isoformat()
            }}
        )
    except Exception as e:
        await db.ai_summaries.update_one(
            {"beach_id": beach_id, "date": date, "activity": activity},
            {"$set": {"status": "failed"}}
        )
        raise e
