# CivicPulse India

**Real-time civic issue reporting for India** — built for Hack Devengers 1.0.

Citizens report potholes, broken streetlights, garbage, and drainage issues with **photo + GPS**. Reports appear on a **live public map** in real time. Municipal admins verify and resolve issues transparently.

## Features

- **Live interactive map** — Leaflet with marker clustering, category filters, status filters
- **Report flow** — Photo upload, auto GPS, severity, drag-and-drop
- **AI photo analysis** — Gemini auto-fills category, title, description from evidence photo
- **Real-time sync** — Supabase Realtime; new pins pulse instantly
- **Impact dashboard** — Categories, cities leaderboard, 14-day trend chart
- **Bilingual UI** — English + Hindi
- **Admin console** — `/admin` — verify, track, resolve reports
- **Share deep links** — `?issue=<id>` opens map focused on a report

## Tech Stack

- React 19 + TypeScript + TanStack Start/Router
- Tailwind CSS v4 (glassmorphism, amber/emerald design system)
- Supabase (PostgreSQL + Storage + Realtime)
- Google Gemini 1.5 Flash (photo analysis)
- Leaflet + Recharts

## Quick Start

```bash
npm install
cp .env.example .env   # add your keys
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key (for AI photo analysis) |
| `VITE_ADMIN_PASSCODE` | Admin panel passcode (default: civicpulse2026) |

## Deploy (Vercel)

1. Push to GitHub
2. Import on Vercel
3. Add env vars from `.env.example`
4. Deploy — API route at `/api/analyze-issue` handles Gemini vision

## Demo Flow (for judges)

1. Open site → switch to **हि** for Hindi
2. Scroll **How it works** → **Live map**
3. Click **Report an Issue** → upload a pothole/garbage photo
4. Watch **AI auto-fill** category & description
5. Submit → pin appears on map with pulse animation
6. Open `/admin` → mark issue as Verified → In Progress → Resolved

## Problem Solved

Indian cities lack transparent, geotagged public records of civic infrastructure issues. CivicPulse gives citizens a voice and municipalities an actionable, evidence-backed queue — from report to resolution.

---

Built with care for India 🇮🇳 · Hack Devengers 1.0
