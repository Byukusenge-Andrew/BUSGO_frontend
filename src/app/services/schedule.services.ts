import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BusLocation } from './bus-location.service';

export interface Schedule {
  id: number;
  routeName: string;
  departureTime: Date;
  arrivalTime: Date;
  busNumber: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  status: string;
  busType: string;
  companyId: number;
  companyName: string;
  routeId: number;
  sourceLocation: BusLocation;
  destinationLocation: BusLocation;
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private convertSchedule(schedule: any): Schedule {
    console.log('Raw schedule response:', JSON.stringify(schedule, null, 2));
    console.log('Company object:', schedule.company);
    console.log('Company name:', schedule.company?.companyName);

    return {
      id: schedule.scheduleId,
      routeName: schedule.route?.routeName || '',
      departureTime: new Date(schedule.departureTime),
      arrivalTime: new Date(schedule.arrivalTime),
      busNumber: schedule.busNumber,
      availableSeats: schedule.availableSeats,
      totalSeats: schedule.totalSeats,
      price: schedule.fare,
      status: schedule.active ? 'SCHEDULED' : 'CANCELLED',
      busType: schedule.busType || '',
      companyId: schedule.company?.companyId ?? 0,
      companyName: schedule.company?.companyName ?? 'Unknown', // Use nullish coalescing for safety
      routeId: schedule.route?.routeId,
      sourceLocation: {
        id: schedule.sourceLocation?.locationId,
        locationName: schedule.sourceLocation?.locationName,
        city: schedule.sourceLocation?.city,
        state: schedule.sourceLocation?.state,
        country: schedule.sourceLocation?.country,
        locationType: schedule.sourceLocation?.locationType,
      },
      destinationLocation: {
        id: schedule.destinationLocation?.locationId,
        locationName: schedule.destinationLocation?.locationName,
        city: schedule.destinationLocation?.city,
        state: schedule.destinationLocation?.state,
        country: schedule.destinationLocation?.country,
        locationType: schedule.destinationLocation?.locationType,
      },
    };
  }

  private convertToBackendFormat(schedule: Partial<Schedule>): any {
    return {
      scheduleId: schedule.id,
      company: schedule.companyId ? { companyId: schedule.companyId } : null,
      route: schedule.routeId ? { routeId: schedule.routeId } : null,
      sourceLocation: schedule.sourceLocation?.id ? { locationId: schedule.sourceLocation.id } : null,
      destinationLocation: schedule.destinationLocation?.id ? { locationId: schedule.destinationLocation.id } : null,
      departureTime: schedule.departureTime ? this.formatDate(schedule.departureTime) : null,
      arrivalTime: schedule.arrivalTime ? this.formatDate(schedule.arrivalTime) : null,
      fare: schedule.price,
      busType: schedule.busType,
      totalSeats: schedule.totalSeats,
      availableSeats: schedule.availableSeats,
      busNumber: schedule.busNumber,
      active: schedule.status === 'SCHEDULED',
    };
  }

  getAllSchedules(): Observable<Schedule[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((schedules) => {
        console.log('Schedules received:', schedules.length);
        return schedules.map((schedule) => this.convertSchedule(schedule));
      })
    );
  }

  getScheduleById(id: number): Observable<Schedule> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((schedule) => this.convertSchedule(schedule))
    );
  }

  createSchedule(schedule: Partial<Schedule>): Observable<Schedule> {
    const backendSchedule = this.convertToBackendFormat(schedule);
    console.log('Backend schedule:', JSON.stringify(backendSchedule));
    return this.http.post<any>(this.apiUrl, backendSchedule).pipe(
      map((schedule) => this.convertSchedule(schedule))
    );
  }

  updateSchedule(id: number, schedule: Partial<Schedule>): Observable<Schedule> {
    const backendSchedule = this.convertToBackendFormat(schedule);
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendSchedule).pipe(
      map((schedule) => this.convertSchedule(schedule))
    );
  }

  getCompanySchedule(companyId: string): Observable<Schedule[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}`).pipe(
      map((schedules) => schedules.map((schedule) => this.convertSchedule(schedule)))
    );
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchSchedules(sourceId: number, destId: number, departureDate: string): Observable<Schedule[]> {
    const params = new HttpParams()
      .set('sourceId', sourceId.toString())
      .set('destId', destId.toString())
      .set('departureDate', departureDate);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params }).pipe(
      map((schedules) => schedules.map((schedule) => this.convertSchedule(schedule)))
    );
  }

  searchSchedulesByCity(sourceCity: string, destCity: string, departureDate: string): Observable<Schedule[]> {
    const params = new HttpParams()
      .set('sourceCity', sourceCity)
      .set('destCity', destCity)
      .set('departureDate', departureDate);
    return this.http.get<any[]>(`${this.apiUrl}/search-by-city`, { params }).pipe(
      map((schedules) => schedules.map((schedule) => this.convertSchedule(schedule)))
    );
  }
}
