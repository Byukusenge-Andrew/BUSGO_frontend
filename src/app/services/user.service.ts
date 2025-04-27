import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BusBooking } from '../types/auth.types';
import { environment } from '../../environments/environment';

interface Stats {
  activeBookings: number;
  totalBookings: number;
  rewardsPoints: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: string;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  password?: string | undefined;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // Backend UserController base URL

  constructor(private http: HttpClient) {}

  // Helper method to convert backend user to frontend format
  private convertUser(user: any): User {
    return {
      ...user,
      id: user.id.toString(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
    };
  }

  // Get a user by ID
  getUser(userId: string): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`)
      .pipe(map(user => this.convertUser(user)));
  }

  // Update a user by ID
  updateUser(userId: string, user: Partial<User>): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, user)
      .pipe(map(updatedUser => this.convertUser(updatedUser)));
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}`)
      .pipe(map(users => users.map(user => this.convertUser(user))));
  }

  // Get users by role
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-role`, { params: { role } })
      .pipe(map(users => users.map(user => this.convertUser(user))));
  }

  // Get active users
  getActiveUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active`)
      .pipe(map(users => users.map(user => this.convertUser(user))));
  }

  // Login user
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  // Create new user
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}`, user)
      .pipe(map(createdUser => this.convertUser(createdUser)));
  }

  // Delete user by ID
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  // Get current user from backend or localStorage
  getCurrentUser(): Observable<User> {
    // Try to get the current user from the backend
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(user => this.convertUser(user)),
      catchError(error => {
        // If the backend endpoint fails or doesn't exist, fall back to localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          return of({
            id: parsedUser.id.toString(),
            username: parsedUser.username,
            email: parsedUser.email,
            role: parsedUser.role || 'USER',
            active: true,
            lastLogin: new Date(),
            createdAt: new Date()
          });
        }
        throw error; // If no user in localStorage, propagate the error
      })
    );
  }

  // Get user statistics
  getUserStats(userId: string): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/${userId}/stats`).pipe(
      catchError(error => {
        console.error(error);
        return of({ activeBookings: 0, totalBookings: 0, rewardsPoints: 0 });
      })
    );
  }

  // Get user's recent activity
  getRecentActivity(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/activity`).pipe(
      map(activities => activities.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))),
      catchError(error => {
        console.error(error);
        return of([]);
      })
    );
  }
}
