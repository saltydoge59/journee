# To Do

## 1. Fix local dev media (D1 + R2 local emulator)
All 355 local `photos` rows + 17 `trips.image_url` rows point at `/media/*`,
but local R2 only has ~1-2 real objects — nothing renders locally.

Decision needed: wipe local D1 media rows and start fresh (fast), vs.
re-upload real images to match existing rows (slower, more faithful).

## 2. Cascading delete bug (R2 + logs orphaned on delete)
`worker/routes/trips.ts` `DELETE /` and `worker/routes/photos.ts` `DELETE /`
only delete D1 rows — never delete the matching R2 object. Trip delete also
never cleans up the per-day `logs` rows it created on trip creation. Both
leak storage permanently on every delete.

- [ ] `photos.delete`: derive R2 key from `imageURL`, delete from `env.MEDIA`
      alongside the D1 row.
- [ ] `trips.delete`: delete the trip's background R2 object, all
      `photos/<userId>/<trip_name>/*` R2 objects, all `photos` D1 rows for
      the trip, and all `logs` D1 rows for the trip.
- [ ] Decide ordering (delete R2 before D1, so a failure orphans a harmless
      R2 object rather than a D1 row pointing at nothing).

## 3. Upload responsiveness (cover photos + trip photos)
Root cause confirmed in `src/routes/EditLog.tsx` `handleNewFiles`: files are
uploaded in a sequential `for...await` loop, and each file does 3 sequential
round-trips (Workers AI vision geo-lookup → R2 upload → D1 insert) before
finishing. No client-side resize, so full-res phone photos are sent twice.

- [ ] Parallelize the `newFiles` loop (`Promise.allSettled`) in `EditLog.tsx`.
- [ ] Resize/compress images client-side (canvas/`createImageBitmap`, no new
      dependency) before both the geo call and the upload call.
- [ ] Same resize treatment for cover photo upload in `AddTrip.tsx` /
      `Dates.tsx`.
- [ ] Verify per-file status UI still reflects progress correctly once
      uploads run in parallel.

## 4. Page load time
Not yet profiled — needs a real network-waterfall/Lighthouse pass before
picking fixes. Likely suspects: initial JS bundle size, serial data fetches
on route mount.

## 5. Caching strategy
No caching exists anywhere currently.
- [ ] `Cache-Control: public, max-age=31536000, immutable` on `/media/*`
      responses (`worker/routes/media.ts`) — R2 objects are immutable once
      uploaded.
- [ ] Cloudflare Cache API (`caches.default`) for repeated `geo.ts` lookups.

## 6. App security / rate limiting
Nothing exists yet.
- [ ] Rate limiting — Cloudflare dashboard rules (check cost first) vs. a
      lightweight binding/D1-backed limiter in `worker/index.ts` middleware.
- [ ] Security review pass on `worker/routes/upload.ts` (untrusted input)
      and `worker/routes/users.ts` (auth boundary).

---
Suggested order: 2 → 3 → 4 → 5 → 6, with 1 resolved whenever the D1/R2
decision above is made.
