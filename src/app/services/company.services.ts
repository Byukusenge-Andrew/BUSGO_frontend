import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Company {
  companyId: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/companies`;
  private companiesCache: Observable<Company[]> | null = null;

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<Company[]> {
    if (!this.companiesCache) {
      this.companiesCache = this.http.get<any[]>(this.apiUrl).pipe(
        map((companies) =>
          companies.map((company) => ({
            companyId: company.companyId?.toString() || company.id?.toString(),
            name: company.name || 'Unknown',
          }))
        ),
        catchError((error) => {
          console.error('Error fetching companies:', error);
          return throwError(() => new Error('Failed to fetch companies'));
        }),
        shareReplay(1) // Cache the result
      );
    }
    return this.companiesCache;
  }


  // getCompanyById(companyId: string): Observable<Company> {
  //
  // }
}
