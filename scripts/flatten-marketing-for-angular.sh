#!/usr/bin/env bash
# Copy front/sites/<slug>/ → front/marketing-flat/<slug>/ for ng serve assets (single glob).
set -euo pipefail
ROOT="${POS_REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
SRC="$ROOT/front/sites"
DST="$ROOT/front/marketing-flat"
mkdir -p "$DST"
find "$DST" -mindepth 1 -delete 2>/dev/null || true
shopt -s nullglob
for d in "$SRC"/*/; do
  [[ -d "$d" ]] || continue
  slug=$(basename "$d")
  cp -a "$d" "$DST/$slug"
done
shopt -u nullglob
# Empty sites still need a sentinel so Angular glob does not fail
if [[ -z "$(ls -A "$DST" 2>/dev/null)" ]]; then
  mkdir -p "$DST/_empty"
  printf '%s\n' '<!-- marketing-flat placeholder -->' >"$DST/_empty/.keep"
fi
echo "[flatten-marketing] → $DST ($(find "$DST" -type f 2>/dev/null | wc -l | tr -d ' ') files)"
