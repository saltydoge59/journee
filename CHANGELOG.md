# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]
### Changed
- Redesigned the app's visual identity to a "Field Almanac" theme: aged-paper palette, ink-glyph day states, ruled ledger day grid, specimen-mounted photo styling, and a serif/typewriter/mono type system replacing the previous shadcn defaults and indigo-purple gradient accents. Applied consistently across trips, dates, day detail, editor, navbar, landing, and Clerk sign-in/sign-up.
- Reworked the day-editing flow so title, location, entry text, and photo uploads all autosave — removed the separate manual "Upload" and "Save Changes" buttons in favor of a single "Done" action.
- Replaced the bare file `<input>` cover-photo pickers (add trip, edit trip cover) with a themed drag-and-drop picker that shows a live thumbnail preview.
- Fixed the mobile trips list being clipped behind the bottom navigation bar.

### Added
- Photo lightbox viewer on the day detail page: click any photo to view it full-screen with keyboard/click prev-next navigation.
- Per-photo upload status (uploading/done/error) shown inline during photo mounting.
- `npm run dev` script restored for fast UI-only iteration (see CLAUDE.md for when to use it vs. `npm run preview`).

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
