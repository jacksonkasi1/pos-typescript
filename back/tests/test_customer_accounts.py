"""End-user customer register / login / verify / orders (#340)."""
import hashlib
import sys
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

from pg_client_mixin import PgClientTestCase

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from app import models, security
from sqlmodel import select


class TestCustomerAccounts(PgClientTestCase):
    def setUp(self):
        super().setUp()
        from app.settings import settings

        self._prev_public_base = settings.public_app_base_url
        settings.public_app_base_url = "http://127.0.0.1:4202"

    def tearDown(self):
        from app.settings import settings

        settings.public_app_base_url = self._prev_public_base
        super().tearDown()

    @patch(
        "app.customer_routes.email_svc.send_customer_verification_email",
        new_callable=AsyncMock,
    )
    @patch("app.customer_routes.email_svc.smtp_credentials_configured", return_value=True)
    def test_register_login_me_orders(self, _smtp_ok, mock_send):
        mock_send.return_value = True
        email = "end-user-customer@amvara.de"
        password = "secretpass1"

        r = self.client.post(
            "/customer/register",
            json={"email": email, "password": password, "full_name": "End User"},
        )
        self.assertEqual(r.status_code, 201, r.text)
        body = r.json()
        self.assertEqual(body["email"], email)
        self.assertFalse(body["email_verified"])
        self.assertTrue(body["verification_email_sent"])
        mock_send.assert_called_once()
        verify_url = mock_send.call_args.args[1]
        self.assertIn("/customer/verify-email?token=", verify_url)
        raw_token = verify_url.split("token=", 1)[1]

        r = self.client.post(
            "/customer/token",
            json={"email": email, "password": password},
        )
        self.assertEqual(r.status_code, 200, r.text)
        self.assertIn("customer_access_token", r.cookies)

        r = self.client.get("/customer/me")
        self.assertEqual(r.status_code, 200, r.text)
        me = r.json()
        self.assertEqual(me["email"], email)
        self.assertFalse(me["email_verified"])
        customer_id = me["id"]

        r = self.client.get("/customer/orders")
        self.assertEqual(r.status_code, 200, r.text)
        self.assertEqual(r.json()["count"], 0)

        # Staff Factura path untouched: BillingCustomer still exists independently
        tenant = models.Tenant(name="Factura Cafe")
        self.session.add(tenant)
        self.session.commit()
        self.session.refresh(tenant)
        bc = models.BillingCustomer(
            tenant_id=tenant.id, name="Company S.L.", email="factura@amvara.de"
        )
        self.session.add(bc)
        self.session.commit()

        r = self.client.get(f"/customer/verify-email?token={raw_token}")
        self.assertEqual(r.status_code, 200, r.text)
        self.assertTrue(r.json()["email_verified"])

        r = self.client.get("/customer/me")
        self.assertEqual(r.status_code, 200, r.text)
        self.assertTrue(r.json()["email_verified"])

        # Link an order and list it
        order = models.Order(
            tenant_id=tenant.id,
            status=models.OrderStatus.pending,
            customer_id=customer_id,
            customer_name="End User",
        )
        self.session.add(order)
        self.session.commit()

        r = self.client.get("/customer/orders")
        self.assertEqual(r.status_code, 200, r.text)
        data = r.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["orders"][0]["id"], order.id)

    def test_register_duplicate_email(self):
        email = "dup-customer@amvara.de"
        self.session.add(
            models.Customer(
                email=email,
                hashed_password=security.get_password_hash("secretpass1"),
            )
        )
        self.session.commit()
        r = self.client.post(
            "/customer/register",
            json={"email": email, "password": "secretpass1"},
        )
        self.assertEqual(r.status_code, 400, r.text)
        self.assertEqual(r.json()["detail"]["code"], "email_already_registered")

    def test_login_wrong_password(self):
        email = "wrong-pw-customer@amvara.de"
        self.session.add(
            models.Customer(
                email=email,
                hashed_password=security.get_password_hash("secretpass1"),
            )
        )
        self.session.commit()
        r = self.client.post(
            "/customer/token",
            json={"email": email, "password": "nope-wrong"},
        )
        self.assertEqual(r.status_code, 401, r.text)

    def test_verify_invalid_token(self):
        r = self.client.get("/customer/verify-email?token=not-a-real-token-xx")
        self.assertEqual(r.status_code, 400, r.text)
        self.assertEqual(r.json()["detail"]["code"], "customer_verification_invalid")

    def test_me_requires_auth(self):
        r = self.client.get("/customer/me")
        self.assertEqual(r.status_code, 401, r.text)

    def test_staff_token_does_not_access_customer_me(self):
        tenant = models.Tenant(name="Staff Only")
        self.session.add(tenant)
        self.session.commit()
        self.session.refresh(tenant)
        user = models.User(
            email="staff-not-customer@amvara.de",
            hashed_password=security.get_password_hash("secret"),
            tenant_id=tenant.id,
            role=models.UserRole.owner,
        )
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        token = security.create_access_token(
            data={
                "sub": user.email,
                "tenant_id": tenant.id,
                "token_version": user.token_version,
            }
        )
        r = self.client.get(
            "/customer/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(r.status_code, 401, r.text)

    def test_verification_token_hash_stored(self):
        raw = "abc123token"
        th = hashlib.sha256(raw.encode()).hexdigest()
        c = models.Customer(
            email="hash-check@amvara.de",
            hashed_password=security.get_password_hash("secretpass1"),
            email_verification_token_hash=th,
        )
        self.session.add(c)
        self.session.commit()
        found = self.session.exec(
            select(models.Customer).where(models.Customer.email_verification_token_hash == th)
        ).first()
        self.assertIsNotNone(found)


if __name__ == "__main__":
    unittest.main()
