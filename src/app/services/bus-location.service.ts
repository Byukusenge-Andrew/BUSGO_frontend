import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BusLocation {
  id: number;
  locationName: string;
  city: string;
  state: string;
  country: string;
  locationType: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusLocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  private convertLocation(location: any): BusLocation {
    return {
      id: location.locationId,
      locationName: location.locationName,
      city: location.city,
      state: location.state,
      country: location.country,
      locationType: location.locationType
    };
  }

  getAllLocations(): Observable<BusLocation[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(map(locations => locations.map(location => this.convertLocation(location))));
  }

  getLocationById(id: number): Observable<BusLocation> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(location => this.convertLocation(location)));
  }
}
