import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  basePrice: number;
  companyId: string;
  active: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = `${environment.apiUrl}/routes`;

  constructor(private http: HttpClient) {}

  // Helper method to convert backend route to frontend format
  private convertRoute(route: any): Route {
    return {
      ...route,
      id: route.id.toString(),
      companyId: route.companyId.toString(),
      createdAt: route.createdAt ? new Date(route.createdAt) : new Date()
    };
  }

  // Get all routes
  getAllRoutes(): Observable<Route[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(map(routes => routes.map(route => this.convertRoute(route))));
  }

  // Get routes by company ID
  getCompanyRoutes(companyId: string): Observable<Route[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}`)
      .pipe(map(routes => routes.map(route => this.convertRoute(route))));
  }

  // Get route by ID
  getRouteById(id: string): Observable<Route> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(route => this.convertRoute(route)));
  }

  // Search routes
  searchRoutes(query: string): Observable<Route[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(map(routes => routes.map(route => this.convertRoute(route))));
  }

  // Search buses by route parameters
  searchBuses(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search-buses`, { params });
  }

  // Create a new route
  createRoute(routeData: Partial<Route>): Observable<Route> {
    return this.http.post<any>(this.apiUrl, routeData)
      .pipe(map(route => this.convertRoute(route)));
  }

  // Update a route
  updateRoute(id: string, routeData: Partial<Route>): Observable<Route> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, routeData)
      .pipe(map(route => this.convertRoute(route)));
  }

  // Delete a route
  deleteRoute(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle route status (active/inactive)
  toggleRouteStatus(id: string, active: boolean): Observable<Route> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { active })
      .pipe(map(route => this.convertRoute(route)));
  }

  // Get popular routes for a company
  getPopularRoutes(companyId: string): Observable<{route: Route, bookingCount: number}[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}/popular`)
      .pipe(map(data => data.map(item => ({
        route: this.convertRoute(item.route),
        bookingCount: item.bookingCount
      }))));
  }

  getRoutes() {

  }
}
