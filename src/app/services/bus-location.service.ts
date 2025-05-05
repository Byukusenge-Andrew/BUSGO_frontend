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
  location?: LocationAddress;

}

export interface LocationAddress {
  id?: number;
  street?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
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
      locationType: location.locationType,
      location: location.address ? {
        id: location.address.id,
        street: location.address.street,
        postalCode: location.address.postalCode,
        latitude: location.address.latitude,
        longitude: location.address.longitude
      } : undefined
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

  createLocation(location: BusLocation): Observable<BusLocation> {
    const backendLocation = {
      locationName: location.locationName,
      city: location.city,
      state: location.state,
      country: location.country,
      locationType: location.locationType,
      location: location.location ? {
        street: location.location.street,
        postalCode: location.location.postalCode,
        latitude: location.location.latitude,
        longitude: location.location.longitude
      } : null
    };
    return this.http.post<any>(this.apiUrl, backendLocation)
      .pipe(map(created => this.convertLocation(created)));
  }

  updateLocation(id: number, location: BusLocation): Observable<BusLocation> {
    const backendLocation = {
      locationName: location.locationName,
      city: location.city,
      state: location.state,
      country: location.country,
      locationType: location.locationType,
      location: location.location ? {
        street: location.location.street,
        postalCode: location.location.postalCode,
        latitude: location.location.latitude,
        longitude: location.location.longitude
      } : null
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendLocation)
      .pipe(map(updated => this.convertLocation(updated)));
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createOrUpdateLocationAddress(locationId: number, address: LocationAddress): Observable<LocationAddress> {
    return this.http.post<LocationAddress>(`${this.apiUrl}/${locationId}/address`, address);
  }
}
