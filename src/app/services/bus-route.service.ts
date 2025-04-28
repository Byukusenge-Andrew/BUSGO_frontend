import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';

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
  routeId?: string;
  routeName?: string;
  routeCode?: string;
  description?: string;
  totalDistance?: number;
  estimatedDuration?: number;
  company?: {
    companyId?: string | number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = `${environment.apiUrl}/routes`;

  constructor(private http: HttpClient) {}

  private convertRoute(route: any): Route {
    return {
      ...route,
      id: route.routeId?.toString() || route.id?.toString(),
      origin: route.origin || route.routeName?.split(' - ')[0],
      destination: route.destination || route.routeName?.split(' - ')[1],
      distance: route.totalDistance || route.distance,
      duration: route.estimatedDuration || route.duration,
      basePrice: route.basePrice || 0,
      companyId: route.company?.companyId?.toString() || route.companyId,
      active: route.active !== undefined ? route.active : true,
      createdAt: route.createdAt ? new Date(route.createdAt) : new Date()
    };
  }

  private convertToBackendFormat(route: Partial<Route>): any {
    console.log('Converting to backend format, input:', JSON.stringify(route));

    const backendRoute: any = {
      routeName: route.routeName || (route.origin && route.destination ? `${route.origin} - ${route.destination}` : ''),
      routeCode: route.routeCode || `RT-${new Date().getTime().toString().slice(-6)}`,
      description: route.description || '',
      totalDistance: route.totalDistance || route.distance || 0,
      estimatedDuration: route.estimatedDuration || route.duration || 0,
      active: route.active !== undefined ? route.active : true,
      basePrice: route.basePrice || 0,
      origin: route.origin || '',
      destination: route.destination || ''
    };

    backendRoute.company = {};
    if (route.company?.companyId) {
      backendRoute.company.companyId = Number(route.company.companyId);
      console.log(`Setting company.companyId to ${backendRoute.company.companyId} from company.companyId`);
    } else if (route.companyId) {
      backendRoute.company.companyId = Number(route.companyId);
      console.log(`Setting company.companyId to ${backendRoute.company.companyId} from companyId`);
    } else {
      console.warn('No company ID found in the route data!', route);
      backendRoute.company.companyId = null;
    }

    if (route.id) {
      backendRoute.routeId = route.id;
    }

    console.log('Converted backend route:', JSON.stringify(backendRoute));
    return backendRoute;
  }

  createRoute(routeData: Partial<Route>): Observable<Route> {
    const backendRoute = this.convertToBackendFormat(routeData);
    console.log('Creating route with data:', JSON.stringify(backendRoute));

    return this.http.post<any>(this.apiUrl, backendRoute)
      .pipe(
        tap(response => console.log('Server response:', JSON.stringify(response))),
        map(route => this.convertRoute(route))
      );
  }

  // Other methods remain unchanged
  getAllRoutes(): Observable<Route[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(map(routes => routes.map(route => this.convertRoute(route))));
  }

  getCompanyRoutes(companyId: string | null): Observable<Route[]> {
    if (!companyId) {
      console.error('No company ID provided to getCompanyRoutes');
      return new Observable(observer => observer.error('Company ID is required'));
    }
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}`)
      .pipe(map(routes => routes.map(route => this.convertRoute(route))));
  }

  getRouteById(id: string): Observable<Route> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(route => this.convertRoute(route)));
  }

  searchRoutes(query: string): Observable<Route[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { name: query }
    }).pipe(map(routes => routes.map(route => this.convertRoute(route))));
  }

  searchBuses(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search-buses`, { params });
  }

  updateRoute(id: string, routeData: Partial<Route>): Observable<Route> {
    const backendRoute = this.convertToBackendFormat(routeData);
    console.log('Updating route with data:', JSON.stringify(backendRoute));
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendRoute)
      .pipe(map(route => this.convertRoute(route)));
  }

  deleteRoute(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleRouteStatus(id: string, active: boolean): Observable<Route> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { active })
      .pipe(map(route => this.convertRoute(route)));
  }

  getPopularRoutes(companyId: string): Observable<{route: Route, bookingCount: number}[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}/popular`)
      .pipe(map(data => data.map(item => ({
        route: this.convertRoute(item.route),
        bookingCount: item.bookingCount
      }))));
  }
}
