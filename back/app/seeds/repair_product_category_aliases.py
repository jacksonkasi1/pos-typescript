"""
One-off / idempotent repair: normalize Product.category and tenant custom_subcategories keys.

Usage:
    python -m app.seeds.repair_product_category_aliases
"""

from __future__ import annotations

from sqlmodel import Session

from app.category_codes import repair_stored_category_aliases
from app.db import engine


def main() -> None:
    with Session(engine) as session:
        stats = repair_stored_category_aliases(session)
    print("Category alias repair complete:", stats)


if __name__ == "__main__":
    main()
