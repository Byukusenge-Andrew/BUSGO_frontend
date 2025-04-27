import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  name: string;
  details: string;
  isDefault: boolean;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  timestamp: Date;
  amount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/methods`);
  }

  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process`, paymentRequest);
  }

  getPaymentHistory(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/history`);
  }
}
