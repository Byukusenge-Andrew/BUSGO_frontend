import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users'; // Adjust base URL/port if needed

  constructor(private http: HttpClient) {}

  getUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  updateUser(userId: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, user);
  }

  // Add more methods as needed (login, createUser, etc.)

  getCurrentUser(): Observable<any> {
    // In a real app, this would get the current user from localStorage or a token
    // For now, return a mock user
    return of({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      lastLogin: new Date()
    });
  }

  getUserStats(): Observable<any> {
    // In a real app, this would fetch from the API
    return of({
      activeBookings: 2,
      totalBookings: 5,
      rewardsPoints: 150
    });
  }

  getRecentActivity(): Observable<any[]> {
    // In a real app, this would fetch from the API
    return of([
      {
        type: 'booking',
        description: 'Booked a bus from Kigali to Musanze',
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        type: 'cancellation',
        description: 'Cancelled booking from Huye to Rubavu',
        timestamp: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        type: 'profile',
        description: 'Updated profile information',
        timestamp: new Date(Date.now() - 259200000) // 3 days ago
      }
    ]);
  }
}
