from typing import List, Optional
from pydantic import BaseModel, field_validator


def generate_slug(name: str) -> str:
    return name.lower().replace(" ", "-")


class Beach(BaseModel):
    name: str
    city: str
    latitude: float
    longitude: float
    good_wind_direction: str
    active: Optional[bool] = True
    slug: Optional[str] = None

    @field_validator("slug", mode="before")
    @classmethod
    def set_slug(cls, v, info):
        if v is None and "name" in info.data:
            return generate_slug(info.data["name"])
        return v


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
    date: str
    hours: List[HourData]
