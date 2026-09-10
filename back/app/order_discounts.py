"""Shared order-level discount helpers (#322 / #327).

Line-level promos reduce ``OrderItem.price_cents`` (tax-inclusive) and store an
audit snapshot. Order-level discounts (loyalty redemption today) subtract from
payable / fiscal totals via :func:`order_level_discount_cents`.
"""

from __future__ import annotations

from app import models


def order_level_discount_cents(order: models.Order) -> int:
    """Cents off the order total after line prices (loyalty redeem, future coupons)."""
    return max(0, int(getattr(order, "loyalty_discount_cents", 0) or 0))
