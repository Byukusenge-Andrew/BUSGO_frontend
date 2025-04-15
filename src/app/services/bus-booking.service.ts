import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${bookingId}`);
  }
}
