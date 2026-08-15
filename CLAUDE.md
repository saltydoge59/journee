# Project Instructions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5 (strict mode) |
| Framework | Next.js 15 (App Router), React 18 |
| Styling | Tailwind CSS + shadcn/Radix, MUI, Aceternity |
| Auth | Clerk |
| Database | Cloudflare D1 |
| Storage | Cloudflare R2 (images) |
| Deploy | Cloudflare Workers via OpenNext |

## Code Style
- Path alias `@/*` → `src/*`
- ESLint: `next/core-web-vitals` + `next/typescript`

## Build & Run
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Local Workers preview: `npm run preview`
- Deploy to Cloudflare: `npm run deploy`

## Testing
No test framework is configured yet. Don't invent test infra unless asked.

## Project Structure
- `src/app/` — Next.js pages (App Router)
- `src/app/api/` — server-side API routes (D1/R2 access happens here, never from the client)
- `src/components/` — UI components
- `utils/api.ts` — client-side fetch wrappers calling `src/app/api/`
- `migrations/` — D1 schema (SQL)
- `scripts/` — one-off Supabase→Cloudflare migration tooling (historical, not part of the app runtime)

## Versioning & Changelog

This project follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH):
- **MAJOR** — breaking change
- **MINOR** — backward-compatible feature
- **PATCH** — backward-compatible fix

Every user-facing change (feature, fix, or breaking change) gets an entry in
`CHANGELOG.md` under `[Unreleased]`, in [Keep a Changelog](https://keepachangelog.com/)
format (`Added`/`Changed`/`Fixed`/`Removed`). Add the changelog entry in the
same commit as the change — don't batch it later from memory.

When cutting a release:
1. Move the `[Unreleased]` entries under a new `## [x.y.z] - YYYY-MM-DD` heading in `CHANGELOG.md`
2. Run `npm version patch|minor|major` — bumps `package.json`/`package-lock.json` and creates a git tag in one step
3. Commit `package.json`, `package-lock.json`, and `CHANGELOG.md` together
