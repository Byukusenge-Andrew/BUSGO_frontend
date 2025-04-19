import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Company {
  companyId: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  licenseNumber: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  data: User | Company;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | Company | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private userRole = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRole.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      const storedRole = localStorage.getItem('userRole');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
      if (storedRole) {
        this.userRole.next(storedRole);
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.data);
          this.userRole.next(response.role);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  companyLogin(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/company/login`, { email, password })
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.data);
          this.userRole.next(response.role);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  adminLogin(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/auth/admin/login`, { email, password })
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.data);
          this.userRole.next(response.role);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  signup(data: SignupData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.data);
          this.userRole.next(response.role);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  logout() {
    this.currentUserSubject.next(null);
    this.userRole.next(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
    }
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUserRole(): string | null {
    return this.userRole.value;
  }

  get isCompany(): boolean {
    return this.userRole.value === 'COMPANY';
  }

  get isUser(): boolean {
    return this.userRole.value === 'USER';
  }

  get isAdmin(): boolean {
    return this.userRole.value === 'ADMIN';
  }
}
