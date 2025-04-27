import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

export const companyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isCompany) {
    return true;
  }

  if (authService.isAuthenticated) {
    // User is logged in but not as company
    snackBar.open('This section requires company access', 'Close', {
      duration: 5000
    });
    return router.parseUrl('/dashboard'); // Redirect to appropriate page
  }

  // User is not logged in at all
  return router.parseUrl('/company/login');
};
