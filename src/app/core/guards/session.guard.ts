import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/http/auth/auth.service';

export const sessionGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService)
    .checkSession()
    .pipe(map((valid) => valid || router.createUrlTree(['/ingresar'])));
};
