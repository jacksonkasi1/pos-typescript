"""Server-side fiscal invoice issuance (VeriFactu preparation).

Hash chaining and AEAT ValidarQR URL shape are implemented here.
Official AEAT SOAP/huella remisión is deferred to certified middleware
(see docs/0065-verifactu-production.md). No guessed production AEAT calls.
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlencode

from fastapi import HTTPException
from sqlmodel import Session, col, select

from app import models
from app.fiscal_providers import LIVE_OK_STATUSES, live_credentials_ready, submit_fiscal_record
from app.order_discounts import order_level_discount_cents
from app.settings import settings

logger = logging.getLogger(__name__)

_ISSUABLE_STATUSES = frozenset(
    {
        models.OrderStatus.paid,
        models.OrderStatus.completed,
    }
)

HASH_SCHEMA = "pos.fiscal.hash.v1"
AEAT_QR_TEST = "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR"
AEAT_QR_PROD = "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR"


def _issuer_nif(tenant: models.Tenant) -> str:
    raw = (tenant.tax_id or tenant.cif or "").strip().upper().replace(" ", "").replace("-", "")
    return raw[:9] if raw else "PENDING00"


def order_fiscal_amount_cents(session: Session, order: models.Order) -> int:
    items = session.exec(select(models.OrderItem).where(models.OrderItem.order_id == order.id)).all()
    active = [
        i
        for i in items
        if not i.removed_by_customer
        and i.removed_by_user_id is None
        and i.status != models.OrderItemStatus.cancelled
    ]
    subtotal = sum(i.price_cents * i.quantity for i in active)
    tip = int(order.tip_amount_cents or 0)
    fee = int(getattr(order, "delivery_fee_cents", 0) or 0)
    discount = order_level_discount_cents(order)
    return max(0, subtotal - discount + tip + fee)


def _canonical_hash_payload(
    *,
    tenant_id: int,
    record_type: str,
    full_number: str,
    amount_cents: int,
    issuer_nif: str,
    issued_at: datetime,
    previous_hash: str,
    order_id: int,
) -> str:
    """Deterministic JSON for internal chain — not the official AEAT huella algorithm."""
    issued = issued_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    body = {
        "schema": HASH_SCHEMA,
        "tenant_id": tenant_id,
        "record_type": record_type,
        "full_number": full_number,
        "amount_cents": amount_cents,
        "issuer_nif": issuer_nif,
        "issued_at": issued,
        "previous_hash": previous_hash or "",
        "order_id": order_id,
    }
    return json.dumps(body, sort_keys=True, separators=(",", ":"))


def compute_record_hash(
    *,
    tenant_id: int,
    record_type: str,
    full_number: str,
    amount_cents: int,
    issuer_nif: str,
    issued_at: datetime,
    previous_hash: str,
    order_id: int,
) -> str:
    raw = _canonical_hash_payload(
        tenant_id=tenant_id,
        record_type=record_type,
        full_number=full_number,
        amount_cents=amount_cents,
        issuer_nif=issuer_nif,
        issued_at=issued_at,
        previous_hash=previous_hash,
        order_id=order_id,
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _last_chain_hash(session: Session, tenant_id: int) -> str:
    row = session.exec(
        select(models.FiscalInvoice)
        .where(models.FiscalInvoice.tenant_id == tenant_id)
        .where(col(models.FiscalInvoice.record_hash) != "")
        .order_by(models.FiscalInvoice.issued_at.desc(), models.FiscalInvoice.id.desc())
    ).first()
    return (row.record_hash if row else "") or ""


def build_verification_qr_url(
    *,
    mode: str,
    issuer_nif: str,
    full_number: str,
    issued_at: datetime,
    amount_cents: int,
) -> str:
    base = AEAT_QR_PROD if mode == "live" else AEAT_QR_TEST
    fecha = issued_at.astimezone(timezone.utc).strftime("%d-%m-%Y")
    importe = f"{amount_cents / 100:.2f}"
    query = urlencode(
        {
            "nif": issuer_nif[:9],
            "numserie": full_number[:60],
            "fecha": fecha,
            "importe": importe,
        }
    )
    return f"{base}?{query}"


def _verification_text(mode: str, submission_status: str) -> str:
    if mode == "live":
        return (
            "VeriFactu — live mode unlocked only with certified middleware. "
            "Confirm remisión status with your fiscal provider and AEAT cotejo. "
            "This application does not by itself satisfy legal filing obligations."
        )
    if submission_status in ("sandbox_recorded", "middleware_accepted", "middleware_queued"):
        return (
            "VeriFactu — test / sandbox mode. "
            "Record chained and sandbox-submitted locally (or via middleware hook). "
            "Not a production AEAT filing."
        )
    return (
        "VeriFactu — test / draft mode. "
        "Internal hash chain only; not a real AEAT submission. "
        "Final field mapping must follow the official specification / certified middleware."
    )


def build_issue_payload(
    order: models.Order,
    tenant: models.Tenant,
    full_number: str,
    billing_customer: models.BillingCustomer | None,
    *,
    record_type: str,
    amount_cents: int,
    previous_hash: str,
    record_hash: str,
) -> dict[str, Any]:
    bc = None
    if billing_customer:
        bc = {
            "name": billing_customer.name,
            "company_name": billing_customer.company_name,
            "tax_id": billing_customer.tax_id,
        }
    return {
        "schema": "pos.fiscal_invoice.v2",
        "hash_schema": HASH_SCHEMA,
        "record_type": record_type,
        "full_number": full_number,
        "order_id": order.id,
        "tenant_id": tenant.id,
        "tenant_tax_id": tenant.tax_id or tenant.cif,
        "amount_cents": amount_cents,
        "previous_hash": previous_hash,
        "record_hash": record_hash,
        "billing_customer": bc,
        "disclaimer": (
            "Internal POS payload + hash chain. Official AEAT wire format is supplied by "
            "certified middleware when configured; see docs/0065-verifactu-production.md."
        ),
    }


def get_fiscal_alta(
    session: Session, tenant_id: int, order_id: int
) -> models.FiscalInvoice | None:
    return session.exec(
        select(models.FiscalInvoice).where(
            models.FiscalInvoice.tenant_id == tenant_id,
            models.FiscalInvoice.order_id == order_id,
            models.FiscalInvoice.record_type == "alta",
        )
    ).first()


def order_has_active_fiscal_alta(session: Session, tenant_id: int, order_id: int) -> bool:
    fi = get_fiscal_alta(session, tenant_id, order_id)
    return bool(fi and fi.status not in ("cancelled", "void"))


def assert_order_fiscally_mutable(session: Session, tenant_id: int, order_id: int) -> None:
    """Block edits/deletes when an active fiscal alta exists (use anulación instead)."""
    if order_has_active_fiscal_alta(session, tenant_id, order_id):
        raise HTTPException(
            status_code=409,
            detail=(
                "Order has an issued fiscal invoice and cannot be edited or deleted. "
                "Issue a fiscal cancellation (anulación) first."
            ),
        )


def live_mode_allowed() -> bool:
    unlock = bool(getattr(settings, "fiscal_live_unlock", False))
    return unlock and live_credentials_ready()


def assert_fiscal_mode_allowed(mode: str) -> None:
    if mode == "live" and not live_mode_allowed():
        raise HTTPException(
            status_code=400,
            detail=(
                "fiscal_mode live is blocked until FISCAL_LIVE_UNLOCK=true and "
                "certified middleware credentials are ready "
                "(FISCAL_MIDDLEWARE_PROVIDER=fiskaly_sign_es|generic|mock; "
                "see docs/0065-verifactu-production.md and docs/0074-fiscal-certified-middleware.md)"
            ),
        )


def submit_sandbox(
    session: Session,
    fi: models.FiscalInvoice,
    tenant: models.Tenant,
    *,
    require_live_success: bool = False,
) -> models.FiscalInvoice:
    """Near-real-time sandbox/live path (local record and/or certified middleware)."""
    if fi.sandbox_submitted_at and fi.submission_status not in (
        "local_only",
        "middleware_error",
        "middleware_unreachable",
        "provider_error",
        "provider_unreachable",
    ):
        if not require_live_success or fi.submission_status in LIVE_OK_STATUSES:
            return fi

    payload = {
        "schema": "pos.fiscal.sandbox_submit.v1",
        "tenant_id": tenant.id,
        "fiscal_invoice_id": fi.id,
        "full_number": fi.full_number,
        "record_type": fi.record_type,
        "record_hash": fi.record_hash,
        "previous_hash": fi.previous_hash,
        "amount_cents": fi.amount_cents,
        "mode": fi.mode,
        "request_payload": fi.request_payload,
        "cancels_full_number": (fi.request_payload or {}).get("cancels_full_number")
        if isinstance(fi.request_payload, dict)
        else None,
    }
    result = submit_fiscal_record(payload, tenant, mode=fi.mode or "test")
    now = datetime.now(timezone.utc)
    status = str(result.get("status") or "sandbox_recorded")
    fi.submission_status = status
    fi.sandbox_submitted_at = now
    fi.response_payload = {
        **(fi.response_payload or {}),
        "sandbox": result,
        "submitted_at": now.isoformat(),
    }
    qr = result.get("verification_qr")
    if qr:
        fi.verification_qr_content = str(qr)[:2000]
    fi.verification_text = _verification_text(fi.mode, fi.submission_status)
    session.add(fi)
    session.flush()

    if require_live_success and status not in LIVE_OK_STATUSES:
        raise HTTPException(
            status_code=502,
            detail=(
                f"Certified VeriFactu middleware rejected or unreachable live submission "
                f"(status={status}). Fix provider credentials / connectivity and retry. "
                f"See docs/0074-fiscal-certified-middleware.md"
            ),
        )
    return fi


def issue_or_get_fiscal_invoice(
    session: Session,
    tenant: models.Tenant,
    order: models.Order,
) -> models.FiscalInvoice:
    mode = (tenant.fiscal_mode or "off").strip().lower()
    if mode == "off":
        raise HTTPException(status_code=400, detail="Fiscal invoicing is disabled for this tenant")
    if mode not in ("test", "live"):
        raise HTTPException(status_code=400, detail="Invalid fiscal_mode")
    if mode == "live":
        assert_fiscal_mode_allowed("live")

    existing = get_fiscal_alta(session, tenant.id, order.id)
    if existing:
        if mode == "test" and (
            not existing.sandbox_submitted_at
            or existing.submission_status
            in ("local_only", "middleware_error", "middleware_unreachable")
        ):
            submit_sandbox(session, existing, tenant)
        elif mode == "live" and existing.submission_status not in LIVE_OK_STATUSES:
            submit_sandbox(session, existing, tenant, require_live_success=True)
        return existing

    if order.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == models.OrderStatus.cancelled:
        raise HTTPException(status_code=400, detail="Cannot issue fiscal invoice for a cancelled order")
    if order.status not in _ISSUABLE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Order must be paid or completed before issuing a fiscal invoice",
        )

    billing_customer = None
    if order.billing_customer_id:
        billing_customer = session.get(models.BillingCustomer, order.billing_customer_id)
        if billing_customer and billing_customer.tenant_id != tenant.id:
            billing_customer = None

    tenant_locked = session.exec(
        select(models.Tenant).where(models.Tenant.id == tenant.id).with_for_update()
    ).first()
    if not tenant_locked:
        raise HTTPException(status_code=404, detail="Tenant not found")

    series = (tenant_locked.fiscal_invoice_series or "VF").strip() or "VF"
    num = int(tenant_locked.fiscal_invoice_next_number or 1)
    full_number = f"{series}-{num}"
    issued_at = datetime.now(timezone.utc)
    amount_cents = order_fiscal_amount_cents(session, order)
    issuer_nif = _issuer_nif(tenant_locked)
    previous_hash = _last_chain_hash(session, tenant.id)
    record_hash = compute_record_hash(
        tenant_id=tenant.id,
        record_type="alta",
        full_number=full_number,
        amount_cents=amount_cents,
        issuer_nif=issuer_nif,
        issued_at=issued_at,
        previous_hash=previous_hash,
        order_id=order.id,
    )
    qr_content = build_verification_qr_url(
        mode=mode,
        issuer_nif=issuer_nif,
        full_number=full_number,
        issued_at=issued_at,
        amount_cents=amount_cents,
    )
    req_payload = build_issue_payload(
        order,
        tenant_locked,
        full_number,
        billing_customer,
        record_type="alta",
        amount_cents=amount_cents,
        previous_hash=previous_hash,
        record_hash=record_hash,
    )
    resp_payload = {
        "status": "issued_local",
        "note": "No direct AEAT HTTP call; sandbox/middleware may follow in test mode.",
        "hash_schema": HASH_SCHEMA,
    }

    fi = models.FiscalInvoice(
        tenant_id=tenant.id,
        order_id=order.id,
        series=series,
        doc_number=num,
        full_number=full_number,
        mode=mode,
        status="issued",
        issued_at=issued_at,
        request_payload=req_payload,
        response_payload=resp_payload,
        verification_qr_content=qr_content,
        verification_text=_verification_text(mode, "local_only"),
        record_type="alta",
        previous_hash=previous_hash,
        record_hash=record_hash,
        amount_cents=amount_cents,
        submission_status="local_only",
    )
    tenant_locked.fiscal_invoice_next_number = num + 1
    session.add(fi)
    session.add(tenant_locked)
    session.flush()

    if mode == "test":
        submit_sandbox(session, fi, tenant_locked)
    elif mode == "live":
        # Live requires certified middleware acceptance (never invent AEAT endpoints).
        submit_sandbox(session, fi, tenant_locked, require_live_success=True)

    return fi


def cancel_fiscal_invoice(
    session: Session,
    tenant: models.Tenant,
    order: models.Order,
) -> models.FiscalInvoice:
    """Issue anulación (credit-note cancel) for the order's active fiscal alta."""
    mode = (tenant.fiscal_mode or "off").strip().lower()
    if mode == "off":
        raise HTTPException(status_code=400, detail="Fiscal invoicing is disabled for this tenant")
    if mode == "live":
        assert_fiscal_mode_allowed("live")

    alta = get_fiscal_alta(session, tenant.id, order.id)
    if not alta:
        raise HTTPException(status_code=404, detail="Fiscal invoice not found")
    if alta.status in ("cancelled", "void"):
        existing_cancel = session.exec(
            select(models.FiscalInvoice).where(
                models.FiscalInvoice.tenant_id == tenant.id,
                models.FiscalInvoice.cancels_fiscal_invoice_id == alta.id,
                models.FiscalInvoice.record_type == "anulacion",
            )
        ).first()
        if existing_cancel:
            return existing_cancel
        raise HTTPException(status_code=400, detail="Fiscal invoice already cancelled")

    tenant_locked = session.exec(
        select(models.Tenant).where(models.Tenant.id == tenant.id).with_for_update()
    ).first()
    if not tenant_locked:
        raise HTTPException(status_code=404, detail="Tenant not found")

    series = (tenant_locked.fiscal_invoice_series or "VF").strip() or "VF"
    num = int(tenant_locked.fiscal_invoice_next_number or 1)
    full_number = f"{series}-C{num}"
    issued_at = datetime.now(timezone.utc)
    amount_cents = int(alta.amount_cents or 0)
    issuer_nif = _issuer_nif(tenant_locked)
    previous_hash = _last_chain_hash(session, tenant.id)
    record_hash = compute_record_hash(
        tenant_id=tenant.id,
        record_type="anulacion",
        full_number=full_number,
        amount_cents=amount_cents,
        issuer_nif=issuer_nif,
        issued_at=issued_at,
        previous_hash=previous_hash,
        order_id=order.id,
    )
    qr_content = build_verification_qr_url(
        mode=mode if mode in ("test", "live") else "test",
        issuer_nif=issuer_nif,
        full_number=full_number,
        issued_at=issued_at,
        amount_cents=amount_cents,
    )
    req_payload = build_issue_payload(
        order,
        tenant_locked,
        full_number,
        None,
        record_type="anulacion",
        amount_cents=amount_cents,
        previous_hash=previous_hash,
        record_hash=record_hash,
    )
    req_payload["cancels_full_number"] = alta.full_number
    req_payload["cancels_fiscal_invoice_id"] = alta.id

    cancel_fi = models.FiscalInvoice(
        tenant_id=tenant.id,
        order_id=order.id,
        series=series,
        doc_number=num,
        full_number=full_number,
        mode=mode if mode in ("test", "live") else "test",
        status="issued",
        issued_at=issued_at,
        request_payload=req_payload,
        response_payload={"status": "anulacion_local", "hash_schema": HASH_SCHEMA},
        verification_qr_content=qr_content,
        verification_text=_verification_text(mode if mode in ("test", "live") else "test", "local_only"),
        record_type="anulacion",
        previous_hash=previous_hash,
        record_hash=record_hash,
        cancels_fiscal_invoice_id=alta.id,
        amount_cents=amount_cents,
        submission_status="local_only",
    )
    alta.status = "cancelled"
    tenant_locked.fiscal_invoice_next_number = num + 1
    session.add(cancel_fi)
    session.add(alta)
    session.add(tenant_locked)
    session.flush()

    if mode == "test":
        submit_sandbox(session, cancel_fi, tenant_locked)
    elif mode == "live":
        submit_sandbox(session, cancel_fi, tenant_locked, require_live_success=True)

    return cancel_fi


def fiscal_invoice_public_dict(fi: models.FiscalInvoice) -> dict[str, Any]:
    return {
        "id": fi.id,
        "order_id": fi.order_id,
        "series": fi.series,
        "doc_number": fi.doc_number,
        "full_number": fi.full_number,
        "mode": fi.mode,
        "status": fi.status,
        "record_type": getattr(fi, "record_type", None) or "alta",
        "issued_at": fi.issued_at.isoformat() if fi.issued_at else None,
        "verification_qr_content": fi.verification_qr_content,
        "verification_text": fi.verification_text,
        "previous_hash": getattr(fi, "previous_hash", None) or "",
        "record_hash": getattr(fi, "record_hash", None) or "",
        "amount_cents": int(getattr(fi, "amount_cents", 0) or 0),
        "submission_status": getattr(fi, "submission_status", None) or "local_only",
        "sandbox_submitted_at": (
            fi.sandbox_submitted_at.isoformat()
            if getattr(fi, "sandbox_submitted_at", None)
            else None
        ),
        "cancels_fiscal_invoice_id": getattr(fi, "cancels_fiscal_invoice_id", None),
    }
