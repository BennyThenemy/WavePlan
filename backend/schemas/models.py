from typing import List
from pydantic import BaseModel


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
