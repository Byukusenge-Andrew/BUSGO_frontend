import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {inject} from '@angular/core';


export const ticketGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isUser) {
    return router.parseUrl('/login');
  }

  // if (!authService.isCompany) {
  //   return router.parseUrl('/company/login');
  // }

  return true;
};
