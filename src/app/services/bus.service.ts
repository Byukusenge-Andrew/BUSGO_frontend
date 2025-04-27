import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Bus {
  id: string;
  registrationNumber: string;
  model: string;
  capacity: number;
  companyId: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  features: string[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private apiUrl = `${environment.apiUrl}/buses`; // Use environment.apiUrl for consistency

  constructor(private http: HttpClient) { }

  // Helper method to convert backend bus to frontend format
  private convertBus(bus: any): Bus {
    return {
      ...bus,
      id: bus.id.toString(),
      companyId: bus.companyId.toString(),
      createdAt: bus.createdAt ? new Date(bus.createdAt) : new Date()
    };
  }

  // Get all buses
  getAllBuses(): Observable<Bus[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(map(buses => buses.map(bus => this.convertBus(bus))));
  }

  // Get buses by company ID
  getCompanyBuses(companyId: string): Observable<Bus[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}`)
      .pipe(map(buses => buses.map(bus => this.convertBus(bus))));
  }

  // Get bus by ID
  getBusById(id: string): Observable<Bus> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(bus => this.convertBus(bus)));
  }

  // Add a new bus
  addBus(busData: Partial<Bus>): Observable<Bus> {
    return this.http.post<any>(this.apiUrl, busData)
      .pipe(map(bus => this.convertBus(bus)));
  }

  // Update a bus
  updateBus(id: string, busData: Partial<Bus>): Observable<Bus> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, busData)
      .pipe(map(bus => this.convertBus(bus)));
  }

  // Delete a bus
  deleteBus(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Update bus status
  updateBusStatus(id: string, status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'): Observable<Bus> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map(bus => this.convertBus(bus)));
  }
}
