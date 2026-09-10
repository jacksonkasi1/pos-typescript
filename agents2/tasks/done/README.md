# Archived agent tasks

Closed tasks live under dated folders derived from the **`YYYYMMDD`** stamp in the filename:

```text
agents2/tasks/done/<YYYY>/<MM>/<DD>/<CLOSED-…>.md
```

Example: `CLOSED-1234-20260323-1200-fix-login-banner.md` → **`2026/03/23/`**.

Do not leave **`CLOSED-*.md`** in the live queue (`agents2/tasks/` root). After the closing summary, archive with:

```bash
./scripts/move-agent-task-to-done.sh agents2/tasks/CLOSED-….md
```

Pipeline rules: **`agents2/TASKS-README.md`**. Role overview: **`docs/agent-loop.md`**.
