# Phase 1 baseline — migration pass/fail criteria

Exported 2026-08-15 from Supabase project `uurvbdxwneflwgawanud`.

## Table row counts

| table | rows |
|---|---|
| users | 12 |
| trips | 17 |
| logs | 238 |
| photos | 354 |

## Storage

- backgrounds: 38 files
- photos: 362 files

Reconciliation: 362 = 342 referenced by a photos row + 20 unreferenced.


## Pre-existing inconsistencies (NOT introduced by the migration)

- **12 photos rows** reference storage objects that no longer exist (all in one
  user's "Japan Dec 24" trip). They render as broken images in the app today.
- **20 storage objects** are referenced by no row. Invisible in the app; they would
  occupy R2 storage after migration.

Full key lists are in the gitignored backup dir (`backup/<ts>/RECONCILIATION.md`),
kept out of git because they embed user IDs and trip names.

Both are out of scope for the migration itself — see plan for the decision.
