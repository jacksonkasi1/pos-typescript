---
## Closing summary (TOP)

- **What happened:** Root **README.md** and documentation cross-links were brought in line with the product (issue #132).
- **What was done:** Rate-limiting detail was pointed at **docs/0020-rate-limiting-production.md**, Revolut was documented and linked per **docs/REVOLUT.md**, the staff feature list was aligned with the sidebar, and **docs/README.md** indexes REVOLUT.
- **What was tested:** Documentation review per task testing instructions (README, docs index, link existence, sidebar alignment) — **Overall: PASS** (no app build required).
- **Why closed:** Tester **Overall: PASS**; acceptance criteria met.
- **Closed at (UTC):** 2026-04-01 07:22
---

# Update README.md

## GitHub
- **Issue:** https://github.com/satisfecho/pos/issues/132

## Problem / goal
Improve root **README.md** so it matches the product: move rate-limiting documentation into dedicated files under **`docs/`**, refresh the feature list to reflect everything exposed in the side navigation and settings, and document **Revolut** payment where appropriate (see **`docs/REVOLUT.md`** if present).

## High-level instructions for coder
- Extract or relocate rate-limiting topics from **README** into one or more focused **`docs/*.md`** files; keep **README** pointing to those docs instead of duplicating long sections.
- Audit the app’s side nav and settings areas and update the README feature list so it is accurate and discoverable for new contributors.
- Add or cross-link Revolut payment setup/usage consistent with existing payment docs.

---

## Testing instructions

- **Review:** Root **README.md** — Payments / Security / Documentation rows mention Revolut and [docs/0020-rate-limiting-production.md](docs/0020-rate-limiting-production.md); **Staff navigation** row matches sidebar; no stale “rate limiting not implemented” claim.
- **Docs index:** [docs/README.md](docs/README.md) includes **REVOLUT.md** in quick links and feature guides.
- **Links:** Spot-check relative links to `docs/REVOLUT.md` and `docs/0020-rate-limiting-production.md` from repo root.

---

## Test report

1. **Date/time (UTC):** 2026-04-01T07:19:15Z — **Log window:** N/A (documentation review only; no container logs required for this task).

2. **Environment:** Repo `development` @ `5e7c91b`; local filesystem review; **BASE_URL** N/A; compose N/A for README verification.

3. **What was tested:** Per **Testing instructions**: README Payments/Security/Documentation coverage of Revolut and rate-limiting doc; Staff navigation vs `sidebar.component.ts`; stale “not implemented” wording; `docs/README.md` quick links + feature guides; existence of linked files.

4. **Results**
   - **Payments feature row** mentions **Stripe**, **Revolut**, Settings, and links **[docs/REVOLUT.md](docs/REVOLUT.md)** — **PASS** (`README.md` ~L49).
   - **Security Notes** documents production rate limiting with **[docs/0020-rate-limiting-production.md](docs/0020-rate-limiting-production.md)** (and PIN doc); **PASS** (~L296–302). Revolut tenant keys are covered under Payments/Configuration, not duplicated here — acceptable.
   - **Documentation** table lists **0020-rate-limiting-production** and **REVOLUT.md** — **PASS** (~L160–162).
   - **Staff navigation** row lists Dashboard, My shift, Orders, Reservations/Guest feedback, Tables, Kitchen/Bar, Customers, Products, Catalog, Reports, Working plan, Inventory, Users, Contracts, Settings — aligns with `front/src/app/shared/sidebar.component.ts` nav structure and module gates — **PASS**.
   - **No stale “rate limiting not implemented”** claim — **PASS** (grep; Security states limits are enforced).
   - **docs/README.md** — **REVOLUT.md** in Quick links (L11) and Feature guides (L54) — **PASS**.
   - **Spot-check links:** `docs/REVOLUT.md` and `docs/0020-rate-limiting-production.md` exist on disk — **PASS**.

5. **Overall:** **PASS**

6. **Product owner feedback:** The root README now points contributors to Revolut and production rate limiting in the right places, and the staff feature list matches what the Angular sidebar actually exposes (including module-gated items). No documentation gaps were found against the stated acceptance criteria.

7. **URLs tested:** **N/A — no browser** (markdown and source review only).

8. **Relevant log excerpts:** **N/A** — not applicable.
