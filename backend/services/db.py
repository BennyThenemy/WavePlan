import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/waveplan")

client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_default_database()


async def create_indexes():
    await db.weather_data.create_index([("beach_id", 1), ("date", 1)], unique=True)
    await db.weather_data.create_index([("date", 1)])
    await db.ai_summaries.create_index(
        [("beach_id", 1), ("date", 1), ("activity", 1)],
        unique=True
    )
