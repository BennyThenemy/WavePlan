ACTIVITY_SCHEMAS = {
    "surfing": {
        "swell_height_m": {"ideal": [0.8, 2.0], "acceptable": [0.5, 2.5], "bad_below": 0.4, "bad_above": 3.0},
        "swell_period_s": {"ideal": [8, 14], "acceptable": [6, 16], "bad_below": 5},
        "wind_speed_kmh": {"ideal": [0, 15], "acceptable": [15, 25], "bad_above": 25},
        "wind_direction": {"good": "offshore", "bad": "onshore"},
        "notes": "Offshore wind for Tel Aviv beaches is W. Longer swell period = cleaner waves. Classify surfers as Beginner / Intermediate / Advanced based on conditions."
    },
    "sup": {
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
