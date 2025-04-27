import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Booking {
  id: string;
  busId: string;
  routeId: string;
  scheduleId: string;
  userId: string;
  customerName: string;
  routeName: string;
  date: Date;
  departureTime: string;
  arrivalTime: string;
  seats: number;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  // Helper method to convert backend booking to frontend format
  private convertBooking(booking: any): Booking {
    return {
      ...booking,
      id: booking.id.toString(),
      busId: booking.busId?.toString(),
      routeId: booking.routeId?.toString(),
      scheduleId: booking.scheduleId?.toString(),
      userId: booking.userId?.toString(),
      date: booking.date ? new Date(booking.date) : new Date(),
      createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date()
    };
  }

  // Get all bookings for a company
  getCompanyBookings(companyId: string): Observable<Booking[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}`)
      .pipe(map(bookings => bookings.map(booking => this.convertBooking(booking))));
  }

  // Get booking by ID
  getBookingById(id: string): Observable<Booking> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(booking => this.convertBooking(booking)));
  }

  // Get user's bookings
  getUserBookings(userId: string): Observable<Booking[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(bookings => bookings.map(booking => this.convertBooking(booking))));
  }

  // Get user's active bookings
  getActiveBookings(): Observable<Booking[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active`)
      .pipe(map(bookings => bookings.map(booking => this.convertBooking(booking))));
  }

  // Get all bookings for the current user
  getMyBookings(): Observable<Booking[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-bookings`)
      .pipe(map(bookings => bookings.map(booking => this.convertBooking(booking))));
  }

  // Search for available buses
  searchBuses(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }

  // Get bus details
  getBusDetails(busId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bus/${busId}`);
  }

  // Book a ticket
  bookTicket(bookingData: any): Observable<Booking> {
    return this.http.post<any>(`${this.apiUrl}/book`, bookingData)
      .pipe(map(booking => this.convertBooking(booking)));
  }

  // Cancel a booking
  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cancel/${bookingId}`);
  }

  // Update booking status
  updateBookingStatus(id: string, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'): Observable<Booking> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map(booking => this.convertBooking(booking)));
  }

  // Get today's bookings for a company
  getTodayBookings(companyId: string): Observable<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}/date/${today}`)
      .pipe(map(bookings => bookings.map(booking => this.convertBooking(booking))));
  }

  // Get booking statistics for a company
  getBookingStats(companyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/company/${companyId}/stats`);
  }
}
