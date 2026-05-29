# CLAUDE.md — Wave Plan Backend (FastAPI)

## Project Overview
Wave Plan backend is a **FastAPI** application that:
- Serves weather data and AI summaries to the frontend (GET)
- Receives weather data from the cron job (PATCH)
- Owns all MongoDB reads and writes
- Triggers AI summary generation on demand

**Nothing else talks to MongoDB directly — all DB access goes through this API.**

---

## Tech Stack
- **Framework:** FastAPI (Python 3.12)
- **DB driver:** Motor (async MongoDB driver)
- **AI:** Anthropic Python SDK
- **Server:** Uvicorn

---

## Project Structure
```
backend/
├── main.py               # FastAPI app entry point
├── routers/
│   ├── beaches.py        # GET /beaches
│   ├── weather.py        # GET /weather, PATCH /weather
│   └── summary.py        # GET /summary
├── services/
│   ├── ai.py             # AI summary generation logic
│   └── db.py             # MongoDB connection
├── schemas/
│   ├── activity_schemas.py  # Good/bad range definitions per activity
│   └── models.py            # Pydantic models
├── requirements.txt
└── Dockerfile
```

---

## MongoDB Collections

### `beaches` — seeded manually, read-only at runtime
```json
{
  "_id": "gordon-beach",
  "name": "Gordon Beach",
  "city": "Tel Aviv",
  "latitude": 32.0853,
  "longitude": 34.7692,
  "good_wind_direction": "W",
  "active": true
}
```

### `weather_data` — written by cron via PATCH /weather, purged after 7 days
**Unique index:** `{ beach_id: 1, date: 1 }`
```json
{
  "beach_id": "gordon-beach",
  "date": "2026-05-29",
  "fetched_at": "2026-05-29T05:00:00Z",
  "hours": [
    {
      "time": "00:00",
      "wave_height": 0.7,
      "swell_period": 8,
      "swell_direction": "NW",
      "wind_speed": 12,
      "wind_direction": "W",
      "air_temp": 22,
      "water_temp": 20,
      "uv_index": 0
    }
    // ... 24 total
  ]
}
```

### `ai_summaries` — written on demand, race condition safe
**Unique index:** `{ beach_id: 1, date: 1, activity: 1 }`
```json
{
  "beach_id": "gordon-beach",
  "date": "2026-05-29",
  "activity": "surfing",
  "status": "ready",
  "generated_at": "2026-05-29T08:00:00Z",
  "summary": {
    "best_for": ["Beginners", "Intermediate"],
    "board": "Soft top",
    "warning": null,
    "best_window": "09:00 - 12:00",
    "free_text": "Clean conditions in the morning with light offshore wind."
  }
}
```

**Status values:** `pending` | `ready` | `failed`

---

## API Routes

### `GET /beaches`
Returns all active beaches.
```python
@router.get("/beaches")
async def get_beaches():
    beaches = await db.beaches.find(
        {"active": True},
        {"name": 1, "city": 1}
    ).to_list(100)
    return beaches
```

---

### `GET /weather?beach_id=&date=`
Returns weather data for a beach + date.
```python
@router.get("/weather")
async def get_weather(beach_id: str, date: str):
    doc = await db.weather_data.find_one({"beach_id": beach_id, "date": date})
    if not doc:
        raise HTTPException(status_code=404, detail="No weather data for this beach/date")
    return doc
```

---

### `PATCH /weather`
Called by the cron job to upsert weather data. Also triggers purge of old data.
```python
@router.patch("/weather")
async def patch_weather(payload: WeatherPatchPayload):
    # Upsert weather document
    await db.weather_data.update_one(
        {"beach_id": payload.beach_id, "date": payload.date},
        {"$set": {
            "beach_id": payload.beach_id,
            "date": payload.date,
            "fetched_at": datetime.utcnow().isoformat(),
            "hours": payload.hours
        }},
        upsert=True
    )
    # Purge data older than 7 days
    cutoff = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
    await db.weather_data.delete_many({"date": {"$lt": cutoff}})
    return {"status": "ok"}
```

