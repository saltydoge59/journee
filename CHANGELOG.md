# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

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
