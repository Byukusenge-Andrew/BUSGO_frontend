import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserService, User as ServiceUser, User } from './user.service';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company, CompanyStats } from '../models/company.model';

// Admin component's User interface
export interface AdminUser {
  id: number | string;
  username: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: string;
  status: string;
  active: boolean;
  lastLogin: Date;
  createdAt: Date;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    [key: string]: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Convert ServiceUser to AdminUser format
   */
  private convertToAdminUser(user: ServiceUser): AdminUser {
    return {
      id: user.id,
      username: user.username,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.active ? 'Active' : 'Inactive',
      active: user.active,
      lastLogin: user.lastLogin || new Date(),
      createdAt: user.createdAt
    };
  }

  /**
   * Get all users with additional admin information
   */
  getAllUsers(): Observable<AdminUser[]> {
    return this.userService.getAllUsers().pipe(
      map(users => users.map(user => this.convertToAdminUser(user))),
      catchError(error => {
        this.handleError('Failed to fetch users', error);
        return of([]);
      })
    );
  }

  /**
   * Get user statistics for admin dashboard
   */
  getUserStats(): Observable<AdminUserStats> {
    return this.http.get<AdminUserStats>(`${this.apiUrl}/user-stats`).pipe(
      catchError(error => {
        this.handleError('Failed to fetch user statistics', error);
        return of({
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          usersByRole: {}
        });
      })
    );
  }

  /**
   * Create a new user (admin operation)
   */
  createUser(userData: Partial<AdminUser>): Observable<User> {
    // Convert AdminUser partial to ServiceUser partial
    const serviceUser: Partial<User> = {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      active: userData.active,
      createdAt: new Date() // Ensure createdAt is set for new users
    };

    // Only add id if it's a string (User.id must be string)
    if (userData.id !== undefined && typeof userData.id === 'string') {
      serviceUser.id = userData.id;
    }

    return this.userService.createUser(serviceUser).pipe(
      map(user => user), // Return the User directly
      tap(user => {
        this.snackBar.open(`User ${user.username} created successfully`, 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError('Failed to create user', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handle API errors and display snackbar message
   */
  private handleError(message: string, error: any): void {
    console.error();
    this.snackBar.open(`${message}: ${error.message || 'Unknown error'}`, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Update a user (admin operation)
   */
  updateUser(userId: string | number, userData: Partial<AdminUser>): Observable<AdminUser> {
    // Convert AdminUser to ServiceUser format
    const serviceUser: Partial<ServiceUser> = {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      active: userData.active
    };

    return this.userService.updateUser(userId.toString(), serviceUser).pipe(
      map(updatedUser => this.convertToAdminUser(updatedUser)),
      tap(updatedUser => {
        this.snackBar.open(`User ${updatedUser.username} updated successfully`, 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError('Failed to update user', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a user (admin operation)
   */
  deleteUser(userId: string | number): Observable<void> {
    return this.userService.deleteUser(userId.toString()).pipe(
      tap(() => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError('Failed to delete user', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change user status (activate/deactivate)
   */
  changeUserStatus(userId: string | number, active: boolean): Observable<AdminUser> {
    return this.userService.updateUser(userId.toString(), { active }).pipe(
      map(user => this.convertToAdminUser(user)),
      tap(user => {
        const status = active ? 'activated' : 'deactivated';
        this.snackBar.open(`User ${user.username} ${status} successfully`, 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError(`Failed to ${active ? 'activate' : 'deactivate'} user`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change user role
   */
  changeUserRole(userId: string | number, role: string): Observable<AdminUser> {
    return this.userService.updateUser(userId.toString(), { role }).pipe(
      map(user => this.convertToAdminUser(user)),
      tap(user => {
        this.snackBar.open(`User ${user.username} role changed to ${role} successfully`, 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError('Failed to change user role', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user activity logs (admin only)
   */
  getUserActivityLogs(userId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/logs`).pipe(
      map(logs => logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }))),
      catchError(error => {
        this.handleError('Failed to fetch user activity logs', error);
        return of([]);
      })
    );
  }

  /**
   * Get all companies
   */
  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${environment.apiUrl}/companies`).pipe(
      map(companies => companies.map(company => ({
        ...company,
        registrationDate: new Date(company.registrationDate)
      }))),
      catchError(error => {
        this.handleError('Failed to fetch companies', error);
        return of([]);
      })
    );
  }

  /**
   * Get company statistics for admin dashboard
   */
  getCompanyStats(): Observable<CompanyStats> {
    return this.http.get<CompanyStats>(`${environment.apiUrl}/company-stats`).pipe(
      catchError(error => {
        this.handleError('Failed to fetch company statistics', error);
        return of({
          totalCompanies: 0,
          activeCompanies: 0,
          pendingCompanies: 0,
          suspendedCompanies: 0,
          totalBuses: 0,
          totalRoutes: 0
        });
      })
    );
  }

  /**
   * Get company by ID
   */
  getCompanyById(companyId: number): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/companies/${companyId}`).pipe(
      map(company => ({
        ...company,
        registrationDate: new Date(company.registrationDate)
      })),
      catchError(error => {
        this.handleError(`Failed to fetch company with ID ${companyId}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new company
   */
  createCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(`${environment.apiUrl}/companies`, company).pipe(
      map(createdCompany => ({
        ...createdCompany,
        registrationDate: new Date(createdCompany.registrationDate)
      })),
      tap(createdCompany => {
        this.snackBar.open(`Company ${createdCompany.companyName} created successfully`, 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError('Failed to create company', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update a company
   */
  updateCompany(companyId: number, companyData: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/companies/${companyId}`, companyData).pipe(
      map(updatedCompany => ({
        ...updatedCompany,
        registrationDate: new Date(updatedCompany.registrationDate)
      })),
      tap(updatedCompany => {
        this.snackBar.open(`Company ${updatedCompany.companyName} updated successfully`, 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError('Failed to update company', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a company
   */
  deleteCompany(companyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/companies/${companyId}`).pipe(
      tap(() => {
        this.snackBar.open('Company deleted successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError('Failed to delete company', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change company status
   */
  changeCompanyStatus(companyId: number, active: boolean): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/companies/${companyId}/status`, { active }).pipe(
      map(company => ({
        ...company,
        registrationDate: new Date(company.registrationDate)
      })),
      tap(company => {
        const status = active ? 'activated' : 'deactivated';
        this.snackBar.open(`Company ${company.companyName} ${status} successfully`, 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.handleError(`Failed to ${active ? 'activate' : 'deactivate'} company`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get company buses
   */
  getCompanyBuses(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies/${companyId}/buses`).pipe(
      catchError(error => {
        this.handleError('Failed to fetch company buses', error);
        return of([]);
      })
    );
  }

  /**
   * Get company routes
   */
  getCompanyRoutes(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies/${companyId}/routes`).pipe(
      catchError(error => {
        this.handleError('Failed to fetch company routes', error);
        return of([]);
      })
    );
  }
}
