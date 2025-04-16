import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  let token = '';
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token') || '';
  }

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};
