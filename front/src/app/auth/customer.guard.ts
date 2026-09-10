import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../services/api.service';

/**
 * Guard for end-user customer portal. Requires customer_access_token cookie.
 * Redirects to /customer/login when not authenticated as a Customer.
 */
export const customerGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.getCustomerMe().pipe(
    map((me) => (me?.id ? true : router.createUrlTree(['/customer/login']))),
    catchError(() => of(router.createUrlTree(['/customer/login']))),
  );
};
