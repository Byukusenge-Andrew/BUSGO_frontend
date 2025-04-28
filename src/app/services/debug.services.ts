import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private apiUrl = `${environment.apiUrl}/debug`;

  constructor(private http: HttpClient) {}

  /**
   * Debug route creation by sending the same payload to a debug endpoint
   * This helps diagnose issues with the request/response cycle
   */
  debugRouteCreation(routeData: any): Observable<any> {
    console.log('Debug route creation with data:', JSON.stringify(routeData));

    return this.http.post<any>(`${this.apiUrl}/routes`, routeData)
      .pipe(
        tap(
          response => console.log('Debug response:', JSON.stringify(response)),
          error => console.error('Debug error:', error)
        )
      );
  }
}
