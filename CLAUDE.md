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
Pick the mode by what the change touches:
- `npm run dev` — plain Next.js dev server with hot reload. Use for **UI-only work**: styling, layout, components, copy — anything that never calls a D1/R2/Workers AI binding. Fast feedback, but `env.DB`/`env.MEDIA`/`env.AI` don't exist in this mode (no Workers runtime), so any code path touching a binding will throw or no-op.
- `npm run preview` — builds via OpenNext, serves through `wrangler` on `localhost:8788` with **local Miniflare-emulated bindings**. Use whenever the change touches `/api/*` routes, D1 reads/writes, R2 uploads, or Workers AI — anything `dev` can't run. No hot reload; rebuild after each change. Safe default: nothing here touches production data.
- `npm run preview:remote` — same build against **real, remote D1/R2/Workers AI** (`--remote` bindings). Only use this to verify something that specifically requires the real infrastructure (see note below on uploads/images) — writes made here hit production data.
- Lint: `npm run lint`
- Build: `npm run build`
- Deploy to Cloudflare: `npm run deploy`

### Testing photo/background uploads
Uploaded image URLs always point at the real public R2 domain
(`PUBLIC_BASE` in `src/app/api/upload/route.ts`), regardless of which R2 an
upload actually wrote to. Under local `npm run preview`, `env.MEDIA.put()`
writes to the local Miniflare R2 emulator, not the real bucket — the API
call and D1 row will succeed, but the image will 404 in the browser because
it was never sent to the real bucket the URL points at.
- Local `npm run preview`: fine for checking upload *logic* (response
  status, D1 row written, no thrown errors) — don't expect the image to
  render.
- To verify an upload end-to-end, including that the photo actually
  renders: use `npm run preview:remote` (writes to the real bucket) or
  check after `npm run deploy`.

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
