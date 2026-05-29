from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from bson import ObjectId

from services.db import db
from schemas.models import WeatherPatchPayload

router = APIRouter()


def serialize_doc(doc):
    doc["_id"] = str(doc["_id"]) if isinstance(doc.get("_id"), ObjectId) else doc.get("_id")
    return doc


@router.get("/weather")
async def get_weather(beach_id: str, date: str):
    doc = await db.weather_data.find_one({"beach_id": beach_id, "date": date})
    if not doc:
        raise HTTPException(status_code=404, detail="No weather data for this beach/date")
    return serialize_doc(doc)


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
