# Project Instructions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5 (strict mode) |
| Framework | Vite + React Router (SPA), React 18 |
| Backend | Hono (Cloudflare Worker) |
| Styling | Tailwind CSS + shadcn/Radix, MUI, Aceternity |
| Auth | Clerk (`@clerk/react`, `@clerk/hono`) |
| Database | Cloudflare D1 |
| Storage | Cloudflare R2 (images), served via custom domain `journee-media.curteisyang.uk` |
| Deploy | Cloudflare Workers via Wrangler |

## Code Style
- Path alias `@/*` → `src/*`

## Build & Run
Pick the mode by what the change touches:
- `npm run dev` — builds via Vite, serves through `wrangler dev` on the Workers runtime with **local Miniflare-emulated bindings** (`env.DB`, `env.MEDIA`, `env.AI`). This is the default for everything, including UI-only work — no hot reload, rebuild after each change. Safe default: nothing here touches production data.
- `npm run preview:remote` — same build against **real, remote D1/R2/Workers AI** (`--remote` bindings). Only use this to verify something that specifically requires the real infrastructure (see note below on uploads/images) — writes made here hit production data. There is no separate dev R2/D1 instance; `--remote` is the actual production data store.
- Lint: `npm run lint`
- Build: `npm run build`
- Deploy to Cloudflare: `npm run deploy`

### Testing photo/background uploads
Upload responses return `imageURL` built from `MEDIA_PUBLIC_BASE` (a Worker
var, not a secret — see `wrangler.jsonc` / `.dev.vars`), consumed in
`worker/routes/upload.ts`.
- **Prod**: `MEDIA_PUBLIC_BASE=https://journee-media.curteisyang.uk` — R2's
  custom domain serves objects directly.
- **Local (`npm run dev`)**: `MEDIA_PUBLIC_BASE=/media` — same-origin,
  handled by `worker/routes/media.ts`, which reads straight from the
  Miniflare-emulated `env.MEDIA` binding. This means local uploads render
  end-to-end with zero real infrastructure: upload via `npm run dev`, image
  comes back through `/media/*`, no `--remote` needed.
- Local D1 (`.wrangler/state/`) was rewritten once (2026-08-17) to swap old
  `pub-...r2.dev` URLs for `/media` — pre-existing local rows point at
  objects that were never actually uploaded to the local R2 emulator (they
  only ever existed in the real bucket), so those specific images will
  still 404 until re-uploaded locally. Freshly-uploaded local images render
  correctly.
- `npm run preview:remote` remains for end-to-end checks against the real
  bucket/domain specifically (e.g. confirming DNS/custom-domain routing
  works), not required for routine upload testing anymore.

## Testing
No test framework is configured yet. Don't invent test infra unless asked.

## Project Structure
- `src/routes/` — React Router pages
- `src/components/` — UI components
- `src/api.ts` — client-side fetch wrappers calling `worker/routes/`
- `worker/index.ts` — Hono Worker entry point
- `worker/routes/` — server-side API routes (D1/R2 access happens here, never from the client)
- `migrations/` — D1 schema (SQL)
- `scripts/` — one-off Supabase→Cloudflare migration tooling (historical, not part of the app runtime)
- `android/` — Trusted Web Activity wrapper that packages the deployed site as a sideloaded Android APK; see `android/README.md` to rebuild

## Versioning & Changelog

This project follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH):
- **MAJOR** — breaking change
- **MINOR** — backward-compatible feature
- **PATCH** — backward-compatible fix

There is no `[Unreleased]` section — a push to production **is** the release.
Every user-facing change (feature, fix, or breaking change) gets bumped and
changelogged in the same commit as the change, in [Keep a Changelog](https://keepachangelog.com/)
format (`Added`/`Changed`/`Fixed`/`Removed`):

1. Run `npm version patch|minor|major --no-git-tag-version` — bumps `package.json`/`package-lock.json` without tagging yet
2. Add a new `## [x.y.z] - YYYY-MM-DD` heading at the top of `CHANGELOG.md` (today's date) describing the change
3. Commit `package.json`, `package-lock.json`, `CHANGELOG.md`, and the change together, then tag (`git tag vX.Y.Z`)

Don't batch multiple unrelated changes into one version bump, and don't write
the changelog entry later from memory — do it as part of the same commit.
3. Commit `package.json`, `package-lock.json`, and `CHANGELOG.md` together
