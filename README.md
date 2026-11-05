# Provider Data Factory

A NestJS service that reads raw Talabat exports from MongoDB, cleans and normalises them, and writes a domain model to a second database.

> **Status:** Partly done. BullMQ, quarantine and resume are not done yet.

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d mongo redis
```

Raw data files are not in this repo (they contain an API key). Put them in a folder outside the repo, then:

```powershell
$env:SEED_DIR="C:\path\to\provider-data"
npm run seed
```

Expected output:

```
raw_locations: 8 docs
raw_restaurants: 70 docs
raw_menus: 500 docs
```

## Run

```bash
npm run start:dev
```

| Method | Path | What it does |
|---|---|---|
| GET | `/health` | Checks MongoDB and Redis |
| POST | `/runs` | Starts a run |
| GET | `/runs/:id` | Shows a run |
| GET | `/runs/:id/errors` | Shows errors (always empty for now) |

## Test

```bash
npm test
npm run test:integration
```

## Folders

- `src/core/`: general pipeline code, not tied to Talabat.
- `src/providers/talabat/`: Talabat-specific code.
- `src/domain/`: saves data to MongoDB.
- `src/health/`, `src/runs/`: API.

## Key decisions

- Restaurant id is `outletCode` (from the URL).
- Bad rows are rejected with a reason, not silently dropped.
- Saving twice gives the same result (no duplicates).

## Not done

- BullMQ queue and workers.
- Saving rejected rows (quarantine).
- Resuming a stopped run.
- Full pipeline integration test.