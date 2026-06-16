from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from services.db import db
from schemas.models import WeatherPatchPayload

router = APIRouter(tags=["weather"])


def serialize_doc(doc):
    doc["_id"] = str(doc["_id"]) if isinstance(doc.get("_id"), ObjectId) else doc.get("_id")
    return doc


def calculate_daytime_metrics(hours):
    """Calculate averaged metrics for daytime (6h-18h)."""
    daytime_hours = [h for h in hours if 6 <= int(h["time"].split(":")[0]) <= 18]

    if not daytime_hours:
        return None

    return {
        "air_temp": round(sum(h["air_temp"] for h in daytime_hours) / len(daytime_hours), 1),
        "water_temp": round(sum(h["water_temp"] for h in daytime_hours) / len(daytime_hours), 1),
        "uv_index": round(sum(h["uv_index"] for h in daytime_hours) / len(daytime_hours), 1),
        "wind_speed": round(sum(h["wind_speed"] for h in daytime_hours) / len(daytime_hours), 0),
    }


@router.get("/weather")
async def get_weather(beach_id: str, date: str):
    doc = await db.weather_data.find_one({"beach_id": beach_id, "date": date})
    if not doc:
        raise HTTPException(status_code=404, detail="No weather data for this beach/date")

    result = serialize_doc(doc)
    result["daytime_metrics"] = calculate_daytime_metrics(result.get("hours", []))
    return result


@router.patch("/weather")
async def patch_weather(payload: WeatherPatchPayload):
    await db.weather_data.update_one(
        {"beach_id": payload.beach_id, "date": payload.date},
        {"$set": {
            "beach_id": payload.beach_id,
            "date": payload.date,
            "fetched_at": datetime.utcnow().isoformat(),
            "hours": [h.model_dump() for h in payload.hours]
        }},
        upsert=True
    )
    cutoff = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
    await db.weather_data.delete_many({"date": {"$lt": cutoff}})
    return {"status": "ok"}
