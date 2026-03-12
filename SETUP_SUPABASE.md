# Supabase + Backend Setup

## 1. Fill environment files

1. Copy `.env.example` to `.env` in project root.
2. Copy `backend/.env.example` to `backend/.env`.
3. Fill values:
- `VITE_API_BASE_URL=http://localhost:4000`
- `VITE_PROJECT_ID=your-project-id`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

## 2. Create database schema

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.

## 3. Install dependencies

```bash
npm install
npm --prefix backend install
```

## 4. Run both apps

```bash
npm run dev:full
```

- Frontend: http://localhost:8080
- Backend: http://localhost:4000
- Health check: http://localhost:4000/api/health

## 5. Verify data is stored

1. Open heatmap page: `/dashboard/heatmaps`.
2. Click and move mouse on the page for 10-20 seconds.
3. Check Supabase table `interaction_events` for new rows.

## 6. Troubleshooting

- CORS error: set `CORS_ORIGIN` in `backend/.env` to your frontend URL.
- Empty heatmap: verify `VITE_PROJECT_ID` matches inserted `project_id`.
- 500 from API: confirm service role key and schema are correct.
- No backend start: run `npm --prefix backend run dev` directly to inspect logs.
