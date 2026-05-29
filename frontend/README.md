# Wave Plan — Frontend

Mobile-first beach condition app. Tells users if sea is good for surfing, SUP, or casual beach day.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + Rubik font
- Talks to FastAPI backend — never touches MongoDB directly

## Setup

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Wave Plan
```

## Backend

Requires FastAPI backend running on `NEXT_PUBLIC_API_URL`. See `../backend/`.
