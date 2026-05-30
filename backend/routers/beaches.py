from fastapi import APIRouter, HTTPException
from bson import ObjectId
from typing import List

from services.db import db
from schemas.models import Beach

router = APIRouter(tags=["beach"])


def serialize_doc(doc):
    doc["_id"] = str(doc["_id"]) if isinstance(doc.get("_id"), ObjectId) else doc.get("_id")
    return doc


@router.get("/beaches")
async def get_beaches():
    beaches = await db.beaches.find(
        {"active": True},
        {"name": 1, "city": 1, "latitude": 1, "longitude": 1}
    ).to_list(100)
    return [serialize_doc(b) for b in beaches]


@router.get("/beaches/{name}")
async def get_beach_by_name(name: str):
    doc = await db.beaches.find_one({"name": name})
    if not doc:
        raise HTTPException(status_code=404, detail="Beach not found")
    return serialize_doc(doc)


@router.post("/beaches")
async def insert_beaches(beaches: List[Beach]):
    docs = [b.model_dump() for b in beaches]
    result = await db.beaches.insert_many(docs, ordered=False)
    return {"inserted": len(result.inserted_ids)}
