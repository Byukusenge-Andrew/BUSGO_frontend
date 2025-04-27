import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isUser) {
    return true;
  }

  if (authService.isAuthenticated) {
    // User is logged in but not as company
    snackBar.open('This section requires user access', 'Close', {
      duration: 5000
    });
    return router.parseUrl('/company/dashboard'); // Redirect to appropriate page
  }


  return router.parseUrl('/login');
};
