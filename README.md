# CASS Mapping Request Tool

A self-service form for submitting CASS property mapping requests.

## Setup

```bash
npm install
npm run dev
```

## Data sources

Employee and property data is fetched live from Google Sheets (CSV export).
Both sheets must be published: **File → Share → Publish to web → CSV**.

- Employees: `1ooPeyXL7IUwPzhnzlyA2siYw3PxUnmpu-kd_Wr2NGoQ` (gid `741389375`)
- Properties: `12f65djC7f2uW-kWM9T-qrGeHEKm4LyO_QSGnCOypIYk` (gid `642046466`)

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel — zero config needed, Next.js is auto-detected

## Next steps

- Asana task creation on submit (via Asana API)
- Auth (restrict to TheSoul Google accounts)
