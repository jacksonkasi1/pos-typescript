import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api.service';
import { ApiErrorMessageService } from '../services/api-error-message.service';

@Component({
  selector: 'app-customer-verify-email',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1>{{ 'CUSTOMER_AUTH.VERIFY_TITLE' | translate }}</h1>
        </div>
        @if (loading()) {
          <p data-testid="customer-verify-working">{{ 'CUSTOMER_AUTH.VERIFY_WORKING' | translate }}</p>
        } @else if (ok()) {
          <div class="success-banner" data-testid="customer-verify-success">{{ message() }}</div>
          <div class="auth-actions-foot">
            <a routerLink="/customer/login" data-testid="customer-verify-go-login">{{ 'CUSTOMER_AUTH.GO_LOGIN' | translate }}</a>
          </div>
        } @else {
          <div class="error-banner" data-testid="customer-verify-error">{{ message() }}</div>
          <div class="auth-actions-foot">
            <a routerLink="/customer/login">{{ 'CUSTOMER_AUTH.GO_LOGIN' | translate }}</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-5);
      background: var(--color-bg);
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--space-8);
      text-align: center;
    }
    .auth-header h1 { font-size: 1.75rem; font-weight: 600; margin-bottom: var(--space-4); }
    .error-banner {
      background: rgba(220, 38, 38, 0.1);
      color: var(--color-error);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      margin-bottom: var(--space-4);
    }
    .success-banner {
      background: rgba(22, 163, 74, 0.12);
      color: var(--color-success, #15803d);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      margin-bottom: var(--space-4);
    }
    .auth-actions-foot a {
      color: var(--color-primary);
      font-weight: 500;
      text-decoration: none;
    }
  `],
})
export class CustomerVerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private apiErr = inject(ApiErrorMessageService);
  private translate = inject(TranslateService);

  loading = signal(true);
  ok = signal(false);
  message = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!token) {
      this.loading.set(false);
      this.ok.set(false);
      this.message.set(this.translate.instant('CUSTOMER_AUTH.VERIFY_FAILED'));
      return;
    }
    this.api.customerVerifyEmail(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.ok.set(true);
        this.message.set(this.translate.instant('CUSTOMER_AUTH.VERIFY_SUCCESS'));
      },
      error: (err) => {
        this.loading.set(false);
        this.ok.set(false);
        this.message.set(this.apiErr.fromHttpError(err, 'CUSTOMER_AUTH.VERIFY_FAILED'));
      },
    });
  }
}
