import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusRouteService {
  private apiUrl = `${environment.apiUrl}/routes`;

  constructor(private http: HttpClient) {}

  getRoutes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRouteById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  searchRoutes(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  searchBuses(params: any): Observable<any[]> {
    // In a real app, this would fetch from the API
    // For now, return mock data
    return of([
      {
        id: '1',
        busName: 'Express Bus',
        from: params.from || 'Kigali',
        to: params.to || 'Musanze',
        departureTime: '08:00 AM',
        arrivalTime: '11:00 AM',
        duration: '3h',
        price: 5000,
        type: 'Luxury',
        availableSeats: 15
      },
      {
        id: '2',
        busName: 'Comfort Bus',
        from: params.from || 'Kigali',
        to: params.to || 'Musanze',
        departureTime: '10:30 AM',
        arrivalTime: '01:30 PM',
        duration: '3h',
        price: 4500,
        type: 'Standard',
        availableSeats: 8
      },
      {
        id: '3',
        busName: 'Premium Bus',
        from: params.from || 'Kigali',
        to: params.to || 'Musanze',
        departureTime: '02:00 PM',
        arrivalTime: '05:00 PM',
        duration: '3h',
        price: 6000,
        type: 'Premium',
        availableSeats: 12
      }
    ]);
  }
}
