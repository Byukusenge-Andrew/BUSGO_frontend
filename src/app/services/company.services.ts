import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
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

  getCompanyById(companyId: string | number): Observable<Company> {
    if (!companyId) {
      return of({ companyId: '', name: 'Unknown' });
    }
    
    // First try to get from cache
    return this.getAllCompanies().pipe(
      map(companies => {
        const company = companies.find(c => c.companyId === companyId.toString());
        if (company) {
          return company;
        }
        // If not found in cache, fetch directly
        return { companyId: companyId.toString(), name: 'Unknown' };
      }),
      switchMap(company => {
        if (company.name !== 'Unknown') {
          return of(company);
        }
        // If not found in cache, fetch directly
        return this.http.get<any>(`${this.apiUrl}/${companyId}`).pipe(
          map(companyData => ({
            companyId: companyData.companyId?.toString() || companyData.id?.toString(),
            name: companyData.name || 'Unknown'
          })),
          catchError(() => {
            console.warn(`Company with ID ${companyId} not found`);
            return of({ companyId: companyId.toString(), name: 'Unknown' });
          })
        );
      })
    );
  }

  getCompanyName(companyId: string | number | undefined): Observable<string> {
    if (!companyId) {
      return of('Unknown Company');
    }
    
    return this.getCompanyById(companyId).pipe(
      map(company => company.name || 'Unknown Company')
    );
  }
}
