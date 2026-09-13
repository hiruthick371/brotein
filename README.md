# Brotein

Full-stack food & macro tracker. MERN monorepo (npm workspaces): Express + MongoDB API,
React (Vite) web dashboard, and an Expo (React Native) mobile app, sharing types/constants/API
client from `/shared`.

## Structure

```
/backend   Express + Mongoose REST API (TypeScript)
/web       React + Vite dashboard (TypeScript)
/mobile    Expo React Native app (TypeScript)
/shared    Shared types, constants, and API client used by web + mobile
```

## Prerequisites

- Node.js 20+
- A MongoDB instance (local `mongod`, Docker, or Atlas)
- For mobile: the Expo Go app on your phone, or an Android/iOS simulator

## 1. Install dependencies

```bash
npm install
```

This installs all workspaces (`shared`, `backend`, `web`, `mobile`) at once.

## 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env
```

Edit `backend/.env` and point `MONGODB_URI` at your MongoDB instance. If you're testing the
mobile app on a physical device, set `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env` to your machine's
LAN IP (e.g. `http://192.168.1.20:4000`) instead of `localhost`, since the phone can't resolve your
computer's `localhost`.

## 3. Build the shared package

```bash
npm run build:shared
```

Re-run this (or `npm run dev -w shared` to watch) whenever you change `/shared/src`.

## 4. Seed the food database

```bash
npm run seed
```

Loads `backend/data/foodItems.json` (~200 common Indian + international foods with macros) into
the `FoodItem` collection.

## 5. Run the apps

```bash
npm run dev:backend   # Express API on http://localhost:4000
npm run dev:web       # Vite dev server on http://localhost:5173
npm run dev:mobile    # Expo dev server (scan QR with Expo Go, or press a/i)
```

## API overview

All `/api/*` routes except `/api/auth/*` require `Authorization: Bearer <token>` (returned from
register/login). See `shared/src/apiClient.ts` for the typed client both frontends use.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/food-items?search=` | Search the seeded food database |
| POST | `/api/entries` | Log a food entry (by `foodItemId` + `servingMultiplier`, or fully custom) |
| GET | `/api/entries?from&to&mealType` | List your entries, optionally filtered |
| PUT | `/api/entries/:id` | Edit an entry |
| DELETE | `/api/entries/:id` | Delete an entry |
| GET | `/api/summary/daily?date=YYYY-MM-DD` | Totals + entries for one day |
| GET | `/api/summary/weekly?from&to` | Totals + per-day breakdown (aggregation pipeline) |
| GET | `/api/summary/monthly?month&year` | Totals + per-day breakdown for a month |
| GET | `/api/goals` | Get your daily macro targets |
| PUT | `/api/goals` | Update your daily macro targets |

## Notes

- Entries copy calories/macros from the matched `FoodItem` at log time (scaled by
  `servingMultiplier`), so later edits to the master food database don't retroactively change
  historical logs — or you can skip `foodItemId` entirely and supply fully custom macros.
- Weekly/monthly summaries use MongoDB aggregation (`$facet` with `$group` by day and an overall
  total) rather than pulling all entries into the app.
- All date-only params (`date`, `from`, `to`) are `YYYY-MM-DD` and treated as UTC day boundaries.
