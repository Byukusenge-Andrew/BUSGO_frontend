import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators'; // Import RxJS tap
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  // Skip interceptor for register/login endpoints
  if (req.url.includes('/auth/register') || req.url.includes('/auth/login')) {
    return next(req);
  }

  const corsToken = localStorage.getItem('corsToken') || '';
  let headers = req.headers.set('X-CORS-TOKEN', corsToken);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token') || '';
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const authReq = req.clone({
    headers: headers
  });

  return next(authReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const newCorsToken = event.headers.get('X-CORS-TOKEN') as string | null;
          if (newCorsToken && isPlatformBrowser(platformId)) {
            localStorage.setItem('corsToken', newCorsToken);
          }
        }
      },
      error: (error) => {
        console.error(error);
      }
    })
  );
};
