import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/waveplan")

client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_default_database()


def generate_slug(name: str) -> str:
    return name.lower().replace(" ", "-")


async def create_indexes():
    await db.weather_data.create_index([("beach_id", 1), ("date", 1)], unique=True)
    await db.weather_data.create_index([("date", 1)])
    await db.ai_summaries.create_index(
        [("beach_id", 1), ("date", 1), ("activity", 1)],
        unique=True
    )


async def migrate_beach_slugs():
    beaches = await db.beaches.find({"slug": {"$exists": False}}).to_list(None)
    for beach in beaches:
        slug = generate_slug(beach["name"])
        await db.beaches.update_one(
            {"_id": beach["_id"]},
            {"$set": {"slug": slug}}
        )
