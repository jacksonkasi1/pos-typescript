#!/usr/bin/env bash
# Download latest successful GitHub Actions artifact for a marketing repo into front/sites/<slug>/.
# Uses curl + jq only. See config/marketing-sites.json and scripts/sync-all-marketing-sites.sh.
#
# Env:
#   GH_TOKEN / MARKETING_ARTIFACT_TOKEN — PAT with Actions read on the target repo
#   MARKETING_REPO — owner/name (required)
#   MARKETING_BRANCH — default development
#   MARKETING_ARTIFACT_NAME — artifact name from workflow (default dist)
#   TARGET_DIR — relative to repo root, e.g. front/sites/wimpi
#   MARKETING_SKIP=1 — no-op success
#   POS_REPO_ROOT — repo root (default: parent of scripts/)
#   MARKETING_RUNS_SCAN — how many completed runs to scan for a non-expired artifact (default 20)

set -euo pipefail

ROOT="${POS_REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

TARGET_DIR="${TARGET_DIR:?TARGET_DIR required}"
REPO="${MARKETING_REPO:?MARKETING_REPO required}"
BRANCH="${MARKETING_BRANCH:-development}"
[[ -n "$BRANCH" ]] || BRANCH="development"
ARTIFACT_NAME="${MARKETING_ARTIFACT_NAME:-dist}"
[[ -n "$ARTIFACT_NAME" ]] || ARTIFACT_NAME="dist"
TOKEN="${MARKETING_ARTIFACT_TOKEN:-${GH_TOKEN:-${GUSTAZO_ARTIFACT_TOKEN:-}}}"
RUNS_SCAN="${MARKETING_RUNS_SCAN:-20}"

if [[ "${MARKETING_SKIP:-0}" == "1" ]]; then
  echo "[fetch-marketing] SKIP=1 — skipping."
  exit 0
fi

if [[ -z "$TOKEN" ]]; then
  echo "[fetch-marketing] No token — skipping ${REPO} → ${TARGET_DIR}"
  exit 1
fi

API="https://api.github.com"
AUTH_HDR=(-H "Authorization: Bearer ${TOKEN}" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28")

echo "[fetch-marketing] Latest successful run for ${REPO}@${BRANCH}..."
RUNS_JSON="$(curl -sf "${AUTH_HDR[@]}" "${API}/repos/${REPO}/actions/runs?branch=${BRANCH}&status=completed&per_page=${RUNS_SCAN}")" || {
  echo "::error::GitHub API failed (runs list)."
  exit 1
}

RUN_IDS=()
while IFS= read -r _rid; do
  [[ -n "$_rid" ]] && RUN_IDS+=("$_rid")
done < <(echo "$RUNS_JSON" | jq -r '.workflow_runs[] | select(.conclusion == "success") | .id')
if [[ ${#RUN_IDS[@]} -eq 0 ]]; then
  echo "::error::No successful workflow run for ${REPO}@${BRANCH}"
  exit 1
fi

ZIP_URL=""
CHOSEN_RUN=""
SAW_EXPIRED=0
SAW_MISSING_NAME=0
LAST_NAMES=""

for RUN_ID in "${RUN_IDS[@]}"; do
  ARTIFACTS_JSON="$(curl -sf "${AUTH_HDR[@]}" "${API}/repos/${REPO}/actions/runs/${RUN_ID}/artifacts")" || {
    echo "::error::GitHub API failed (artifacts) for run ${RUN_ID}."
    exit 1
  }

  LAST_NAMES="$(echo "$ARTIFACTS_JSON" | jq -r '.artifacts[].name' | paste -sd, -)"
  MATCH_JSON="$(echo "$ARTIFACTS_JSON" | jq -c --arg name "$ARTIFACT_NAME" '
    [.artifacts[] | select(.name == $name)] | .[0] // empty
  ')"
  if [[ -z "$MATCH_JSON" || "$MATCH_JSON" == "null" ]]; then
    SAW_MISSING_NAME=1
    continue
  fi

  EXPIRED="$(echo "$MATCH_JSON" | jq -r '.expired')"
  if [[ "$EXPIRED" == "true" ]]; then
    SAW_EXPIRED=1
    echo "[fetch-marketing] run ${RUN_ID}: artifact '${ARTIFACT_NAME}' expired — trying older successful run"
    continue
  fi

  ZIP_URL="$(echo "$MATCH_JSON" | jq -r '.archive_download_url')"
  if [[ -n "$ZIP_URL" && "$ZIP_URL" != "null" ]]; then
    CHOSEN_RUN="$RUN_ID"
    break
  fi
done

if [[ -z "$ZIP_URL" || "$ZIP_URL" == "null" ]]; then
  if [[ "$SAW_EXPIRED" -eq 1 ]]; then
    echo "::error::All '${ARTIFACT_NAME}' artifacts for ${REPO}@${BRANCH} are expired (GitHub retention). Re-run the Build workflow: gh workflow run Build --repo ${REPO} --ref ${BRANCH}"
    exit 1
  fi
  echo "::error::No artifact '${ARTIFACT_NAME}' on successful runs for ${REPO}@${BRANCH}. Available on last checked run: ${LAST_NAMES:-none}"
  exit 1
fi

echo "[fetch-marketing] using run ${CHOSEN_RUN} artifact '${ARTIFACT_NAME}'"

TMP_ZIP="$(mktemp)"
TMP_EX="$(mktemp -d)"
cleanup() { rm -f "$TMP_ZIP"; rm -rf "$TMP_EX"; }
trap cleanup EXIT

HTTP_CODE="$(curl -sL -o "$TMP_ZIP" -w "%{http_code}" "${AUTH_HDR[@]}" "$ZIP_URL" || true)"
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "::error::Artifact download failed (HTTP ${HTTP_CODE}). If 410 Gone, the artifact expired — re-run Build on ${REPO}."
  exit 1
fi
if [[ ! -s "$TMP_ZIP" ]]; then
  echo "::error::Artifact download failed (empty file)."
  exit 1
fi

mkdir -p "$TMP_EX"
unzip -q -o "$TMP_ZIP" -d "$TMP_EX"

mkdir -p "${TARGET_DIR}"
find "${TARGET_DIR}" -mindepth 1 -maxdepth 1 ! -name 'gitkeep.txt' -exec rm -rf {} +

shopt -s dotglob nullglob
TOP=( "$TMP_EX"/* )
if [[ ${#TOP[@]} -eq 1 && -d "${TOP[0]}" ]]; then
  mv "${TOP[0]}"/* "${TARGET_DIR}/" 2>/dev/null || true
else
  mv "$TMP_EX"/* "${TARGET_DIR}/" 2>/dev/null || true
fi
shopt -u dotglob nullglob

if [[ -d "${TARGET_DIR}/browser" && ! -f "${TARGET_DIR}/index.html" ]]; then
  mv "${TARGET_DIR}/browser"/* "${TARGET_DIR}/" || true
  rmdir "${TARGET_DIR}/browser" 2>/dev/null || true
fi

echo "[fetch-marketing] OK → ${TARGET_DIR} ($(find "${TARGET_DIR}" -type f 2>/dev/null | wc -l | tr -d ' ') files)"
exit 0
