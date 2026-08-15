#!/usr/bin/env bash
# Phase 4: upload the Phase 1 bucket download to R2, preserving key paths
# (backgrounds/... and photos/... prefixes mirror the old Supabase buckets).
set -uo pipefail

SRC="${1:-backup/buckets}"
BUCKET="journee-media"
LOG="${2:-/tmp/r2-upload.log}"
: > "$LOG"

find "$SRC" -type f ! -name filecounts.txt ! -name missing.txt > /tmp/r2-filelist.txt
total=$(wc -l < /tmp/r2-filelist.txt | tr -d ' ')
n=0
fail=0

while IFS= read -r file; do
  key="${file#"$SRC"/}"
  n=$((n + 1))
  if npx wrangler r2 object put "$BUCKET/$key" --file="$file" --remote >>"$LOG" 2>&1; then
    printf '\rOK %d/%d' "$n" "$total"
  else
    fail=$((fail + 1))
    echo "FAILED: $key" | tee -a "$LOG"
  fi
done < /tmp/r2-filelist.txt

echo
echo "Uploaded $((n - fail))/$total, $fail failures. Full log: $LOG"
[ "$fail" -eq 0 ]
