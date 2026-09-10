"""
One-off purge of demo tenants (ids 2–7) from the database and their upload dirs.

**Production safety:** only deletes tenants whose id is in DEMO_TENANT_IDS. Requires
explicit env DEMO_PURGE_CONFIRM=1. Run inside the backend environment where DB is reachable:

    DEMO_PURGE_CONFIRM=1 python -m app.seeds.purge_demo_tenants

Or: docker compose exec back python -m app.seeds.purge_demo_tenants
(with DEMO_PURGE_CONFIRM=1 passed via compose env or `-e`).
"""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

from sqlmodel import Session

from app import models
from app.db import engine
from app.tenant_lifecycle import delete_tenant_cascade, remove_tenant_files

logger = logging.getLogger(__name__)

DEMO_TENANT_IDS: tuple[int, ...] = (2, 3, 4, 5, 6, 7)
_UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    if os.environ.get("DEMO_PURGE_CONFIRM") != "1":
        logger.error("Refusing to run: set DEMO_PURGE_CONFIRM=1 to delete demo tenants %s", DEMO_TENANT_IDS)
        return 1

    with Session(engine) as session:
        for tid in DEMO_TENANT_IDS:
            t = session.get(models.Tenant, tid)
            if not t:
                logger.info("Skip tenant_id=%s (not found)", tid)
                continue
            name = t.name
            tokens = delete_tenant_cascade(session, tid)
            session.commit()
            remove_tenant_files(_UPLOADS_DIR, tid, tokens)
            logger.warning("Purged demo tenant id=%s name=%r", tid, name)

    logger.info("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
