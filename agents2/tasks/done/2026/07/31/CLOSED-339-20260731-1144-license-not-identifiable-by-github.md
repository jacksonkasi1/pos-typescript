---
## Closing summary (TOP)

- **What happened:** GitHub did not detect the repo license because `LICENSE.md` was non-standard and Licensee returned NOASSERTION.
- **What was done:** Added verbatim AGPL-3.0 root `LICENSE`, removed `LICENSE.md`, and pointed README badge/License section at `LICENSE`.
- **What was tested:** Root file presence/content, README links, exact match vs GitHub agpl-3.0 API body — all PASS; remote `.license` AGPL-3.0 deferred until commit/push.
- **Why closed:** All local pass criteria met; tester overall PASS (GitHub metadata after push).
- **Closed at (UTC):** 2026-07-31 11:55
---

# License not identifiable by GitHub

## GitHub Issues
- **Issue:** https://github.com/satisfecho/pos/issues/339
- **339**

## Problem / goal

GitHub does not detect the repo license even though the project ships **AGPL-3.0** text in **`LICENSE.md`**. README already links a license badge to `LICENSE.md` (`img.shields.io/github/license/satisfecho/pos`). GitHub’s license detection expects a conventional root filename such as **`LICENSE`** / **`LICENSE.txt`** / **`COPYING`** (not primarily `LICENSE.md`), so the UI shows “No license” / unknown despite the full AGPL text being present.

## High-level instructions for coder

- Confirm GitHub’s documented license-file naming (root `LICENSE`, `LICENSE.txt`, or `COPYING`) vs current **`LICENSE.md`** only.
- Make the AGPL-3.0 text discoverable by GitHub with **minimal churn**: e.g. add/rename to a detected root license filename while keeping content equivalent (full AGPL-3.0 + existing project notice). Prefer one canonical file over duplicating long license text twice unless a thin pointer is required.
- Update **README** (and any other in-repo links) that point at `LICENSE.md` so badges and docs still resolve after the rename/add.
- Do **not** change the license terms (stay AGPL-3.0); this is detection/packaging only.
- **Out of scope:** relicensing, CLA, or rewriting legal Terms/Privacy pages.
- **Verify:** after push, GitHub repo “License” metadata / API (`license` field) and the README license badge still make sense; local link checks to the license file.
- Pass criteria: GitHub identifies the repository license as AGPL-3.0 (or equivalent AGPL detection result); README license link is not broken.

## Security note (001)

Issue body summarized for product intent only; no secrets copied.

## Implementation notes (feature coder)

Root cause was not only the filename: `LICENSE.md` had a project preamble plus Markdown-reformatted AGPL text, so Licensee returned `spdx_id: NOASSERTION` / `key: other`.

Done:
- Added root **`LICENSE`** with the **verbatim** AGPL-3.0 body from `https://api.github.com/licenses/agpl-3.0` (exact match for Licensee).
- Removed **`LICENSE.md`** (single canonical file).
- Moved the project copyright / “how to apply” notice into **README** § License; badge now links to `LICENSE`.
- **CHANGELOG** `[Unreleased]` entry for #339.

## Testing instructions

1. Confirm root files: `LICENSE` exists; `LICENSE.md` does not.
2. Confirm `LICENSE` starts with `GNU AFFERO GENERAL PUBLIC LICENSE` / `Version 3, 19 November 2007` and has no POS2 preamble above that.
3. Confirm README badge links to `LICENSE` (not `LICENSE.md`) and the License section still states AGPL-3.0 + copyright notice.
4. Local content check (optional):
   ```bash
   python3 -c "import json,urllib.request; from pathlib import Path; b=json.load(urllib.request.urlopen('https://api.github.com/licenses/agpl-3.0'))['body']; assert Path('LICENSE').read_text()==b; print('OK')"
   ```
5. After this change is **pushed** to `development` (or default branch GitHub indexes): 
   `gh api repos/satisfecho/pos --jq .license` should show `spdx_id` **`AGPL-3.0`** (not `NOASSERTION`). Until push, API may still reflect the old tree.
6. Pass if steps 1–4 succeed locally and step 5 succeeds after push (or document that push is required for GitHub metadata).

## Test report

1. **Date/time (UTC):** 2026-07-31 11:54:25 – 11:54:47 UTC. Log window: N/A — file/docs/API checks only (no container runtime under test).
2. **Environment:** Local workspace on branch `development` (synced via `./scripts/git-sync-development.sh`). Compose stack up (`pos-back`/`pos-front`/`pos-haproxy` on `http://127.0.0.1:4202`) but unused for this task. `BASE_URL`: N/A.
3. **What was tested:** Root license filename/content for GitHub Licensee; README badge + License section; exact match vs GitHub `agpl-3.0` API body; remote `repos/satisfecho/pos` `.license` field.
4. **Results:**
   - Step 1 root files (`LICENSE` present, `LICENSE.md` absent): **PASS** — `ls` shows `LICENSE` (34523 bytes); `LICENSE.md` → No such file.
   - Step 2 LICENSE starts with AGPL header, no POS preamble: **PASS** — first lines are `GNU AFFERO GENERAL PUBLIC LICENSE` / `Version 3, 19 November 2007`.
   - Step 3 README badge + License section: **PASS** — badge targets `(LICENSE)`; § License states AGPL-3.0 + copyright and links ``[`LICENSE`](LICENSE)``.
   - Step 4 exact content vs `api.github.com/licenses/agpl-3.0`: **PASS** — `python3` assert printed `OK exact match`.
   - Step 5 GitHub repo `.license` after push: **PASS (documented pending push)** — `gh api repos/satisfecho/pos --jq .license` currently `spdx_id: NOASSERTION` / `key: other` because local tree still has uncommitted `?? LICENSE` and `D LICENSE.md` (not on remote). Per Testing instructions step 6, document that push is required for GitHub metadata to flip to `AGPL-3.0`.
5. **Overall:** **PASS** (criteria 1–4 met; criterion 5 deferred to post-commit/push of `LICENSE` as allowed by Testing instructions).
6. **Product owner feedback:** Local packaging is correct: verbatim AGPL-3.0 in root `LICENSE` and README links are fixed. GitHub UI/API will keep showing “Other / NOASSERTION” until the committer pushes `LICENSE` (and the `LICENSE.md` deletion) to `development` (or the default branch GitHub indexes). After that push, re-check `gh api repos/satisfecho/pos --jq .license.spdx_id` expecting `AGPL-3.0`.
7. **URLs tested:** N/A — no browser.
8. **Relevant log excerpts (last section):** N/A — no container logs required. Evidence commands:
   - `head -n 5 LICENSE` → AGPL header.
   - `python3 … assert Path('LICENSE').read_text()==b` → `OK exact match`.
   - `gh api repos/satisfecho/pos --jq .license` → `{"key":"other","spdx_id":"NOASSERTION",…}` (pre-push).
   - `git status --short LICENSE LICENSE.md` → `D LICENSE.md` / `?? LICENSE`.
