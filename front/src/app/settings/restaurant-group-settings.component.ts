import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, HubFulfillment, RestaurantGroup } from '../services/api.service';

@Component({
  selector: 'app-restaurant-group-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="section" data-testid="settings-restaurant-group-section">
      <div class="section-header">
        <h2>{{ 'SETTINGS.RESTAURANT_GROUP_TITLE' | translate }}</h2>
        <p>{{ 'SETTINGS.RESTAURANT_GROUP_SUBTITLE' | translate }}</p>
      </div>

      @if (loading()) {
        <p class="hint">{{ 'COMMON.LOADING' | translate }}</p>
      } @else if (error()) {
        <p class="error-text">{{ error() }}</p>
      } @else if (!group()) {
        <div class="card-block">
          <h3>{{ 'SETTINGS.RESTAURANT_GROUP_CREATE' | translate }}</h3>
          <label>
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_NAME' | translate }}</span>
            <input type="text" [(ngModel)]="createName" [placeholder]="'SETTINGS.RESTAURANT_GROUP_NAME_PLACEHOLDER' | translate" />
          </label>
          <label class="checkbox-row">
            <input type="checkbox" [(ngModel)]="createShareProducts" />
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_SHARE_PRODUCTS' | translate }}</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" [(ngModel)]="createShareCustomers" />
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_SHARE_CUSTOMERS' | translate }}</span>
          </label>
          <button type="button" class="btn btn-primary" [disabled]="creating() || !createName.trim()" (click)="createGroup()">
            {{ creating() ? ('COMMON.SAVING' | translate) : ('SETTINGS.RESTAURANT_GROUP_CREATE_BTN' | translate) }}
          </button>

          <hr />

          <h3>{{ 'SETTINGS.RESTAURANT_GROUP_JOIN' | translate }}</h3>
          <p class="hint">{{ 'SETTINGS.RESTAURANT_GROUP_JOIN_HINT' | translate }}</p>
          <label>
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_JOIN_CODE' | translate }}</span>
            <input type="text" [(ngModel)]="joinCode" [placeholder]="'SETTINGS.RESTAURANT_GROUP_JOIN_CODE_PLACEHOLDER' | translate" />
          </label>
          <button type="button" class="btn btn-secondary" [disabled]="joining() || !joinCode.trim()" (click)="joinGroup()">
            {{ joining() ? ('COMMON.SAVING' | translate) : ('SETTINGS.RESTAURANT_GROUP_JOIN_BTN' | translate) }}
          </button>
        </div>
      } @else {
        <div class="card-block">
          <label>
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_NAME' | translate }}</span>
            <input type="text" [(ngModel)]="editName" (ngModelChange)="dirty.set(true)" />
          </label>
          <label class="checkbox-row">
            <input type="checkbox" [(ngModel)]="editShareProducts" (ngModelChange)="dirty.set(true)" />
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_SHARE_PRODUCTS' | translate }}</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" [(ngModel)]="editShareCustomers" (ngModelChange)="dirty.set(true)" />
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_SHARE_CUSTOMERS' | translate }}</span>
          </label>
          <button type="button" class="btn btn-primary" [disabled]="!dirty() || saving()" (click)="saveGroup()">
            {{ saving() ? ('COMMON.SAVING' | translate) : ('COMMON.SAVE' | translate) }}
          </button>

          <div class="join-code-row">
            <label>
              <span>{{ 'SETTINGS.RESTAURANT_GROUP_JOIN_CODE' | translate }}</span>
              <input type="text" [value]="group()!.join_code" readonly />
            </label>
            <p class="hint">{{ 'SETTINGS.RESTAURANT_GROUP_JOIN_CODE_HINT' | translate }}</p>
          </div>

          <h3>{{ 'SETTINGS.RESTAURANT_GROUP_MEMBERS' | translate }}</h3>
          <ul class="member-list">
            @for (m of group()!.members; track m.tenant_id) {
              <li [class.current]="m.is_current">
                {{ m.tenant_name }}
                @if (m.is_current) {
                  <span class="badge">{{ 'SETTINGS.RESTAURANT_GROUP_THIS_LOCATION' | translate }}</span>
                }
                @if (m.is_hub) {
                  <span class="badge hub">{{ 'SETTINGS.RESTAURANT_GROUP_HUB_BADGE' | translate }}</span>
                }
              </li>
            }
          </ul>

          <h3>{{ 'SETTINGS.RESTAURANT_GROUP_HUB_TITLE' | translate }}</h3>
          <p class="hint">{{ 'SETTINGS.RESTAURANT_GROUP_HUB_HINT' | translate }}</p>
          <label>
            <span>{{ 'SETTINGS.RESTAURANT_GROUP_HUB_SELECT' | translate }}</span>
            <select
              data-testid="restaurant-group-hub-select"
              [(ngModel)]="editHubTenantId"
              (ngModelChange)="onHubSelectChange()"
            >
              <option [ngValue]="null">{{ 'SETTINGS.RESTAURANT_GROUP_HUB_NONE' | translate }}</option>
              @for (m of group()!.members; track m.tenant_id) {
                <option [ngValue]="m.tenant_id">{{ m.tenant_name }}</option>
              }
            </select>
          </label>
          <button
            type="button"
            class="btn btn-secondary"
            data-testid="restaurant-group-hub-save"
            [disabled]="!hubDirty() || savingHub()"
            (click)="saveHub()"
          >
            {{ savingHub() ? ('COMMON.SAVING' | translate) : ('SETTINGS.RESTAURANT_GROUP_HUB_SAVE' | translate) }}
          </button>

          @if (group()!.is_hub) {
            <h3>{{ 'SETTINGS.RESTAURANT_GROUP_HUB_INBOX' | translate }}</h3>
            <p class="hint">{{ 'SETTINGS.RESTAURANT_GROUP_HUB_INBOX_HINT' | translate }}</p>
            @if (fulfillmentsLoading()) {
              <p class="hint">{{ 'COMMON.LOADING' | translate }}</p>
            } @else if (fulfillments().length === 0) {
              <p class="hint">{{ 'SETTINGS.RESTAURANT_GROUP_HUB_INBOX_EMPTY' | translate }}</p>
            } @else {
              <ul class="fulfillment-list" data-testid="hub-fulfillment-inbox">
                @for (ff of fulfillments(); track ff.id) {
                  <li>
                    <div>
                      <strong>#{{ ff.order_id }}</strong>
                      @if (ff.order_customer_name) {
                        — {{ ff.order_customer_name }}
                      }
                      <span class="ff-status">{{ hubStatusLabel(ff.status) | translate }}</span>
                    </div>
                    @if (ff.status !== 'prepared_at_hq' && ff.status !== 'cancelled') {
                      <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        [disabled]="markingId() === ff.id"
                        (click)="markPrepared(ff)"
                      >
                        {{ 'SETTINGS.RESTAURANT_GROUP_MARK_PREPARED' | translate }}
                      </button>
                    }
                  </li>
                }
              </ul>
            }
          }

          <button type="button" class="btn btn-secondary danger-outline" [disabled]="leaving()" (click)="leaveGroup()">
            {{ leaving() ? ('COMMON.SAVING' | translate) : ('SETTINGS.RESTAURANT_GROUP_LEAVE' | translate) }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .card-block {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 32rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.9rem;
      }
      .checkbox-row {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }
      input[type='text'],
      select {
        padding: 0.4rem 0.6rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .member-list,
      .fulfillment-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .member-list li,
      .fulfillment-list li {
        padding: 0.35rem 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .badge {
        margin-left: 0.5rem;
        font-size: 0.75rem;
        background: #e8e8e8;
        padding: 0.1rem 0.4rem;
        border-radius: 3px;
      }
      .badge.hub {
        background: #dbeafe;
        color: #1e40af;
      }
      .ff-status {
        margin-left: 0.5rem;
        font-size: 0.85rem;
        color: #555;
      }
      .hint {
        color: #666;
        font-size: 0.85rem;
      }
      .error-text {
        color: #b91c1c;
      }
      .danger-outline {
        border-color: #b91c1c;
        color: #b91c1c;
        margin-top: 1rem;
      }
      .btn-sm {
        font-size: 0.85rem;
        padding: 0.25rem 0.6rem;
      }
      hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 1rem 0;
      }
    `,
  ],
})
export class RestaurantGroupSettingsComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  group = signal<RestaurantGroup | null>(null);
  creating = signal(false);
  joining = signal(false);
  saving = signal(false);
  savingHub = signal(false);
  leaving = signal(false);
  dirty = signal(false);
  hubDirty = signal(false);
  fulfillments = signal<HubFulfillment[]>([]);
  fulfillmentsLoading = signal(false);
  markingId = signal<number | null>(null);

  createName = '';
  createShareProducts = false;
  createShareCustomers = false;
  joinCode = '';

  editName = '';
  editShareProducts = false;
  editShareCustomers = false;
  editHubTenantId: number | null = null;

  ngOnInit(): void {
    this.reload();
  }

  hubStatusLabel(status: string): string {
    switch (status) {
      case 'prepared_at_hq':
        return 'SETTINGS.RESTAURANT_GROUP_STATUS_PREPARED';
      case 'preparing':
        return 'SETTINGS.RESTAURANT_GROUP_STATUS_PREPARING';
      case 'cancelled':
        return 'SETTINGS.RESTAURANT_GROUP_STATUS_CANCELLED';
      default:
        return 'SETTINGS.RESTAURANT_GROUP_STATUS_REQUESTED';
    }
  }

  private reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getRestaurantGroup().subscribe({
      next: (g) => {
        this.applyGroup(g);
        this.loading.set(false);
        if (g?.is_hub) {
          this.loadFulfillments();
        }
      },
      error: () => {
        this.error.set('Failed to load restaurant group');
        this.loading.set(false);
      },
    });
  }

  private applyGroup(g: RestaurantGroup | null): void {
    this.group.set(g);
    if (g) {
      this.editName = g.name;
      this.editShareProducts = g.share_products;
      this.editShareCustomers = g.share_customers;
      this.editHubTenantId = g.hub_tenant_id ?? null;
      this.dirty.set(false);
      this.hubDirty.set(false);
    }
  }

  private loadFulfillments(): void {
    this.fulfillmentsLoading.set(true);
    this.api.listHubFulfillments().subscribe({
      next: (rows) => {
        this.fulfillments.set(rows);
        this.fulfillmentsLoading.set(false);
      },
      error: () => {
        this.fulfillments.set([]);
        this.fulfillmentsLoading.set(false);
      },
    });
  }

  onHubSelectChange(): void {
    this.hubDirty.set(true);
  }

  createGroup(): void {
    this.creating.set(true);
    this.error.set(null);
    this.api
      .createRestaurantGroup({
        name: this.createName.trim(),
        share_products: this.createShareProducts,
        share_customers: this.createShareCustomers,
      })
      .subscribe({
        next: (g) => {
          this.applyGroup(g);
          this.creating.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail ?? 'Failed to create group');
          this.creating.set(false);
        },
      });
  }

  joinGroup(): void {
    this.joining.set(true);
    this.error.set(null);
    this.api.joinRestaurantGroup(this.joinCode.trim()).subscribe({
      next: (g) => {
        this.applyGroup(g);
        this.joining.set(false);
        if (g.is_hub) {
          this.loadFulfillments();
        }
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'Failed to join group');
        this.joining.set(false);
      },
    });
  }

  saveGroup(): void {
    this.saving.set(true);
    this.error.set(null);
    this.api
      .updateRestaurantGroup({
        name: this.editName.trim(),
        share_products: this.editShareProducts,
        share_customers: this.editShareCustomers,
      })
      .subscribe({
        next: (g) => {
          this.applyGroup(g);
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.detail ?? 'Failed to save group');
          this.saving.set(false);
        },
      });
  }

  saveHub(): void {
    this.savingHub.set(true);
    this.error.set(null);
    this.api.setRestaurantGroupHub(this.editHubTenantId).subscribe({
      next: (g) => {
        this.applyGroup(g);
        this.savingHub.set(false);
        if (g.is_hub) {
          this.loadFulfillments();
        } else {
          this.fulfillments.set([]);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'Failed to save hub kitchen');
        this.savingHub.set(false);
      },
    });
  }

  markPrepared(ff: HubFulfillment): void {
    this.markingId.set(ff.id);
    this.api.updateHubFulfillment(ff.id, 'prepared_at_hq').subscribe({
      next: (updated) => {
        this.fulfillments.update((rows) =>
          rows.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
        );
        this.markingId.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'Failed to update fulfillment');
        this.markingId.set(null);
      },
    });
  }

  leaveGroup(): void {
    this.leaving.set(true);
    this.error.set(null);
    this.api.leaveRestaurantGroup().subscribe({
      next: () => {
        this.group.set(null);
        this.createName = '';
        this.joinCode = '';
        this.fulfillments.set([]);
        this.leaving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'Failed to leave group');
        this.leaving.set(false);
      },
    });
  }
}
