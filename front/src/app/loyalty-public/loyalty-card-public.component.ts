import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../services/api.service';
import { LanguagePickerComponent } from '../shared/language-picker.component';

@Component({
  selector: 'app-loyalty-card-public',
  standalone: true,
  imports: [TranslateModule, LanguagePickerComponent],
  template: `
    <div class="book-page loyalty-card" data-testid="loyalty-card-page">
      <app-language-picker></app-language-picker>
      @if (loading()) {
        <p>{{ 'COMMON.LOADING' | translate }}</p>
      } @else if (error()) {
        <p class="error">{{ 'LOYALTY_PUBLIC.CARD_NOT_FOUND' | translate }}</p>
      } @else {
        <h1>{{ programName() }}</h1>
        <p>{{ displayName() }}</p>
        <p class="balance">
          {{ 'LOYALTY_PUBLIC.BALANCE' | translate }}: <strong>{{ balance() }}</strong>
        </p>
        @if (vipTier()) {
          <p class="tier" data-testid="loyalty-card-vip">
            {{ 'LOYALTY_PUBLIC.VIP_TIER' | translate }}: <strong>{{ vipTier() }}</strong>
          </p>
        }
        @if (referralCode() && tenantId()) {
          <p class="hint">{{ 'LOYALTY_PUBLIC.REFERRAL_SHARE' | translate }}</p>
          <p class="token">
            <code>{{ origin }}/loyalty/{{ tenantId() }}?ref={{ referralCode() }}</code>
          </p>
        }
        @if (applePkpassUrl() || googleSaveUrl()) {
          <div class="wallet-actions" data-testid="loyalty-card-wallet-actions">
            @if (applePkpassUrl(); as appleUrl) {
              <a class="btn" [href]="appleUrl" data-testid="loyalty-card-add-apple">
                {{ 'LOYALTY_PUBLIC.ADD_APPLE_WALLET' | translate }}
              </a>
            }
            @if (googleSaveUrl(); as gUrl) {
              <a
                class="btn"
                [href]="gUrl"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="loyalty-card-add-google"
              >
                {{ 'LOYALTY_PUBLIC.ADD_GOOGLE_WALLET' | translate }}
              </a>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .loyalty-card {
        padding: 1.5rem;
      }
      .balance,
      .tier {
        font-size: 1.25rem;
      }
      .error {
        color: #b00020;
      }
      .hint {
        color: var(--text-muted, #666);
      }
      .token code {
        word-break: break-all;
      }
      .wallet-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .wallet-actions .btn {
        display: inline-block;
        padding: 0.5rem 0.85rem;
        border-radius: 4px;
        background: #1e5a3c;
        color: #fff;
        text-decoration: none;
        font-weight: 600;
      }
    `,
  ],
})
export class LoyaltyCardPublicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  loading = signal(true);
  error = signal(false);
  programName = signal('');
  displayName = signal('');
  balance = signal(0);
  vipTier = signal<string | null>(null);
  referralCode = signal<string | null>(null);
  tenantId = signal<number | null>(null);
  applePkpassUrl = signal<string | null>(null);
  googleSaveUrl = signal<string | null>(null);
  origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('memberToken') || '';
    if (!token) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }
    this.api.getPublicLoyaltyBalance(token).subscribe({
      next: (res) => {
        this.programName.set(res.program?.program_name || '');
        this.displayName.set(res.membership.display_name);
        this.balance.set(res.membership.balance);
        this.vipTier.set(res.membership.vip_tier ?? null);
        this.referralCode.set(res.membership.referral_code ?? null);
        this.tenantId.set(res.membership.tenant_id ?? null);
        if (res.wallet?.apple_wallet_available) {
          this.applePkpassUrl.set(this.api.getPublicLoyaltyApplePkpassUrl(token));
        }
        if (res.wallet?.google_wallet_available) {
          this.api.getPublicLoyaltyGoogleSave(token).subscribe({
            next: (g) => this.googleSaveUrl.set(g.google_save_url || null),
            error: () => this.googleSaveUrl.set(null),
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
