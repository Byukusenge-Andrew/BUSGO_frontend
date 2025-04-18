import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private apiUrl = '/api/buses'; // Adjust this URL to match your backend endpoint

  constructor(private http: HttpClient) { }

  addBus(busData: any): Observable<any> {
    return this.http.post(this.apiUrl, busData);
  }
}
