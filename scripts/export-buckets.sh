#!/usr/bin/env bash
# Phase 1: download both storage buckets to local disk, preserving key paths so they can
# be uploaded to R2 unchanged. Read-only.
#
# Usage:  SUPABASE_SERVICE_ROLE_KEY=<key> ./scripts/export-buckets.sh
set -euo pipefail

OUT="${OUT:-backup/buckets}"
BUCKETS=(backgrounds photos)

: "${SUPABASE_SERVICE_ROLE_KEY:?set SUPABASE_SERVICE_ROLE_KEY}"
URL=$(grep -m1 '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | tr -d '"' | tr -d "\r")
: "${URL:?NEXT_PUBLIC_SUPABASE_URL not found in .env.local}"

auth=(-H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

# Recursively walk a bucket prefix. Supabase's list endpoint returns folders as entries
# with a null id, so recurse on those and download the rest.
walk() {
  local bucket="$1" prefix="$2"
  local body listing
  body=$(jq -nc --arg p "$prefix" '{prefix:$p, limit:1000, offset:0}')
  listing=$(curl -sS --fail-with-body "${auth[@]}" -H 'Content-Type: application/json' \
    -d "$body" "$URL/storage/v1/object/list/$bucket")

  local n; n=$(jq 'length' <<<"$listing")
  for i in $(seq 0 $((n - 1))); do
    local name id path
    name=$(jq -r ".[$i].name" <<<"$listing")
    id=$(jq -r ".[$i].id" <<<"$listing")
    path="${prefix:+$prefix/}$name"

    if [ "$id" = "null" ]; then
      walk "$bucket" "$path"
    else
      # Keys contain spaces and "&" (trip names are path segments), so percent-encode —
      # but per segment, leaving "/" separators intact.
      local encoded
      encoded=$(jq -rn --arg p "$path" '$p | split("/") | map(@uri) | join("/")')

      mkdir -p "$OUT/$bucket/$(dirname "$path")"
      # A few DB rows reference objects that no longer exist in storage (pre-existing
      # inconsistency). Record and continue rather than aborting the whole export.
      if curl -sS --fail "${auth[@]}" \
           "$URL/storage/v1/object/$bucket/$encoded" -o "$OUT/$bucket/$path"; then
        echo "  $bucket/$path"
      else
        rm -f "$OUT/$bucket/$path"
        echo "$bucket/$path" >> "$OUT/missing.txt"
        echo "  MISSING $bucket/$path"
      fi
    fi
  done
}

for b in "${BUCKETS[@]}"; do
  echo "Bucket: $b"
  walk "$b" ""
done

echo
echo "Files downloaded:"
for b in "${BUCKETS[@]}"; do
  printf '%-14s %s files\n' "$b" "$(find "$OUT/$b" -type f 2>/dev/null | wc -l | tr -d ' ')"
done | tee "$OUT/filecounts.txt"