**Pydantic model for PATCH body:**
```python
class HourData(BaseModel):
    time: str
    wave_height: float
    swell_period: float
    swell_direction: str
    wind_speed: float
    wind_direction: str
    air_temp: float
    water_temp: float
    uv_index: float

class WeatherPatchPayload(BaseModel):
    beach_id: str
    date: str          # "2026-05-29"
    hours: List[HourData]  # 24 items
```

---

### `GET /summary?beach_id=&date=&activity=`
Core endpoint. Checks DB, triggers AI if needed, handles race condition.

```python
@router.get("/summary")
async def get_summary(beach_id: str, date: str, activity: str):
    col = db.ai_summaries

    # 1. Check existing
    existing = await col.find_one({"beach_id": beach_id, "date": date, "activity": activity})

    if existing and existing["status"] == "ready":
        return {"status": "ready", "summary": existing["summary"]}

    if existing and existing["status"] == "pending":
        age = (datetime.utcnow() - datetime.fromisoformat(existing["created_at"])).seconds
        if age < 60:
            return {"status": "pending"}
        # Stale pending — delete and retry
        await col.delete_one({"_id": existing["_id"]})

    # 2. Try to insert pending (unique index prevents race condition)
    try:
        await col.insert_one({
            "beach_id": beach_id,
            "date": date,
            "activity": activity,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        })
    except DuplicateKeyError:
        # Another request won the race — tell client to keep polling
        return {"status": "pending"}

    # 3. Winner: trigger AI generation in background
    background_tasks.add_task(generate_and_save_summary, beach_id, date, activity)
    return {"status": "pending"}
```

---

## AI Summary Generation

### Activity Schemas
```python
ACTIVITY_SCHEMAS = {
    "surfing": {
        "swell_height_m": {"ideal": [0.8, 2.0], "acceptable": [0.5, 2.5], "bad_below": 0.4, "bad_above": 3.0},
        "swell_period_s": {"ideal": [8, 14], "acceptable": [6, 16], "bad_below": 5},
        "wind_speed_kmh": {"ideal": [0, 15], "acceptable": [15, 25], "bad_above": 25},
        "wind_direction": {"good": "offshore", "bad": "onshore"},
        "notes": "Offshore wind for Tel Aviv beaches is W. Longer swell period = cleaner waves. Classify surfers as Beginner / Intermediate / Advanced based on conditions."
    },
    "supping": {
        "wave_height_m": {"ideal": [0.2, 0.6], "acceptable": [0.1, 0.8], "bad_above": 1.0},
        "wind_speed_kmh": {"ideal": [0, 20], "acceptable": [20, 30], "bad_above": 30},
        "notes": "Wind is the primary danger for SUP. Explicitly warn when wind_speed > 25 km/h — strong onshore wind can push paddlers out to sea."
    },
    "casual": {
        "wave_height_m": {"ideal": [0, 0.4], "acceptable": [0.4, 0.8], "bad_above": 1.0},
        "water_temp_c": {"ideal": [22, 30], "acceptable": [18, 22], "bad_below": 18},
        "wind_speed_kmh": {"ideal": [0, 20], "bad_above": 30},
        "notes": "Casual covers both swimming and beach day. Warn about rip current risk when wave_height > 0.8m + strong onshore wind. Mention UV protection when uv_index >= 6."
    }
}
```

### AI Prompt
```python
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
```

### AI Call
```python
async def generate_and_save_summary(beach_id: str, date: str, activity: str):
    try:
        beach = await db.beaches.find_one({"_id": beach_id})
        weather = await db.weather_data.find_one({"beach_id": beach_id, "date": date})

        client = anthropic.AsyncAnthropic()
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
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
```

---

## MongoDB Indexes
Create on first startup:
```python
async def create_indexes():
    await db.weather_data.create_index([("beach_id", 1), ("date", 1)], unique=True)
    await db.weather_data.create_index([("date", 1)])
    await db.ai_summaries.create_index(
        [("beach_id", 1), ("date", 1), ("activity", 1)],
        unique=True
    )
```

---

## Requirements
```
fastapi==0.111.0
uvicorn==0.30.1
motor==3.4.0
anthropic==0.28.0
pydantic==2.7.1
python-dotenv==1.0.1
```

## Environment Variables
```env
MONGODB_URI=mongodb://mongodb:27017/waveplan
ANTHROPIC_API_KEY=sk-ant-your-key-here
```