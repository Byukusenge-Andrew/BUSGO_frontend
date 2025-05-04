
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Payment, PaymentStats, CreatePaymentDto, UpdatePaymentDto, PaymentStatus, PaymentMethod, UserPaymentMethod, UserPaymentRequest, UserPaymentResponse } from '../models/payment.model';


// export interface PaymentMethod {
//   id: string;
//   type: 'card' | 'mobile_money' | 'bank_transfer';
//   name: string;
//   details: string;
//   isDefault: boolean;
// }


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Helper method to convert backend payment to frontend format
   */
  private convertPayment(payment: any): Payment {
    return {
      ...payment,
      paymentId: payment.paymentId,
      bookingId: payment.booking?.id || payment.bookingId,
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod as PaymentMethod,
      status: payment.status as PaymentStatus
    };
  }

  /**
   * Get all payments with optional filters
   */
  getAllPayments(filter?: { status?: PaymentStatus, method?: PaymentMethod }): Observable<Payment[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.status) {
        params = params.set('status', filter.status);
      }
      if (filter.method) {
        params = params.set('method', filter.method);
      }
    }

    return this.http.get<any[]>(`${this.apiUrl}`, { params })
      .pipe(
        map(payments => payments.map(payment => this.convertPayment(payment))),
        catchError(error => {
          this.handleError('Failed to fetch payments', error);
          return of([]);
        })
      );
  }

  /**
   * Get payment by ID
   */
  getPaymentById(paymentId: number): Observable<Payment> {
    return this.http.get<any>(`${this.apiUrl}/${paymentId}`)
      .pipe(
        map(payment => this.convertPayment(payment)),
        catchError(error => {
          this.handleError(`Failed to fetch payment with ID ${paymentId}`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get payments by booking ID
   */
  getPaymentsByBooking(bookingId: number): Observable<Payment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/booking/${bookingId}`)
      .pipe(
        map(payments => payments.map(payment => this.convertPayment(payment))),
        catchError(error => {
          this.handleError(`Failed to fetch payments for booking ${bookingId}`, error);
          return of([]);
        })
      );
  }

  /**
   * Get payments by status
   */
  getPaymentsByStatus(status: PaymentStatus): Observable<Payment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${status}`)
      .pipe(
        map(payments => payments.map(payment => this.convertPayment(payment))),
        catchError(error => {
          this.handleError(`Failed to fetch ${status} payments`, error);
          return of([]);
        })
      );
  }

  /**
   * Get payments by method
   */
  getPaymentsByMethod(method: PaymentMethod): Observable<Payment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/method/${method}`)
      .pipe(
        map(payments => payments.map(payment => this.convertPayment(payment))),
        catchError(error => {
          this.handleError(`Failed to fetch ${method} payments`, error);
          return of([]);
        })
      );
  }

  /**
   * Get payment by transaction ID
   */
  getPaymentByTransactionId(transactionId: string): Observable<Payment> {
    return this.http.get<any>(`${this.apiUrl}/transaction/${transactionId}`)
      .pipe(
        map(payment => this.convertPayment(payment)),
        catchError(error => {
          this.handleError(`Failed to fetch payment with transaction ID ${transactionId}`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get payments associated with a specific company.
   */
  getPaymentsByCompany(companyId: number): Observable<Payment[]> {
    const companyPaymentsUrl = `${environment.apiUrl}/companies/${companyId}/payments`;
    return this.http.get<any[]>(companyPaymentsUrl)
      .pipe(
        map(payments => payments.map(payment => this.convertPayment(payment))),
        tap(payments => console.log(`Fetched ${payments.length} payments for company ${companyId}`)),
        catchError(error => {
          this.handleError(`Failed to fetch payments for company ${companyId}`, error);
          return of([]); // Return empty array on error to avoid breaking the component
        })
      );
  }

  /**
   * Create a new payment
   */
  createPayment(paymentRequest: UserPaymentRequest): Observable<UserPaymentResponse> {
    const backendPayload = {
      booking: {
        bookingId: parseInt(paymentRequest.bookingId)
      },
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      paymentMethod: this.mapPaymentMethodIdToEnum(paymentRequest.paymentMethodId),
      paymentDetails: 'From Angular Frontend',
      transactionId: 'temp_txn_' + Date.now(),
      status: 'PENDING', // Add default status
      paymentDate: new Date().toISOString() // Add current timestamp
    };

    // Validate bookingId
    if (isNaN(backendPayload.booking.bookingId)) {
      const errorMsg = `Invalid Booking ID provided: '${paymentRequest.bookingId}'. Payment cannot be processed.`;
      console.error(errorMsg);
      this.snackBar.open(errorMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      return throwError(() => new Error(errorMsg));
    }

    return this.http.post<any>(this.apiUrl, backendPayload).pipe(
      map(backendResponse => this.mapToUserPaymentResponse(backendResponse)),
      tap(response => {
        this.snackBar.open(`Payment ${response.status.toLowerCase()}. Amount: ${response.amount} ${response.currency}`, 'Close', { duration: 4000 });
      }),
      catchError(error => {
        this.handleError('Failed to process payment', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Update a payment
   */
  updatePayment(paymentId: number, paymentData: UpdatePaymentDto): Observable<Payment> {
    return this.http.put<any>(`${this.apiUrl}/${paymentId}`, paymentData)
      .pipe(
        map(payment => this.convertPayment(payment)),
        tap(payment => {
          this.snackBar.open(`Payment updated successfully`, 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError('Failed to update payment', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete a payment
   */
  deletePayment(paymentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${paymentId}`)
      .pipe(
        tap(() => {
          this.snackBar.open('Payment deleted successfully', 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError('Failed to delete payment', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get payment statistics
   */
  getPaymentStats(companyId?: number): Observable<PaymentStats> {
    let url = `${environment.apiUrl}/payment-stats`;
    if (companyId) {
      url = `${environment.apiUrl}/companies/${companyId}/payment-stats`;
    }

    return this.http.get<PaymentStats>(url)
      .pipe(
        catchError(error => {
          this.handleError('Failed to fetch payment statistics', error);
          return of({
            totalPayments: 0,
            totalAmount: 0,
            completedPayments: 0,
            pendingPayments: 0,
            failedPayments: 0,
            refundedPayments: 0,
            paymentsByMethod: {}
          });
        })
      );
  }

  /**
   * Helper method to map backend response to UserPaymentResponse
   */
  private mapToUserPaymentResponse(backendResponse: any): UserPaymentResponse {
    const payment = backendResponse as Payment;
    return {
      id: payment.paymentId.toString(),
      status: payment.status,
      transactionId: payment.transactionId,
      timestamp: new Date(payment.paymentDate),
      amount: payment.amount,
      currency: 'RWF'
    };
  }

  /**
   * Map payment method ID to enum
   */
  private mapPaymentMethodIdToEnum(methodId: string): PaymentMethod {
    if (methodId === '1') return 'CREDIT_CARD';
    if (methodId === '2') return 'MOBILE_MONEY';
    if (methodId === '3') return 'BANK_TRANSFER';
    return 'CREDIT_CARD';
  }

  /**
   * Handle API errors and display snackbar message
   */
  private handleError(message: string, error: any): void {
    console.error(error);
    const userMessage = error.error?.message || error.message || 'Unknown error';
    this.snackBar.open(`${message}: ${userMessage}`, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Get payments associated with a specific company.
   */
  getCompanyPayments(companyId: string | number): Observable<Payment[]> {
    const companyPaymentsUrl = `${environment.apiUrl}/companies/${companyId}/payments`;
    return this.http.get<any[]>(companyPaymentsUrl)
      .pipe(
        map(payments => payments.map(payment => this.convertPayment(payment))),
        tap(payments => console.log(`Fetched ${payments.length} payments for company ${companyId}`)),
        catchError(error => {
          this.handleError(`Failed to fetch payments for company ${companyId}`, error);
          return of([]); // Return empty array on error to avoid breaking the component
        })
      );
  }
}
