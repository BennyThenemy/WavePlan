import httpx
import os
from dotenv import load_dotenv

load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL")


async def patch_weather(beach_id: str, date: str, hours: list) -> bool:
    """Send one day of weather data to the backend."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{BACKEND_URL}/weather",
                json={
                    "beach_id": beach_id,
                    "date": date,
                    "hours": hours,
                },
                timeout=15,
            )
            response.raise_for_status()
        return True
    except httpx.HTTPError as e:
        print(f"[ERROR] PATCH /weather failed for {beach_id}/{date}: {e}")
        return False
