import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConnectivityService } from '../services/connectivity.service';
import {
  OfflineOrderQueueService,
  OfflinePaymentIntent,
} from '../services/offline-order-queue.service';
import { PermissionService } from '../services/permission.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-offline-cash-sale',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <section class="offline-cash" [class.offline-cash--warn]="!connectivity.isOnline()">
      <div class="offline-cash-head">
        <h2>{{ 'OFFLINE.CASH_SALE_TITLE' | translate }}</h2>
        <span
          class="offline-status"
          [class.offline-status--ok]="connectivity.isOnline()"
          [class.offline-status--bad]="!connectivity.isOnline()"
          role="status"
        >
          @if (connectivity.status() === 'online') {
            {{ 'OFFLINE.STATUS_ONLINE' | translate }}
          } @else if (connectivity.status() === 'degraded') {
            {{ 'OFFLINE.STATUS_DEGRADED' | translate }}
          } @else {
            {{ 'OFFLINE.STATUS_OFFLINE' | translate }}
          }
        </span>
        @if (queue.pendingCount() > 0) {
          <span class="offline-pending">{{ 'OFFLINE.PENDING_SYNC' | translate: { count: queue.pendingCount() } }}</span>
        }
      </div>
      <p class="offline-cash-hint">{{ 'OFFLINE.CASH_SALE_HINT' | translate }}</p>
      <p class="offline-cash-hint offline-cash-hint--secondary">{{ 'OFFLINE.CARD_DEFERRED_HINT' | translate }}</p>
      @if (!hasTakeAway()) {
        <p class="offline-cash-error">{{ 'OFFLINE.NO_TAKE_AWAY' | translate }}</p>
      } @else if ((cacheProducts().length === 0)) {
        <p class="offline-cash-error">{{ 'OFFLINE.NO_PRODUCT_CACHE' | translate }}</p>
        @if (connectivity.isOnline()) {
          <button type="button" class="btn btn-secondary btn-sm" (click)="refreshCache()">
            {{ 'OFFLINE.REFRESH_CACHE' | translate }}
          </button>
        }
      } @else {
        <div class="offline-cash-form">
          <label>
            <span>{{ 'OFFLINE.PRODUCT' | translate }}</span>
            <select [(ngModel)]="productId">
              <option [ngValue]="null">{{ 'OFFLINE.SELECT_PRODUCT' | translate }}</option>
              @for (p of cacheProducts(); track p.id) {
                <option [ngValue]="p.id">{{ p.name }} ({{ formatPrice(p.price_cents) }})</option>
              }
            </select>
          </label>
          <label>
            <span>{{ 'OFFLINE.QTY' | translate }}</span>
            <input type="number" min="1" max="99" [(ngModel)]="quantity" />
          </label>
          <label>
            <span>{{ 'OFFLINE.CUSTOMER' | translate }}</span>
            <input type="text" [(ngModel)]="customerName" [placeholder]="'OFFLINE.CUSTOMER_PH' | translate" />
          </label>
          <label>
            <span>{{ 'OFFLINE.PAYMENT' | translate }}</span>
            <select [(ngModel)]="paymentIntent">
              <option value="cash">{{ 'OFFLINE.PAYMENT_CASH' | translate }}</option>
              <option value="card">{{ 'OFFLINE.PAYMENT_CARD_DEFERRED' | translate }}</option>
            </select>
          </label>
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="!canSubmit() || submitting()"
            (click)="submit()"
          >
            {{ submitLabelKey() | translate }}
          </button>
        </div>
      }
      @if (messageKey()) {
        <p class="offline-cash-msg" role="status">{{ messageKey()! | translate }}</p>
      }
      @if (recent().length > 0) {
        <ul class="offline-queue-list">
          @for (q of recent(); track q.idempotency_key) {
            <li [class]="'st-' + q.status">
              {{ q.product_names?.join(', ') || '—' }} ×{{ q.items[0]?.quantity || 1 }}
              · {{ q.payment_intent === 'card' ? ('OFFLINE.PAYMENT_CARD_DEFERRED' | translate) : ('OFFLINE.PAYMENT_CASH' | translate) }}
              — {{ q.status }}
              @if (q.order_id) { (#{{ q.order_id }}) }
              @if (q.needs_payment) { — {{ 'OFFLINE.NEEDS_CARD' | translate }} }
              @if (q.error) { — {{ q.error }} }
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .offline-cash {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 6px;
      background: var(--color-surface, #fff);
    }
    .offline-cash--warn {
      border-color: #d97706;
      background: #fffbeb;
    }
    .offline-cash-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 0.75rem;
    }
    .offline-cash-head h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .offline-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .offline-status--ok {
      background: #d1fae5;
      color: #065f46;
    }
    .offline-status--bad {
      background: #fee2e2;
      color: #991b1b;
    }
    .offline-pending {
      font-size: 0.75rem;
      color: #92400e;
    }
    .offline-cash-hint {
      margin: 0.35rem 0 0.35rem;
      font-size: 0.8125rem;
      color: var(--color-text-muted, #6b7280);
    }
    .offline-cash-hint--secondary {
      margin-top: 0;
      margin-bottom: 0.75rem;
    }
    .offline-cash-error {
      color: #991b1b;
      font-size: 0.875rem;
    }
    .offline-cash-form {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: flex-end;
    }
    .offline-cash-form label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
    }
    .offline-cash-form select,
    .offline-cash-form input[type='text'],
    .offline-cash-form input[type='number'] {
      min-width: 8rem;
      padding: 0.35rem 0.5rem;
      border: 1px solid var(--color-border, #d1d5db);
      border-radius: 4px;
    }
    .offline-cash-msg {
      margin: 0.5rem 0 0;
      font-size: 0.875rem;
      color: #065f46;
    }
    .offline-queue-list {
      margin: 0.5rem 0 0;
      padding-left: 1.1rem;
      font-size: 0.75rem;
      color: #4b5563;
    }
    .offline-queue-list .st-failed {
      color: #991b1b;
    }
    .offline-queue-list .st-synced {
      color: #065f46;
    }
    .btn-sm {
      font-size: 0.8125rem;
      padding: 0.25rem 0.5rem;
    }
  `,
})
export class OfflineCashSaleComponent implements OnInit {
  readonly connectivity = inject(ConnectivityService);
  readonly queue = inject(OfflineOrderQueueService);
  private readonly permissions = inject(PermissionService);
  private readonly api = inject(ApiService);

  productId: number | null = null;
  quantity = 1;
  customerName = '';
  paymentIntent: OfflinePaymentIntent = 'cash';
  readonly submitting = signal(false);
  readonly messageKey = signal<string | null>(null);

  readonly cacheProducts = computed(() => this.queue.cache()?.products ?? []);
  readonly hasTakeAway = computed(() => !!this.queue.cache()?.take_away_table);
  readonly recent = computed(() => [...this.queue.queue()].slice(-8).reverse());

  ngOnInit(): void {
    if (!this.canUse()) return;
    this.queue.refreshCacheFromServer();
  }

  canUse(): boolean {
    const u = this.api.getCurrentUser();
    return (
      this.permissions.hasPermission(u, 'order:update_status') &&
      this.permissions.hasPermission(u, 'order:mark_paid')
    );
  }

  canSubmit(): boolean {
    return this.canUse() && this.productId != null && this.quantity >= 1 && this.hasTakeAway();
  }

  submitLabelKey(): string {
    const online = this.connectivity.isOnline();
    if (this.paymentIntent === 'card') {
      return online ? 'OFFLINE.RECORD_CARD' : 'OFFLINE.QUEUE_CARD';
    }
    return online ? 'OFFLINE.RECORD_CASH' : 'OFFLINE.QUEUE_CASH';
  }

  refreshCache(): void {
    this.queue.refreshCacheFromServer();
  }

  formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  submit(): void {
    if (!this.canSubmit() || this.productId == null) return;
    this.submitting.set(true);
    this.messageKey.set(null);
    const item = this.queue.enqueueCashSale({
      productId: this.productId,
      quantity: this.quantity,
      customerName: this.customerName,
      paymentIntent: this.paymentIntent,
    });
    this.submitting.set(false);
    if (!item) {
      this.messageKey.set('OFFLINE.ENQUEUE_FAILED');
      return;
    }
    if (this.paymentIntent === 'card') {
      this.messageKey.set(
        this.connectivity.isOnline() ? 'OFFLINE.QUEUED_CARD_ONLINE' : 'OFFLINE.QUEUED_CARD_OFFLINE'
      );
    } else {
      this.messageKey.set(
        this.connectivity.isOnline() ? 'OFFLINE.QUEUED_ONLINE' : 'OFFLINE.QUEUED_OFFLINE'
      );
    }
    this.quantity = 1;
    this.customerName = '';
  }
}
