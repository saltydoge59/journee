# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-08-17
### Changed
- Migrated the entire app from Next.js 15 (App Router) + OpenNext to Vite + React Router + a Hono API worker, deployed directly via `wrangler`. The app was already a client-only SPA with zero server-side data fetching, so this removes a full SSR framework it wasn't using — `npm run dev` now runs with real local D1/R2/Workers AI bindings and hot reload in one command (`@cloudflare/vite-plugin`), replacing the previous three-mode dev/preview/preview:remote split.
- All 6 API routes ported from Next `route.ts` handlers to Hono routes (`worker/routes/*.ts`) using `@clerk/hono`.
- All 9 pages ported from Next App Router to `react-router-dom`.
- Fonts (Source Serif 4, Special Elite, JetBrains Mono) now self-hosted via `@fontsource` instead of `next/font`.
- `npm run dev` → `vite`, `npm run build` → `vite build`, `npm run preview(:remote)` → `vite build && wrangler dev(--remote)`, `npm run deploy` → `vite build && wrangler deploy`.

### Removed
- Next.js, `@clerk/nextjs`, `@opennextjs/cloudflare`, `eslint-config-next`, and all of `src/app/` (the old Next pages/API routes) — fully superseded by the Vite/Hono port.
- `npm run lint` — no replacement ESLint config exists yet now that `eslint-config-next` is gone; flagged as a gap, not silently dropped.

## [0.3.2] - 2026-08-16
### Fixed
- Trips/day logs and photos wouldn't load for any trip whose name contained `&` (e.g. "Guangzhou & Guilin"). The `trip_name` query param was getting corrupted before reaching the `/api/logs` and `/api/photos` route handlers — Next/OpenNext's server-side URL re-parsing was splitting on the literal `&` inside the value. Fixed by base64url-encoding `trip_name` before it's placed in the query string, since base64url output can't contain characters that are ever treated as URL/query delimiters.

## [0.3.1] - 2026-08-16
### Changed
- `npm run dev` now runs with Turbopack (`next dev --turbo`) for faster dev server startup and route compilation.
- Replaced the MUI-based range slider (day selector on `/snapspot`) with a Radix UI slider, matching the rest of the app's shadcn/Radix component pattern.

### Removed
- Unused dependencies with zero remaining imports: `@coreui/coreui`, `@coreui/react`, `@tabler/core`, `primereact`.
- Duplicate animation library `motion` (superseded by `framer-motion`, already used throughout the app).
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` — no longer needed after the slider swap.

## [0.3.0] - 2026-08-15
### Added
- Photo lightbox viewer on the day detail page: click any photo to view it full-screen with keyboard/click prev-next navigation.
- Per-photo upload status (uploading/done/error) shown inline during photo mounting.
- `npm run dev` script restored for fast UI-only iteration (see CLAUDE.md for when to use it vs. `npm run preview`).
- Web app manifest (`public/manifest.webmanifest`) and app icons, enabling the site to be installed as a standalone app.
- Android app distribution via Trusted Web Activity wrapper (sideloaded APK, not on Play Store) — see `android/README.md` to rebuild.

### Changed
- Redesigned the app's visual identity to a "Field Almanac" theme: aged-paper palette, ink-glyph day states, ruled ledger day grid, specimen-mounted photo styling, and a serif/typewriter/mono type system replacing the previous shadcn defaults and indigo-purple gradient accents. Applied consistently across trips, dates, day detail, editor, navbar, landing, and Clerk sign-in/sign-up.
- Reworked the day-editing flow so title, location, entry text, and photo uploads all autosave — removed the separate manual "Upload" and "Save Changes" buttons in favor of a single "Done" action.
- Replaced the bare file `<input>` cover-photo pickers (add trip, edit trip cover) with a themed drag-and-drop picker that shows a live thumbnail preview.
- Fixed the mobile trips list being clipped behind the bottom navigation bar.
- Fixed horizontal overflow/scrollbar on trips, dates, and day pages caused by `w-screen`/`h-screen` ignoring scrollbar width — switched to `w-full`/`h-full` within a flex layout instead.

## [0.2.0] - 2026-08-15
### Changed
- Geolocation API (`/api/geo`) now runs on Cloudflare Workers AI instead of the Google Gemini API

### Removed
- Google Gemini API dependency (`@google/generative-ai`, `NEXT_PUBLIC_Gemini_API`)

## [0.1.0] - 2026-08-15
### Added
- Cloudflare D1 database for trips, logs, photos, and users
- Cloudflare R2 bucket for image storage
- Cloudflare Workers deployment via OpenNext

### Changed
- Client-side Supabase calls replaced with server-side Next.js API routes

### Removed
- Supabase dependency (client SDK, keys, and secrets)
