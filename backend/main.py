from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from services.db import create_indexes, migrate_beach_slugs
from routers import beaches, weather, summary


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    await migrate_beach_slugs()
    yield


app = FastAPI(title="WavePlan API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(beaches.router)
app.include_router(weather.router)
app.include_router(summary.router)
