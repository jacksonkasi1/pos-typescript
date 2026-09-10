---
## Closing summary (TOP)

- **What happened:** Docker Postgres logs showed `FATAL: role "postgres" does not exist` because external clients default to user `postgres` while this stack uses `POSTGRES_USER` (default `pos`).
- **What was done:** Coder documented the correct credentials and meaning of the FATAL in `README.md`, `config.env.example`, `docker-compose.yml`, and `CHANGELOG.md`; no `postgres` DB role was added.
- **What was tested:** Tester verified README, env example, compose comments, optional `psql` as `pos` vs `postgres`, and changelog entry — **PASS**.
- **Why closed:** All pass/fail criteria met; documentation-only fix delivered and verified.
- **Closed at (UTC):** 2026-03-26 11:52
---

# Postgres: FATAL — role "postgres" does not exist

## Source

- **Service:** `pos-postgres` (`docker logs pos-postgres`)
- **UTC window:** since prior **001** review stamp **2026-03-26T09:33:22Z** through this sweep (**~2026-03-26T11:21Z**).
- **Representative lines:**
  ```
  2026-03-26 10:57:39.359 UTC [92354] FATAL:  role "postgres" does not exist
  ```

Compose defaults use **`POSTGRES_USER`** **`pos`** (not the conventional superuser name `postgres`). A client is connecting with username **`postgres`**, which is invalid for this instance. Prior **001** notes treated an earlier occurrence as a possible one-off; this run shows **another** hit in the window — worth tracing the source (host tool, wrong `psql`/GUI DSN, third-party image, copy-pasted connection string, etc.) and aligning docs or env examples if needed.

## High-level instructions for coder

- Identify what initiated the connection (correlate **PID**/timestamp with host processes or other containers if possible; check common culprits: IDE DB plugins, manual `psql`, monitoring, backup scripts).
- Confirm **`config.env` / `docker-compose`** expectations: app and operators should use **`POSTGRES_USER`** (e.g. `pos`), not assume role `postgres`.
- If the connection is from developer ergonomics only, document the correct user in **`README.md`** or **`docs/`** (where DB access is described) so the FATAL does not recur from confusion.
- Do **not** treat this as a GitHub-issue queue item unless product requirements say otherwise; fix config/tooling or document, not necessarily add a `postgres` role to the DB.

## Implementation (coder, 2026-03-26)

- **Root cause (expected):** External clients defaulting to DB user `postgres`; this stack creates only **`POSTGRES_USER`** (default `pos`).
- **No DB role added** (per task): documentation only.
- **`README.md`:** New subsection **PostgreSQL: connecting from your machine** under Development → Database migrations: host port, superuser = `POSTGRES_USER` / `DB_USER`, how to interpret the FATAL line.
- **`config.env.example`:** Comment block above `POSTGRES_*` explaining the same.
- **`docker-compose.yml`:** One-line comment on the `db` service `environment` block.
- **`CHANGELOG.md`:** `[Unreleased]` entry under Changed.

**Source tracing:** Not feasible from repo alone (PID in container log does not map to host without live investigation); docs address the recurring misconfiguration pattern called out in the task.

---

## Testing instructions

### What to verify

- Operators can find the correct PostgreSQL username and port from **`README.md`** and **`config.env.example`**.
- Comments in **`docker-compose.yml`** reinforce **`POSTGRES_USER`** vs assuming `postgres`.

### How to test

- Read **`README.md`** (Development → Database migrations → **PostgreSQL: connecting from your machine**) and **`config.env.example`** (Docker postgres block).
- Optional with stack up: `psql "postgresql://pos:pos@127.0.0.1:5433/pos"` (adjust port/password from `config.env`) — expect connection success; `psql "postgresql://postgres:pos@127.0.0.1:5433/pos"` — expect authentication/role failure consistent with server config (may still show the FATAL if server rejects user before password).

### Pass/fail criteria

- Documentation clearly states superuser is **`POSTGRES_USER`** (default **`pos`**), not **`postgres`**, and explains the FATAL message.
- No product code changes required for pass; optional `psql` check confirms expected credentials from `config.env`.

---

## Test report

1. **Date/time (UTC) and log window:** Testing started **2026-03-26T11:52Z** (approx.); verification completed **2026-03-26T11:53Z**. Log window reviewed: `docker logs pos-postgres` tail through **2026-03-26T11:51Z** (includes historical and new `FATAL: role "postgres" does not exist` lines).

2. **Environment:** `docker-compose.yml` + `docker-compose.dev.yml`; stack running (db healthy, `127.0.0.1:5433`); **BASE_URL** N/A (no browser). Branch **development**, commit **3d95889**.

3. **What was tested:** README + `config.env.example` + `docker-compose.yml` db service comments; optional in-container `psql` as `pos` vs `postgres`; `CHANGELOG.md` entry presence.

4. **Results:**
   - README states superuser is **`POSTGRES_USER`** / **`DB_USER`** (default **`pos`**), port mapping, and interprets **`FATAL: role "postgres" does not exist`**: **PASS** — grep/read `README.md` § “PostgreSQL: connecting from your machine” (lines ~235–239).
   - `config.env.example` comment block above `POSTGRES_*` explains same: **PASS** — lines 3–5.
   - `docker-compose.yml` `db` service comment on superuser vs `postgres`: **PASS** — line 74.
   - Optional connectivity: `docker compose … exec -T db psql -U pos -d pos -c 'select 1'` succeeds; `psql -U postgres` fails with `FATAL:  role "postgres" does not exist`: **PASS** — matches documented behavior.
   - Changelog documents the doc change: **PASS** — `CHANGELOG.md` Unreleased bullet on PostgreSQL username.

5. **Overall:** **PASS**

6. **Product owner feedback:** Operators now have a single place in the README and env example that explains why tools defaulting to user `postgres` fail, and what credentials to use instead. The compose comment reinforces this at the service definition. No application code change was required; behavior remains correct when clients use **`pos`** as documented.

7. **URLs tested:** **N/A — no browser**

8. **Relevant log excerpts:**
   ```
   2026-03-26 11:23:28.392 UTC [94603] FATAL:  role "postgres" does not exist
   ```
   (Reproduced during test via `psql -U postgres` inside `pos-postgres`; `psql -U pos` succeeds with `select 1`.)
