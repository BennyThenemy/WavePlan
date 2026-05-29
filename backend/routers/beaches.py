from fastapi import APIRouter
from bson import ObjectId

from services.db import db

router = APIRouter()


def serialize_doc(doc):
    doc["_id"] = str(doc["_id"]) if isinstance(doc.get("_id"), ObjectId) else doc.get("_id")
    return doc


@router.get("/beaches")
async def get_beaches():
    beaches = await db.beaches.find(
        {"active": True},
        {"name": 1, "city": 1}
    ).to_list(100)
    return [serialize_doc(b) for b in beaches]
