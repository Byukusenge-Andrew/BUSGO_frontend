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
  company?: Company;
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
        try {
          const parsedUser = JSON.parse(storedUser);
          this.currentUserSubject.next(parsedUser); // Fixed: Pass parsed user
        } catch (e) {
          console.error('Error parsing stored user:', e);
          this.currentUserSubject.next(null); // Fixed: Pass null on error
        }
      } else {
        this.currentUserSubject.next(null); // Fixed: Initialize with null
      }
      if (storedRole) {
        this.userRole.next(storedRole); // Fixed: Pass stored role
      } else {
        this.userRole.next(null); // Fixed: Initialize with null
      }
    }
  }

  getCurrentUserId(): string | null {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      if ('companyId' in currentUser) {
        return currentUser.companyId;
      }
      return currentUser.id;
    }
    return null;
  }

  getCurrentUser(): User | Company | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.data); // Fixed: Pass response.data
          this.userRole.next(response.role); // Fixed: Pass response.role
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
          console.log('Company login response:', response);
          const companyData = response.company || response.data;
          if (!companyData) {
            console.error('No company data received');
            throw new Error('No company data received');
          }
          this.currentUserSubject.next(companyData); // Fixed: Pass companyData
          this.userRole.next(response.role); // Fixed: Pass response.role
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(companyData));
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  registerCompany(companyData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/companies`, companyData)
      .pipe(
        tap(response => {
          if (response && response.token) {
            const companyData = response.data || response.company;
            this.currentUserSubject.next(companyData); // Fixed: Pass response.data or company
            this.userRole.next(response.role); // Fixed: Pass response.role
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('currentUser', JSON.stringify(companyData));
              localStorage.setItem('userRole', response.role);
              localStorage.setItem('token', response.token);
            }
          }
        })
      );
  }

  adminLogin(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/admin/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Admin login response:', response);
          this.currentUserSubject.next(response.data); // Fixed: Pass response.data
          this.userRole.next(response.role); // Fixed: Pass response.role
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
          console.log('Signup response:', response);
          this.currentUserSubject.next(response.data); // Fixed: Pass response.data
          this.userRole.next(response.role); // Fixed: Pass response.role
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

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/request-password-reset`, { email })
      .pipe(
        tap(response => {
          console.log('Password reset request response:', response);
        })
      );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword })
      .pipe(
        tap(response => {
          console.log('Password reset response:', response);
        })
      );
  }
}
