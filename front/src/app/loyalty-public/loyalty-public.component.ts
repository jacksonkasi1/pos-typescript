import { Component, DestroyRef, OnInit, afterNextRender, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { ApiService, LoyaltyProgramPublic } from '../services/api.service';
import { LanguagePickerComponent } from '../shared/language-picker.component';
import { LegalLinksComponent } from '../shared/legal-links.component';
import { contactEmailValid, contactPhoneValid } from '../shared/contact-validators';

@Component({
  selector: 'app-loyalty-public',
  standalone: true,
  imports: [FormsModule, TranslateModule, LanguagePickerComponent, LegalLinksComponent],
  templateUrl: './loyalty-public.component.html',
  styleUrls: ['../book/book.component.scss', './loyalty-public.component.scss'],
})
export class LoyaltyPublicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private translate = inject(TranslateService);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);

  tenantId = signal(0);
  program = signal<LoyaltyProgramPublic | null>(null);
  loading = signal(true);
  errorKind = signal<'invalid_tenant' | 'not_enabled' | null>(null);
  submitting = signal(false);
  submitted = signal(false);
  submitError = signal<string | null>(null);
  memberToken = signal<string | null>(null);
  balance = signal(0);
  walletNote = signal('');
  applePkpassUrl = signal<string | null>(null);
  googleSaveUrl = signal<string | null>(null);
  origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';

  displayName = '';
  email = '';
  phone = '';
  birthdayMonth: number | null = null;
  birthdayDay: number | null = null;
  referralCode = '';
  vipTier = signal<string | null>(null);
  ownReferralCode = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.updateDocumentTitle());
  }

  ngOnInit(): void {
    merge(
      this.translate.onLangChange,
      this.translate.onTranslationChange,
      this.translate.onDefaultLangChange,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateDocumentTitle());

    const idParam = this.route.snapshot.paramMap.get('tenantId');
    const id = idParam ? Number(idParam) : NaN;
    if (!Number.isFinite(id) || id <= 0) {
      this.errorKind.set('invalid_tenant');
      this.loading.set(false);
      return;
    }
    this.tenantId.set(id);
    const ref = this.route.snapshot.queryParamMap.get('ref');
    if (ref?.trim()) {
      this.referralCode = ref.trim();
    }
    this.api.getPublicLoyaltyProgram(id).subscribe({
      next: (p) => {
        this.program.set(p);
        this.walletNote.set(p.wallet?.detail || '');
        this.loading.set(false);
        this.updateDocumentTitle();
      },
      error: () => {
        this.errorKind.set('not_enabled');
        this.loading.set(false);
      },
    });
  }

  canSubmit(): boolean {
    if (!this.displayName.trim()) return false;
    const hasEmail = !!this.email.trim();
    const hasPhone = !!this.phone.trim();
    if (!hasEmail && !hasPhone) return false;
    if (hasEmail && !contactEmailValid(this.email)) return false;
    if (hasPhone && !contactPhoneValid(this.phone)) return false;
    return true;
  }

  submit(): void {
    if (!this.canSubmit() || this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set(null);
    const month = Number(this.birthdayMonth);
    const day = Number(this.birthdayDay);
    this.api
      .joinPublicLoyalty(this.tenantId(), {
        display_name: this.displayName.trim(),
        email: this.email.trim() || undefined,
        phone: this.phone.trim() || undefined,
        birthday_month: Number.isFinite(month) && month >= 1 ? month : null,
        birthday_day: Number.isFinite(day) && day >= 1 ? day : null,
        referral_code: this.referralCode.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.submitted.set(true);
          const token = res.membership.member_token ?? null;
          this.memberToken.set(token);
          this.balance.set(res.membership.balance);
          this.vipTier.set(res.membership.vip_tier ?? null);
          this.ownReferralCode.set(res.membership.referral_code ?? null);
          this.walletNote.set(res.wallet?.detail || this.walletNote());
          const applePath = res.apple_pkpass_path || res.wallet?.apple_pkpass_path;
          this.applePkpassUrl.set(
            token && (res.wallet?.apple_wallet_available || applePath)
              ? this.api.getPublicLoyaltyApplePkpassUrl(token)
              : null,
          );
          this.googleSaveUrl.set(res.google_save_url || res.wallet?.google_save_url || null);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err?.error?.detail || 'Join failed');
        },
      });
  }

  private updateDocumentTitle(): void {
    const name = this.program()?.program_name || this.translate.instant('LOYALTY_PUBLIC.TITLE');
    this.title.setTitle(String(name));
  }
}
