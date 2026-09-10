#!/usr/bin/env bash
# Detect expired (or missing) GitHub Actions artifacts for config/marketing-sites.json
# and re-dispatch each site's Build workflow so Deploy to amvara9 can fetch real bundles.
#
# Requires: gh auth with Actions write on marketing repos (workflow_dispatch).
# Env:
#   POS_REPO_ROOT — default: parent of scripts/
#   MARKETING_ARTIFACT_TOKEN / GH_TOKEN — optional; used only for API artifact checks via gh
#   DRY_RUN=1 — list only, do not dispatch
#   WAIT=1 — wait for each dispatched run to finish

set -euo pipefail

ROOT="${POS_REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
MANIFEST="$ROOT/config/marketing-sites.json"
DRY_RUN="${DRY_RUN:-0}"
WAIT="${WAIT:-0}"

if ! command -v jq >/dev/null 2>&1; then
  echo "[refresh-marketing] ::error::jq is required" >&2
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "[refresh-marketing] ::error::gh is required" >&2
  exit 1
fi
if [[ ! -f "$MANIFEST" ]]; then
  echo "[refresh-marketing] ::error::missing $MANIFEST" >&2
  exit 1
fi

need_refresh=0
dispatched=0

while IFS= read -r obj; do
  [[ -z "$obj" || "$obj" == "null" ]] && continue
  slug=$(echo "$obj" | jq -r '.slug')
  repo=$(echo "$obj" | jq -r '.repo')
  branch=$(echo "$obj" | jq -r '.branch // "main"')
  artifact=$(echo "$obj" | jq -r '.artifact // "dist"')
  [[ -n "$slug" && "$slug" != "null" ]] || continue
  if jq -e --arg s "$slug" '(.excludedSlugs // []) | index($s) != null' "$MANIFEST" >/dev/null 2>&1; then
    continue
  fi

  run_id="$(gh api "repos/${repo}/actions/runs?branch=${branch}&status=completed&per_page=20" \
    --jq '.workflow_runs[] | select(.conclusion=="success") | .id' 2>/dev/null | head -1 || true)"
  if [[ -z "$run_id" ]]; then
    echo "[refresh-marketing] ${slug}: no successful run on ${repo}@${branch} — dispatch Build"
    need_refresh=1
  else
    art_json="$(gh api "repos/${repo}/actions/runs/${run_id}/artifacts" 2>/dev/null || echo '{"artifacts":[]}')"
    match="$(echo "$art_json" | jq -c --arg n "$artifact" '[.artifacts[] | select(.name==$n)] | .[0] // empty')"
    if [[ -z "$match" || "$match" == "null" ]]; then
      echo "[refresh-marketing] ${slug}: no artifact '${artifact}' on run ${run_id} — dispatch Build"
      need_refresh=1
    elif [[ "$(echo "$match" | jq -r '.expired')" == "true" ]]; then
      exp="$(echo "$match" | jq -r '.expires_at')"
      echo "[refresh-marketing] ${slug}: artifact '${artifact}' expired (${exp}) — dispatch Build"
      need_refresh=1
    else
      exp="$(echo "$match" | jq -r '.expires_at')"
      echo "[refresh-marketing] ${slug}: OK (expires ${exp})"
      continue
    fi
  fi

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[refresh-marketing] DRY_RUN=1 — would: gh workflow run Build --repo ${repo} --ref ${branch}"
    continue
  fi

  if ! gh workflow list --repo "$repo" --json name --jq '.[].name' 2>/dev/null | grep -qx 'Build'; then
    echo "[refresh-marketing] ::warning::${repo} has no workflow named Build — skip (open Actions and re-run manually)"
    continue
  fi

  echo "[refresh-marketing] dispatching Build on ${repo}@${branch} ..."
  gh workflow run Build --repo "$repo" --ref "$branch"
  dispatched=$((dispatched + 1))

  if [[ "$WAIT" == "1" ]]; then
    sleep 3
    new_run="$(gh run list --repo "$repo" --workflow Build --branch "$branch" --limit 1 --json databaseId --jq '.[0].databaseId')"
    if [[ -n "$new_run" && "$new_run" != "null" ]]; then
      echo "[refresh-marketing] waiting for ${repo} run ${new_run} ..."
      gh run watch "$new_run" --repo "$repo" --exit-status
    fi
  fi
done < <(jq -c '.sites[]?' "$MANIFEST")

if [[ "$need_refresh" -eq 0 ]]; then
  echo "[refresh-marketing] all manifest sites have a non-expired artifact"
  exit 0
fi

if [[ "$DRY_RUN" == "1" ]]; then
  echo "[refresh-marketing] DRY_RUN done — re-run without DRY_RUN=1 to dispatch"
  exit 0
fi

if [[ "$dispatched" -eq 0 ]]; then
  echo "[refresh-marketing] ::error::sites need refresh but no Build workflows were dispatched"
  exit 1
fi

echo "[refresh-marketing] dispatched ${dispatched} Build workflow(s). When green, re-run Deploy to amvara9 (or MARKETING_SYNC_FORCE=1 bash scripts/sync-all-marketing-sites.sh)."
exit 0
