from datetime import datetime
from fastapi import APIRouter, BackgroundTasks
from pymongo.errors import DuplicateKeyError

from services.db import db
from services.ai import generate_and_save_summary

router = APIRouter(tags=["ai"])


@router.get("/summary")
async def get_summary(beach_id: str, date: str, activity: str, background_tasks: BackgroundTasks):
    col = db.ai_summaries

    existing = await col.find_one({"beach_id": beach_id, "date": date, "activity": activity})

    if existing and existing["status"] == "ready":
        return {"status": "ready", "summary": existing["summary"]}

    if existing and existing["status"] == "pending":
        age = (datetime.utcnow() - datetime.fromisoformat(existing["created_at"])).seconds
        if age < 60:
            return {"status": "pending"}
        await col.delete_one({"_id": existing["_id"]})

    try:
        await col.insert_one({
            "beach_id": beach_id,
            "date": date,
            "activity": activity,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        })
    except DuplicateKeyError:
        return {"status": "pending"}

    background_tasks.add_task(generate_and_save_summary, beach_id, date, activity)
    return {"status": "pending"}
