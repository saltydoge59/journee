#!/usr/bin/env bash
# Phase 1: freeze a restore point. Exports all four tables to JSON + records row counts.
# Read-only. Nothing in Supabase is modified.
#
# Usage:  SUPABASE_SERVICE_ROLE_KEY=<key> ./scripts/export-supabase.sh
#
# The service role key bypasses RLS (needed to export every user's rows). Get it from
# Supabase dashboard → Project Settings → API → service_role. Pass it inline as above;
# it is never written to disk by this script.
set -euo pipefail

OUT="${OUT:-backup/$(date +%Y%m%d-%H%M%S)}"
TABLES=(users trips logs photos)

: "${SUPABASE_SERVICE_ROLE_KEY:?set SUPABASE_SERVICE_ROLE_KEY (see header)}"
URL=$(grep -m1 '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | tr -d '"' | tr -d "\r")
: "${URL:?NEXT_PUBLIC_SUPABASE_URL not found in .env.local}"

mkdir -p "$OUT"
echo "Exporting from $URL -> $OUT"

for t in "${TABLES[@]}"; do
  # ponytail: single unpaginated GET. PostgREST caps at 1000 rows/request by default;
  # the count check below fails loudly if we ever exceed it. Add Range paging then.
  curl -sS --fail-with-body \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Prefer: count=exact" \
    -D "$OUT/$t.headers" \
    "$URL/rest/v1/$t?select=*" -o "$OUT/$t.json"

  fetched=$(jq 'length' "$OUT/$t.json")
  # Content-Range looks like "0-41/42"; the part after / is the true total.
  total=$(grep -i '^content-range:' "$OUT/$t.headers" | tr -d '\r' | sed 's|.*/||')
  rm "$OUT/$t.headers"

  if [ "$fetched" != "$total" ]; then
    echo "FAIL $t: fetched $fetched of $total rows (pagination needed)" >&2
    exit 1
  fi
  printf '%-8s %s rows\n' "$t" "$total" | tee -a "$OUT/rowcounts.txt"
done

echo
echo "Row counts saved to $OUT/rowcounts.txt — these are the migration's pass/fail criteria."
