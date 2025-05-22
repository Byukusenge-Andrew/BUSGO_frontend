import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model'; // Assuming a Booking model exists

@Injectable({
  providedIn: 'root'
})
export class CompanyReportService {
  private apiUrl = 'http://localhost:8080/api/reports'; // Define your backend API URL

  constructor(private http: HttpClient) { }

  /**
   * Fetches all bookings for a specific company.
   * @param companyId The ID of the company.
   * @returns An Observable array of Booking objects.
   */
  getBookingsByCompany(companyId: number): Observable<Booking[]> {
    // Assuming your backend endpoint is something like /api/reports/company/{companyId}/bookings
    return this.http.get<Booking[]>(`${this.apiUrl}/company/${companyId}/bookings`);
  }

  /**
   * Downloads a CSV report of all bookings for a specific company.
   * This method assumes the backend has an endpoint that generates and returns this CSV.
   * @param companyId The ID of the company.
   * @returns An Observable Blob representing the CSV file.
   */
  downloadCompanyBookingsCsvReport(companyId: number): Observable<Blob> {
    const reportUrl = `${this.apiUrl}/company/${companyId}/bookings-csv`;
    return this.http.get(reportUrl, {
      responseType: 'blob' // Important: tells HttpClient to expect binary data (file)
    });
  }

  downloadUsersAndCompaniesReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users-companies`, {
      responseType: 'blob'
    });
  }

  // This is the method the new component will try to use
  downloadSpecificCompanyReport(companyId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/company/${companyId}/report/csv`, { // Ensure this endpoint exists on backend
      responseType: 'blob'
    });
  }

  // Add other report-related methods here
}
