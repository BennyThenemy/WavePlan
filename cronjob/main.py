import asyncio
import sys
import os
import httpx
from dotenv import load_dotenv
from fetcher import fetch_marine, fetch_weather, merge_and_group
from patcher import patch_weather

load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL")


async def fetch_beaches():
    """Fetch active beaches from backend API."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BACKEND_URL}/beaches", timeout=10)
            response.raise_for_status()
            beaches = response.json()
            # Transform API response to match our internal format
            return [
                {
                    "_id": beach.get("slug"),
                    "name": beach.get("name"),
                    "lat": beach.get("latitude"),
                    "lng": beach.get("longitude"),
                }
                for beach in beaches
            ]
    except Exception as e:
        print(f"[ERROR] Failed to fetch beaches: {e}")
        sys.exit(1)


async def run():
    print("[CRON] Starting Wave Plan weather fetch")
    beaches = await fetch_beaches()
    total, success, failed = 0, 0, 0

    for beach in beaches:
        print(f"[CRON] Fetching {beach['name']}...")
        try:
            marine = await fetch_marine(beach["lat"], beach["lng"])
            weather = await fetch_weather(beach["lat"], beach["lng"])
            days = merge_and_group(marine, weather)

            for date, hours in sorted(days.items()):
                total += 1
                ok = await patch_weather(beach["_id"], date, hours)
                if ok:
                    success += 1
                    print(f"  ✓ {beach['_id']} / {date}")
                else:
                    failed += 1
                    print(f"  ✗ {beach['_id']} / {date} — patch failed")

        except Exception as e:
            print(f"[ERROR] Failed to process {beach['name']}: {e}")
            failed += 1

    print(f"[CRON] Done. {success}/{total} patches succeeded, {failed} failed.")
    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(run())
