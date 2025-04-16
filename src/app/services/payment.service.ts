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
    // In a real app, this would fetch from the API
    return of([
      {
        id: 'card_1',
        type: 'card',
        name: 'Visa ending in 4242',
        details: '**** **** **** 4242',
        isDefault: true
      },
      {
        id: 'momo_1',
        type: 'mobile_money',
        name: 'MTN Mobile Money',
        details: '+250 78 123 4567',
        isDefault: false
      },
      {
        id: 'bank_1',
        type: 'bank_transfer',
        name: 'Bank of Kigali',
        details: 'Account ending in 7890',
        isDefault: false
      }
    ]);
  }

  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    // In a real app, this would send to the API
    return of({
      id: 'pay_' + Math.random().toString(36).substring(2, 15),
      status: 'completed',
      transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
      timestamp: new Date(),
      amount: paymentRequest.amount,
      currency: paymentRequest.currency
    });
  }

  getPaymentHistory(): Observable<PaymentResponse[]> {
    // In a real app, this would fetch from the API
    return of([
      {
        id: 'pay_1',
        status: 'completed',
        transactionId: 'txn_1',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        amount: 15000,
        currency: 'RWF'
      },
      {
        id: 'pay_2',
        status: 'completed',
        transactionId: 'txn_2',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        amount: 10000,
        currency: 'RWF'
      }
    ]);
  }
}
