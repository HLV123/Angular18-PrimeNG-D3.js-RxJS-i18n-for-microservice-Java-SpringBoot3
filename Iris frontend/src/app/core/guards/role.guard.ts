import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Build the full path from route segments
  const fullPath = '/' + route.url.map(s => s.path).join('/');

  if (auth.canAccessRoute(fullPath)) {
    return true;
  }

  // Redirect to unauthorized page or dashboard
  router.navigate(['/unauthorized']);
  return false;
};
