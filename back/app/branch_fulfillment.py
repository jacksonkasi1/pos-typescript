"""Branch hub fulfillment: central kitchen prep for sibling branch orders (#323)."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import Session, select

from app import models
from app import restaurant_groups as rg


TERMINAL_STATUSES = {
    models.HubFulfillmentStatus.prepared_at_hq,
    models.HubFulfillmentStatus.cancelled,
}

HUB_ADVANCE = {
    models.HubFulfillmentStatus.requested: {
        models.HubFulfillmentStatus.preparing,
        models.HubFulfillmentStatus.prepared_at_hq,
        models.HubFulfillmentStatus.cancelled,
    },
    models.HubFulfillmentStatus.preparing: {
        models.HubFulfillmentStatus.prepared_at_hq,
        models.HubFulfillmentStatus.cancelled,
    },
    models.HubFulfillmentStatus.prepared_at_hq: set(),
    models.HubFulfillmentStatus.cancelled: set(),
}


def fulfillment_to_dict(row: models.BranchHubFulfillment) -> dict:
    status = row.status.value if hasattr(row.status, "value") else str(row.status)
    return {
        "id": row.id,
        "group_id": row.group_id,
        "order_id": row.order_id,
        "branch_tenant_id": row.branch_tenant_id,
        "hub_tenant_id": row.hub_tenant_id,
        "status": status,
        "notes": row.notes,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "prepared_at": row.prepared_at.isoformat() if row.prepared_at else None,
        "created_by_user_id": row.created_by_user_id,
        "prepared_by_user_id": row.prepared_by_user_id,
    }


def set_hub_tenant(session: Session, *, tenant_id: int, hub_tenant_id: int | None) -> models.RestaurantGroup:
    group = rg.get_group_for_tenant(session, tenant_id)
    if not group:
        raise HTTPException(status_code=404, detail="Restaurant group not found")
    if hub_tenant_id is None:
        group.hub_tenant_id = None
    else:
        member = session.exec(
            select(models.RestaurantGroupMember).where(
                models.RestaurantGroupMember.group_id == group.id,
                models.RestaurantGroupMember.tenant_id == hub_tenant_id,
            )
        ).first()
        if not member:
            raise HTTPException(status_code=400, detail="Hub tenant must be a group member")
        group.hub_tenant_id = hub_tenant_id
    session.add(group)
    session.commit()
    session.refresh(group)
    return group


def create_fulfillment(
    session: Session,
    *,
    order: models.Order,
    user: models.User,
    notes: str | None = None,
) -> models.BranchHubFulfillment:
    if order.tenant_id != user.tenant_id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.deleted_at is not None:
        raise HTTPException(status_code=400, detail="Order is deleted")
    if order.status == models.OrderStatus.cancelled:
        raise HTTPException(status_code=400, detail="Cannot request hub prep for a cancelled order")

    existing = session.exec(
        select(models.BranchHubFulfillment).where(models.BranchHubFulfillment.order_id == order.id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hub fulfillment already exists for this order")

    group = rg.get_group_for_tenant(session, user.tenant_id)
    if not group or not group.hub_tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Restaurant group has no hub kitchen designated",
        )
    if group.hub_tenant_id == user.tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Hub kitchen cannot create a branch fulfillment for its own order",
        )
    if user.tenant_id not in {
        m.tenant_id
        for m in session.exec(
            select(models.RestaurantGroupMember).where(
                models.RestaurantGroupMember.group_id == group.id
            )
        ).all()
    }:
        raise HTTPException(status_code=403, detail="Not a restaurant group member")

    now = datetime.now(timezone.utc)
    row = models.BranchHubFulfillment(
        group_id=group.id,
        order_id=order.id,
        branch_tenant_id=user.tenant_id,
        hub_tenant_id=group.hub_tenant_id,
        status=models.HubFulfillmentStatus.requested,
        notes=(notes.strip() if notes and notes.strip() else None),
        created_at=now,
        updated_at=now,
        created_by_user_id=user.id,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def list_fulfillments(session: Session, *, tenant_id: int) -> list[models.BranchHubFulfillment]:
    group = rg.get_group_for_tenant(session, tenant_id)
    if not group:
        return []
    if group.hub_tenant_id == tenant_id:
        rows = session.exec(
            select(models.BranchHubFulfillment)
            .where(models.BranchHubFulfillment.hub_tenant_id == tenant_id)
            .order_by(models.BranchHubFulfillment.created_at.desc())
        ).all()
    else:
        rows = session.exec(
            select(models.BranchHubFulfillment)
            .where(models.BranchHubFulfillment.branch_tenant_id == tenant_id)
            .order_by(models.BranchHubFulfillment.created_at.desc())
        ).all()
    return list(rows)


def get_fulfillment_for_order(
    session: Session, order_id: int
) -> models.BranchHubFulfillment | None:
    return session.exec(
        select(models.BranchHubFulfillment).where(models.BranchHubFulfillment.order_id == order_id)
    ).first()


def fulfillments_by_order_ids(
    session: Session, order_ids: list[int]
) -> dict[int, models.BranchHubFulfillment]:
    if not order_ids:
        return {}
    rows = session.exec(
        select(models.BranchHubFulfillment).where(
            models.BranchHubFulfillment.order_id.in_(order_ids)
        )
    ).all()
    return {r.order_id: r for r in rows}


def update_fulfillment_status(
    session: Session,
    *,
    fulfillment_id: int,
    user: models.User,
    new_status: models.HubFulfillmentStatus,
    notes: str | None = None,
) -> models.BranchHubFulfillment:
    row = session.get(models.BranchHubFulfillment, fulfillment_id)
    if not row:
        raise HTTPException(status_code=404, detail="Hub fulfillment not found")

    is_hub = user.tenant_id == row.hub_tenant_id
    is_branch = user.tenant_id == row.branch_tenant_id
    if not is_hub and not is_branch:
        raise HTTPException(status_code=404, detail="Hub fulfillment not found")

    current = row.status
    if isinstance(current, str):
        current = models.HubFulfillmentStatus(current)

    if new_status == models.HubFulfillmentStatus.cancelled:
        if current in TERMINAL_STATUSES:
            raise HTTPException(status_code=400, detail="Fulfillment is already terminal")
        if not (is_hub or is_branch):
            raise HTTPException(status_code=403, detail="Not allowed")
    else:
        if not is_hub:
            raise HTTPException(status_code=403, detail="Only the hub kitchen can advance status")
        allowed = HUB_ADVANCE.get(current, set())
        if new_status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot change status from {current.value} to {new_status.value}",
            )

    row.status = new_status
    row.updated_at = datetime.now(timezone.utc)
    if notes is not None:
        row.notes = notes.strip() or None
    if new_status == models.HubFulfillmentStatus.prepared_at_hq:
        row.prepared_at = row.updated_at
        row.prepared_by_user_id = user.id
    session.add(row)
    session.commit()
    session.refresh(row)
    return row
