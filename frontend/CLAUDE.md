# CLAUDE.md — Wave Plan Frontend

## Project Overview
Wave Plan is a mobile-first website (380px wide) that tells users if the sea is good for their activity — surfing, SUP, or a casual beach day. Built with Next.js + TypeScript + Tailwind CSS.

**Frontend only talks to the FastAPI backend. It never touches MongoDB directly.**

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Rubik font (Google Fonts)
- **HTTP client:** fetch (native)

---

## Design System

### Colors (strict — no other colors)
```
--color-primary:    #006d77   (headers, active tab, icons, key values)
--color-secondary:  #83c5be   (card backgrounds, borders, accents)
--color-background: #edf6f9   (page background, card surfaces)
--color-dark:       #00272b   (body text, dark contrast)
--color-white:      #ffffff   (table header text, inverted elements)
```

### Typography
- Font: **Rubik** (import from Google Fonts)
- Bold (`font-bold`) — values, headings, table headers
- Italic (`italic`) — AI summary free text
- Regular — labels, table body, navigation

### Viewport
- Mobile-first: 380px wide
- Thumb-friendly tap targets (min 44px height)

---

## Page Structure (top to bottom)

### 1. Header
- App name "Wave Plan" — Rubik Bold, `#006d77`
- Beach selector button — shows current beach name + GPS pin icon
- On first load: auto-detect GPS → map to nearest beach
- Tapping opens dropdown list of preset beaches (fetched from `GET /beaches`)

### 2. Date Navigator
- Format: `◁  Today 29.5.26  ▷`
- Arrows navigate ±1 day, range: today → today+6 (7 days max)
- Cannot navigate before today

### 3. Activity Tabs
- Tabs: `Surfing | SUP | Casual | More`
- Active tab: `#006d77` bottom border + Rubik Bold
- Inactive: Rubik Regular, `#83c5be` text
- `More` tab: grayed out, lock icon, non-tappable
- Switching tabs re-fetches AI summary for selected activity

### 4. AI Summary Card
- Background: `#edf6f9`, border: `#83c5be`
- Structured fields:
  - 🏄 **Best for:** e.g. "Beginners, Intermediate"
  - 🏋 **Board:** e.g. "Soft top" *(surfing only — hide for SUP/Casual)*
  - ⚠️ **Warning:** e.g. "Wind picking up after 13:00" *(null = don't render)*
  - 🕘 **Best window:** e.g. "09:00 – 12:00"
  - 💬 1–2 lines free italic text below
- Loading state: spinner while `status === "pending"`
- Poll `GET /summary` every 5 seconds when pending
- Error state: "Could not load summary, try again" + retry button

### 5. Metric Cards
Horizontal scrollable row of 7 cards. Each card:
- Background: `#edf6f9`, border: `#83c5be`, subtle shadow
- Small Rubik Regular label on top
- Large Rubik Bold value in `#006d77` center
- Small unit text below

| # | Label | Example | Unit |
|---|---|---|---|
| 1 | Swell Period | 9 | sec |
| 2 | Swell Height | 1.2 | m |
| 3 | Wind | 14 SW | km/h |
| 4 | Temp | 26° / 22° | air / water |
| 5 | UV Index | 7 | index |
| 6 | Swell Dir | NW | — |
| 7 | Tide | 🔒 | Coming Soon |

Card 7: faded opacity, lock icon, non-interactive.

### 6. Waves by Hour Table
- Section title: "waves by hour" — Rubik Bold, `#006d77`
- Display every 3 hours: 00:00, 03:00 ... 21:00 (8 rows)
- Columns: `Time | Wave Height | Swell Period | Swell Direction | Wind Speed | Wind Direction`
- Header row: background `#006d77`, white text, Rubik Bold
- Body rows: alternating white / `#edf6f9`, Rubik Regular
- Horizontally scrollable on narrow screens

---

## Backend API Integration

### Base URL
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL // e.g. http://localhost:8000
```

### Endpoints (all GET — frontend is read-only)

#### `GET /beaches`
```typescript
// Response
[{ _id: string, name: string, city: string }]
```

#### `GET /weather?beach_id=&date=`
```typescript
// Response
{
  beach_id: string,
  date: string,
  hours: Array<{
    time: string,            // "00:00"
    wave_height: number,     // meters
    swell_period: number,    // seconds
    swell_direction: string, // "NW"
    wind_speed: number,      // km/h
    wind_direction: string,  // "W"
    air_temp: number,
    water_temp: number,
    uv_index: number
  }>
}
```

#### `GET /summary?beach_id=&date=&activity=`
```typescript
// activity: "surfing" | "supping" | "casual"

// Response — ready
{
  status: "ready",
  summary: {
    best_for: string[],
    board: string | null,
    warning: string | null,
    best_window: string,
    free_text: string
  }
}

// Response — pending (poll again in 5s)
{ status: "pending" }

// Response — error
{ status: "error", message: string }
```

### Polling Logic
```typescript
const pollSummary = async (beachId: string, date: string, activity: string) => {
  const res = await fetch(`${API_BASE}/summary?beach_id=${beachId}&date=${date}&activity=${activity}`)
  const data = await res.json()
  if (data.status === 'pending') {
    setTimeout(() => pollSummary(beachId, date, activity), 5000)
  } else {
    setSummary(data.summary)
    setSummaryStatus(data.status)
  }
}
```

---

## State Management
```typescript
const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null)
const [selectedDate, setSelectedDate] = useState<string>(today)
const [selectedActivity, setSelectedActivity] = useState<Activity>('surfing')
const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
const [summary, setSummary] = useState<Summary | null>(null)
const [summaryStatus, setSummaryStatus] = useState<'idle'|'pending'|'ready'|'error'>('idle')
```

Re-fetch both `weather` and `summary` whenever `selectedBeach`, `selectedDate`, or `selectedActivity` changes.

---

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Wave Plan
```