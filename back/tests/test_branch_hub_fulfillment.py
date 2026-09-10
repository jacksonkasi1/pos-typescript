"""Branch hub fulfillment: central kitchen prep for sibling orders (GitHub #323)."""
from __future__ import annotations

import unittest
from datetime import timedelta

from pg_client_mixin import PgClientTestCase

from app import models, security
from app.security import get_password_hash


def _bearer_headers(user: models.User) -> dict[str, str]:
    data = {
        "sub": user.email,
        "tenant_id": user.tenant_id,
        "provider_id": getattr(user, "provider_id", None),
        "token_version": user.token_version,
    }
    token = security.create_access_token(data, expires_delta=timedelta(minutes=30))
    return {"Authorization": f"Bearer {token}"}


class TestBranchHubFulfillment(PgClientTestCase):
    def setUp(self) -> None:
        super().setUp()
        self.hub = models.Tenant(name="HQ Kitchen")
        self.branch = models.Tenant(name="Branch North")
        self.outsider = models.Tenant(name="Outsider")
        self.session.add(self.hub)
        self.session.add(self.branch)
        self.session.add(self.outsider)
        self.session.commit()
        self.session.refresh(self.hub)
        self.session.refresh(self.branch)
        self.session.refresh(self.outsider)

        self.owner_hub = models.User(
            email="hub-owner@test.local",
            hashed_password=get_password_hash("secret"),
            full_name="Hub Owner",
            tenant_id=self.hub.id,
            role=models.UserRole.owner,
        )
        self.owner_branch = models.User(
            email="branch-owner@test.local",
            hashed_password=get_password_hash("secret"),
            full_name="Branch Owner",
            tenant_id=self.branch.id,
            role=models.UserRole.owner,
        )
        self.owner_out = models.User(
            email="out-owner@test.local",
            hashed_password=get_password_hash("secret"),
            full_name="Out Owner",
            tenant_id=self.outsider.id,
            role=models.UserRole.owner,
        )
        self.session.add(self.owner_hub)
        self.session.add(self.owner_branch)
        self.session.add(self.owner_out)
        self.session.commit()
        self.session.refresh(self.owner_hub)
        self.session.refresh(self.owner_branch)
        self.session.refresh(self.owner_out)

        floor = models.Floor(tenant_id=self.branch.id, name="Main", sort_order=0)
        self.session.add(floor)
        self.session.commit()
        self.session.refresh(floor)
        self.table = models.Table(
            tenant_id=self.branch.id,
            floor_id=floor.id,
            name="T01",
            seat_count=4,
            token="hub-ff-table-token",
        )
        self.session.add(self.table)
        self.session.commit()
        self.session.refresh(self.table)

        product = models.Product(
            tenant_id=self.branch.id,
            name="Prep Dish",
            price_cents=1200,
            category="Food",
        )
        self.session.add(product)
        self.session.commit()
        self.session.refresh(product)
        self.product = product

        order = models.Order(
            tenant_id=self.branch.id,
            table_id=self.table.id,
            status=models.OrderStatus.pending,
            customer_name="Guest",
        )
        self.session.add(order)
        self.session.commit()
        self.session.refresh(order)
        self.order = order
        item = models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            quantity=1,
            price_cents=1200,
        )
        self.session.add(item)
        self.session.commit()

    def _link_group_with_hub(self) -> None:
        resp = self.client.post(
            "/restaurant-group",
            json={"name": "Multi site", "share_products": False, "share_customers": False},
            headers=_bearer_headers(self.owner_hub),
        )
        self.assertEqual(resp.status_code, 200, resp.text)
        join_code = resp.json()["join_code"]
        resp_join = self.client.post(
            "/restaurant-group/join",
            json={"join_code": join_code},
            headers=_bearer_headers(self.owner_branch),
        )
        self.assertEqual(resp_join.status_code, 200, resp_join.text)
        resp_hub = self.client.put(
            "/restaurant-group/hub",
            json={"hub_tenant_id": self.hub.id},
            headers=_bearer_headers(self.owner_hub),
        )
        self.assertEqual(resp_hub.status_code, 200, resp_hub.text)
        self.assertEqual(resp_hub.json()["hub_tenant_id"], self.hub.id)
        self.assertTrue(resp_hub.json()["is_hub"])

    def test_happy_path_prepared_at_hq(self) -> None:
        self._link_group_with_hub()
        create = self.client.post(
            f"/orders/{self.order.id}/hub-fulfillment",
            json={"notes": "Please prep for transfer"},
            headers=_bearer_headers(self.owner_branch),
        )
        self.assertEqual(create.status_code, 200, create.text)
        body = create.json()
        self.assertEqual(body["status"], "requested")
        self.assertEqual(body["branch_tenant_id"], self.branch.id)
        self.assertEqual(body["hub_tenant_id"], self.hub.id)
        ff_id = body["id"]

        hub_list = self.client.get(
            "/hub-fulfillments", headers=_bearer_headers(self.owner_hub)
        )
        self.assertEqual(hub_list.status_code, 200)
        self.assertEqual(len(hub_list.json()), 1)
        self.assertEqual(hub_list.json()[0]["id"], ff_id)

        outsider_list = self.client.get(
            "/hub-fulfillments", headers=_bearer_headers(self.owner_out)
        )
        self.assertEqual(outsider_list.status_code, 200)
        self.assertEqual(outsider_list.json(), [])

        patch = self.client.patch(
            f"/hub-fulfillments/{ff_id}",
            json={"status": "prepared_at_hq"},
            headers=_bearer_headers(self.owner_hub),
        )
        self.assertEqual(patch.status_code, 200, patch.text)
        self.assertEqual(patch.json()["status"], "prepared_at_hq")
        self.assertIsNotNone(patch.json()["prepared_at"])

        orders = self.client.get("/orders", headers=_bearer_headers(self.owner_branch))
        self.assertEqual(orders.status_code, 200)
        row = next(o for o in orders.json() if o["id"] == self.order.id)
        self.assertEqual(row["hub_fulfillment"]["status"], "prepared_at_hq")
        self.assertFalse(row["can_request_hub_fulfillment"])

    def test_isolation_outsider_cannot_see_or_update(self) -> None:
        self._link_group_with_hub()
        create = self.client.post(
            f"/orders/{self.order.id}/hub-fulfillment",
            json={},
            headers=_bearer_headers(self.owner_branch),
        )
        self.assertEqual(create.status_code, 200)
        ff_id = create.json()["id"]

        bad = self.client.patch(
            f"/hub-fulfillments/{ff_id}",
            json={"status": "prepared_at_hq"},
            headers=_bearer_headers(self.owner_out),
        )
        self.assertEqual(bad.status_code, 404)

        steal = self.client.post(
            f"/orders/{self.order.id}/hub-fulfillment",
            json={},
            headers=_bearer_headers(self.owner_out),
        )
        self.assertEqual(steal.status_code, 404)

    def test_hub_must_be_member(self) -> None:
        resp = self.client.post(
            "/restaurant-group",
            json={"name": "Solo", "share_products": False, "share_customers": False},
            headers=_bearer_headers(self.owner_hub),
        )
        self.assertEqual(resp.status_code, 200)
        bad = self.client.put(
            "/restaurant-group/hub",
            json={"hub_tenant_id": self.outsider.id},
            headers=_bearer_headers(self.owner_hub),
        )
        self.assertEqual(bad.status_code, 400)

    def test_requires_hub_designation(self) -> None:
        resp = self.client.post(
            "/restaurant-group",
            json={"name": "No hub yet", "share_products": False, "share_customers": False},
            headers=_bearer_headers(self.owner_hub),
        )
        join_code = resp.json()["join_code"]
        self.client.post(
            "/restaurant-group/join",
            json={"join_code": join_code},
            headers=_bearer_headers(self.owner_branch),
        )
        create = self.client.post(
            f"/orders/{self.order.id}/hub-fulfillment",
            json={},
            headers=_bearer_headers(self.owner_branch),
        )
        self.assertEqual(create.status_code, 400)
