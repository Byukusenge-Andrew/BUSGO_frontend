import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusBookingService {
  private apiUrl = `${environment.apiUrl}/bus-booking`;

  constructor(private http: HttpClient) {}

  searchBuses(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  getBusDetails(busId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/bus/${busId}`);
  }

  bookTicket(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, bookingData);
  }

  getBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-bookings`);
  }

  getActiveBookings(): Observable<any[]> {
    // In a real app, this would fetch from the API
    // For now, return mock data
    return of([
      {
        id: '1',
        route: {
          source: 'Kigali',
          destination: 'Musanze'
        },
        travelDate: new Date(Date.now() + 86400000), // Tomorrow
        travelTime: '08:00 AM',
        seats: 'A1, A2',
        status: 'CONFIRMED'
      },
      {
        id: '2',
        route: {
          source: 'Huye',
          destination: 'Rubavu'
        },
        travelDate: new Date(Date.now() + 172800000), // Day after tomorrow
        travelTime: '10:30 AM',
        seats: 'B3, B4',
        status: 'CONFIRMED'
      }
    ]);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${bookingId}`);
  }
}
