"""Certified German TSE (KassenSichV) cloud adapters.

Chosen primary: Fiskaly SIGN DE (see docs/0074-fiscal-certified-middleware.md).
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

import requests

from app import models
from app.settings import settings

logger = logging.getLogger(__name__)

PROVIDER_MOCK = "mock"
PROVIDER_GENERIC = "generic"
PROVIDER_FISKALY_SIGN_DE = "fiskaly_sign_de"
_VALID = frozenset({PROVIDER_MOCK, PROVIDER_GENERIC, PROVIDER_FISKALY_SIGN_DE})

FISKALY_SIGN_DE_TEST = "https://kassensichv-middleware.fiskaly.com/api/v2"
FISKALY_SIGN_DE_LIVE = "https://kassensichv.fiskaly.com/api/v2"

LIVE_OK_STATUSES = frozenset({"provider_accepted", "mock_accepted"})


def tse_provider_name() -> str:
    raw = (getattr(settings, "tse_provider", None) or PROVIDER_GENERIC).strip().lower()
    return raw if raw in _VALID else PROVIDER_GENERIC


def _api_key() -> str:
    return (getattr(settings, "tse_provider_api_key", None) or "").strip()


def _api_secret() -> str:
    return (getattr(settings, "tse_provider_api_secret", None) or "").strip()


def _configured_base() -> str:
    return (getattr(settings, "tse_provider_base_url", None) or "").strip().rstrip("/")


def fiskaly_base_url(*, live: bool) -> str:
    configured = _configured_base()
    if configured:
        return configured
    return FISKALY_SIGN_DE_LIVE if live else FISKALY_SIGN_DE_TEST


def live_credentials_ready() -> bool:
    name = tse_provider_name()
    if name == PROVIDER_MOCK:
        return not bool(getattr(settings, "is_production", False))
    if name == PROVIDER_FISKALY_SIGN_DE:
        tss = (getattr(settings, "tse_fiskaly_tss_id", None) or "").strip()
        return bool(_api_key() and _api_secret() and tss)
    return bool(_configured_base())


def sign_tse_transaction(
    payload: dict[str, Any],
    tenant: models.Tenant,
    *,
    mode: str,
) -> dict[str, Any]:
    name = tse_provider_name()
    if name == PROVIDER_MOCK:
        return _sign_mock(payload, tenant, mode=mode)
    if name == PROVIDER_FISKALY_SIGN_DE:
        return _sign_fiskaly_sign_de(payload, tenant, mode=mode)
    return _sign_generic(payload)


def _sign_mock(
    payload: dict[str, Any],
    tenant: models.Tenant,
    *,
    mode: str,
) -> dict[str, Any]:
    counter = int(payload.get("signature_counter") or 1)
    serial = f"MOCK-TSE-T{tenant.id}"
    sig = f"mock-sig-{uuid.uuid4().hex}"
    qr = f"V0;MOCK;{serial};{counter};{sig[:32]}"
    return {
        "status": "mock_accepted",
        "channel": "mock",
        "provider": PROVIDER_MOCK,
        "http_status": 200,
        "signature": sig,
        "qr_content": qr,
        "tse_serial": serial,
        "certificate_serial": f"MOCK-CERT-{tenant.id}",
        "body": {
            "schema": "pos.tse.mock.v1",
            "disclaimer": (
                "In-process mock cloud TSE — not a BSI TR-03153 certified signature. "
                "Use only for automated tests / non-production live vertical slice."
            ),
            "mode": mode,
            "process_type": payload.get("process_type"),
            "order_id": payload.get("order_id"),
        },
    }


def _sign_generic(payload: dict[str, Any]) -> dict[str, Any]:
    base = _configured_base()
    if not base:
        return {"status": "local_stub", "channel": "local", "provider": PROVIDER_GENERIC}
    url = f"{base}/tse/sign"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    key = _api_key()
    if key:
        headers["Authorization"] = f"Bearer {key}"
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=12)
        body = _parse_json_body(resp)
        if resp.status_code >= 400:
            logger.warning("TSE generic provider HTTP %s: %s", resp.status_code, body)
            return {
                "status": "provider_error",
                "http_status": resp.status_code,
                "channel": "provider",
                "provider": PROVIDER_GENERIC,
                "body": body,
            }
        out: dict[str, Any] = {
            "status": "provider_accepted",
            "http_status": resp.status_code,
            "channel": "provider",
            "provider": PROVIDER_GENERIC,
            "body": body,
        }
        if isinstance(body, dict):
            if body.get("signature"):
                out["signature"] = str(body["signature"])[:512]
            if body.get("qr_content"):
                out["qr_content"] = str(body["qr_content"])[:2000]
            if body.get("tse_serial"):
                out["tse_serial"] = str(body["tse_serial"])[:128]
            if body.get("certificate_serial"):
                out["certificate_serial"] = str(body["certificate_serial"])[:128]
        return out
    except requests.RequestException as exc:
        logger.warning("TSE generic provider request failed: %s", exc)
        return {
            "status": "provider_unreachable",
            "channel": "provider",
            "provider": PROVIDER_GENERIC,
            "error": str(exc)[:200],
        }


def _sign_fiskaly_sign_de(
    payload: dict[str, Any],
    tenant: models.Tenant,
    *,
    mode: str,
) -> dict[str, Any]:
    """ACTIVE → FINISHED transaction against Fiskaly SIGN DE (KassenSichV middleware)."""
    key = _api_key()
    secret = _api_secret()
    tss_id = (getattr(settings, "tse_fiskaly_tss_id", None) or "").strip()
    client_id = (getattr(tenant, "tse_client_id", None) or "").strip()
    if not key or not secret:
        return {
            "status": "provider_error",
            "channel": "fiskaly_sign_de",
            "provider": PROVIDER_FISKALY_SIGN_DE,
            "error": "TSE_PROVIDER_API_KEY and TSE_PROVIDER_API_SECRET required",
        }
    if not tss_id:
        return {
            "status": "provider_error",
            "channel": "fiskaly_sign_de",
            "provider": PROVIDER_FISKALY_SIGN_DE,
            "error": "TSE_FISKALY_TSS_ID required for Fiskaly SIGN DE",
        }
    if not client_id:
        return {
            "status": "provider_error",
            "channel": "fiskaly_sign_de",
            "provider": PROVIDER_FISKALY_SIGN_DE,
            "error": "tenant tse_client_id (Fiskaly client UUID) required",
        }

    base = fiskaly_base_url(live=(mode == "live"))
    token = _fiskaly_auth(base, key, secret)
    if not token:
        return {
            "status": "provider_unreachable",
            "channel": "fiskaly_sign_de",
            "provider": PROVIDER_FISKALY_SIGN_DE,
            "error": "SIGN DE auth failed",
        }

    tx_id = str(uuid.uuid4())
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    amount_cents = int(payload.get("amount_cents") or 0)
    amount = f"{amount_cents / 100:.2f}"
    process_type = str(payload.get("process_type") or "sale")
    receipt_type = "CANCELLATION" if process_type == "storno" else "RECEIPT"

    try:
        # Start
        r1 = requests.put(
            f"{base}/tss/{tss_id}/tx/{tx_id}",
            params={"tx_revision": 1},
            json={"state": "ACTIVE", "client_id": client_id},
            headers=headers,
            timeout=20,
        )
        if r1.status_code >= 400:
            body = _parse_json_body(r1)
            logger.warning("fiskaly SIGN DE ACTIVE HTTP %s: %s", r1.status_code, body)
            return {
                "status": "provider_error",
                "http_status": r1.status_code,
                "channel": "fiskaly_sign_de",
                "provider": PROVIDER_FISKALY_SIGN_DE,
                "body": body,
            }

        # Finish with receipt schema
        finish_body = {
            "state": "FINISHED",
            "client_id": client_id,
            "schema": {
                "standard_v1": {
                    "receipt": {
                        "receipt_type": receipt_type,
                        "amounts_per_vat_rate": [{"vat_rate": "NORMAL", "amount": amount}],
                        "amounts_per_payment_type": [{"payment_type": "CASH", "amount": amount}],
                    }
                }
            },
        }
        r2 = requests.put(
            f"{base}/tss/{tss_id}/tx/{tx_id}",
            params={"tx_revision": 2},
            json=finish_body,
            headers=headers,
            timeout=20,
        )
        body = _parse_json_body(r2)
        if r2.status_code >= 400:
            logger.warning("fiskaly SIGN DE FINISHED HTTP %s: %s", r2.status_code, body)
            return {
                "status": "provider_error",
                "http_status": r2.status_code,
                "channel": "fiskaly_sign_de",
                "provider": PROVIDER_FISKALY_SIGN_DE,
                "body": body,
            }

        signature = None
        qr = None
        serial = None
        cert = None
        counter = None
        if isinstance(body, dict):
            sig_obj = body.get("signature") if isinstance(body.get("signature"), dict) else {}
            if isinstance(sig_obj, dict):
                signature = sig_obj.get("value") or sig_obj.get("signature")
                counter = sig_obj.get("counter")
            qr = body.get("qr_code_data") or body.get("qr_code")
            serial = body.get("tss_serial_number") or body.get("serial_number")
            cert = body.get("certificate_serial") or (
                sig_obj.get("certificate") if isinstance(sig_obj, dict) else None
            )

        out: dict[str, Any] = {
            "status": "provider_accepted",
            "http_status": r2.status_code,
            "channel": "fiskaly_sign_de",
            "provider": PROVIDER_FISKALY_SIGN_DE,
            "body": body,
            "middleware_record_id": tx_id,
        }
        if signature:
            out["signature"] = str(signature)[:512]
        if qr:
            out["qr_content"] = str(qr)[:2000]
        if serial:
            out["tse_serial"] = str(serial)[:128]
        if cert:
            out["certificate_serial"] = str(cert)[:128]
        if counter is not None:
            out["signature_counter"] = int(counter)
        return out
    except requests.RequestException as exc:
        logger.warning("fiskaly SIGN DE request failed: %s", exc)
        return {
            "status": "provider_unreachable",
            "channel": "fiskaly_sign_de",
            "provider": PROVIDER_FISKALY_SIGN_DE,
            "error": str(exc)[:200],
        }


def _fiskaly_auth(base: str, api_key: str, api_secret: str) -> str | None:
    url = f"{base.rstrip('/')}/auth"
    try:
        resp = requests.post(
            url,
            json={"api_key": api_key, "api_secret": api_secret},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=12,
        )
        body = _parse_json_body(resp)
        if resp.status_code >= 400:
            logger.warning("fiskaly SIGN DE auth HTTP %s: %s", resp.status_code, body)
            return None
        if isinstance(body, dict):
            token = body.get("access_token") or body.get("token")
            if token:
                return str(token)
        return None
    except requests.RequestException as exc:
        logger.warning("fiskaly SIGN DE auth failed: %s", exc)
        return None


def _parse_json_body(resp: requests.Response) -> dict[str, Any]:
    try:
        parsed = resp.json()
        return parsed if isinstance(parsed, dict) else {"raw": parsed}
    except Exception:
        return {"raw": (resp.text or "")[:500]}
