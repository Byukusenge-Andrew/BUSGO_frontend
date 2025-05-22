import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Payment, PaymentStats, CreatePaymentDto, UpdatePaymentDto, PaymentStatus, PaymentMethod, UserPaymentMethod, UserPaymentRequest, UserPaymentResponse } from '../models/payment.model';

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
   * Convert backend payment to frontend Payment model
   */
  private convertPayment(payment: any): Payment {
    const bookingId = payment.booking?.bookingId || payment.booking?.id || payment.bookingId;
    return {
      paymentId: payment.paymentId || payment.id || 0,
      bookingId: bookingId || 0,
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
      amount: Number(payment.amount) || 0,
      paymentMethod: (payment.paymentMethod || 'CREDIT_CARD') as PaymentMethod,
      status: (payment.status || 'PENDING') as PaymentStatus,
      transactionId: payment.transactionId || '',
      paymentDetails: payment.paymentDetails || ''
    };
  }

  getAllPayments(filter?: { status?: PaymentStatus, method?: PaymentMethod }): Observable<Payment[]> {
    let params = new HttpParams();

    // Retrieve user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const companyId = user?.companyId;

    // Check if companyId exists
    if (!companyId) {
      this.handleError('No company ID found in localStorage', new Error('Missing companyId'));
      return of([]);
    }

    // Add filter parameters if provided
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.method) params = params.set('method', filter.method);
    }

    return this.http.get<any>(`${environment.apiUrl}/companies/${companyId}/payments`, { params })
      .pipe(
        map(response => {
          const payments = response.data || response;
          return Array.isArray(payments) ? payments.map(p => this.convertPayment(p)) : [];
        }),
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
        map(response => this.convertPayment(response.data || response)),
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
    return this.http.get<any>(`${this.apiUrl}/booking/${bookingId}`)
      .pipe(
        map(response => {
          const payments = response.data || response;
          return Array.isArray(payments) ? payments.map(p => this.convertPayment(p)) : [];
        }),
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
    return this.http.get<any>(`${this.apiUrl}/status/${status}`)
      .pipe(
        map(response => {
          const payments = response.data || response;
          return Array.isArray(payments) ? payments.map(p => this.convertPayment(p)) : [];
        }),
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
    return this.http.get<any>(`${this.apiUrl}/method/${method}`)
      .pipe(
        map(response => {
          const payments = response.data || response;
          return Array.isArray(payments) ? payments.map(p => this.convertPayment(p)) : [];
        }),
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
        map(response => this.convertPayment(response.data || response)),
        catchError(error => {
          this.handleError(`Failed to fetch payment with transaction ID ${transactionId}`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get payments by company
   */
  getPaymentsByCompany(companyId: number): Observable<Payment[]> {
    const companyPaymentsUrl = `${environment.apiUrl}/companies/${companyId}/payments`;
    return this.http.get<any>(companyPaymentsUrl)
      .pipe(
        map(response => {
          const payments = response.data || response;
          return Array.isArray(payments) ? payments.map(p => this.convertPayment(p)) : [];
        }),
        tap(payments => console.log(`Fetched ${payments.length} payments for company ${companyId}`)),
        catchError(error => {
          this.handleError(`Failed to fetch payments for company ${companyId}`, error);
          return of([]);
        })
      );
  }

  /**
   * Create a new payment
   */
  createPayment(paymentRequest: UserPaymentRequest): Observable<UserPaymentResponse> {
    const backendPayload = {
      booking: { bookingId: parseInt(paymentRequest.bookingId) }, // Match backend's expected structure
      amount: paymentRequest.amount,
      paymentMethod: this.mapPaymentMethodIdToEnum(paymentRequest.paymentMethodId),
      paymentDetails: 'From Angular Frontend',
      transactionId: 'temp_txn_' + Date.now(),
      status: 'PENDING' // Backend will override to COMPLETED
    };

    if (isNaN(backendPayload.booking.bookingId)) {
      const errorMsg = `Invalid Booking ID provided: '${paymentRequest.bookingId}'. Payment cannot be processed.`;
      console.error(errorMsg);
      this.snackBar.open(errorMsg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      return throwError(() => new Error(errorMsg));
    }

    return this.http.post<any>(this.apiUrl, backendPayload).pipe(
      map(response => {
        console.log('Backend response:', response);
        return this.mapToUserPaymentResponse(response);
      }),
      tap(response => {
        this.snackBar.open(`Payment ${response.status.toLowerCase()}. Amount: ${response.amount} ${response.currency}`, 'Close', { duration: 4000 });
      }),
      catchError(error => {
        console.error('Create payment error:', error);
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
        map(response => this.convertPayment(response.data || response)),
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
    return this.http.delete<any>(`${this.apiUrl}/${paymentId}`)
      .pipe(
        map(response => response.data || null),
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
  getPaymentStats(companyId?: string | null): Observable<PaymentStats> {
    let url = `${environment.apiUrl}/payment-stats`;
    const companyIdNumber = Number(companyId);
    if (companyId) {
      url = `${environment.apiUrl}/companies/${companyIdNumber}/payment-stats`;
    }

    return this.http.get<any>(url)
      .pipe(
        map(response => response.data || response),
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
   * Map backend response to UserPaymentResponse
   */
  private mapToUserPaymentResponse(response: any): UserPaymentResponse {
    // Handle different response formats
    let payment = response;
    if (response.data) {
      payment = response.data; // Wrapped response: { status, message, data }
    } else if (typeof response === 'string') {
      // Handle plain text response (e.g., "Payment created successfully.")
      console.warn('Received plain text response:', response);
      return {
        id: '0',
        status: 'PENDING',
        transactionId: 'unknown',
        timestamp: new Date(),
        amount: 0,
        currency: 'RWF'
      };
    }

    // Ensure payment object has required fields
    if (!payment || !payment.paymentId) {
      console.error('Invalid payment response:', payment);
      throw new Error('Invalid payment response from server');
    }

    return {
      id: payment.paymentId.toString(),
      status: payment.status || 'COMPLETED',
      transactionId: payment.transactionId || 'unknown',
      timestamp: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
      amount: Number(payment.amount) || 0,
      currency: payment.currency || 'RWF'
    };
  }

  /**
   * Map payment method ID to enum
   */
  private mapPaymentMethodIdToEnum(methodId: string): PaymentMethod {
    switch (methodId) {
      case '1': return 'CREDIT_CARD';
      case '2': return 'MOBILE_MONEY';
      case '3': return 'BANK_TRANSFER';
      case '4': return 'CASH';
      default: return 'CREDIT_CARD';
    }
  }

  /**
   * Handle API errors and display snackbar message
   */
  private handleError(message: string, error: any): void {
    console.error(`${message}:`, error);
    const userMessage = error.error?.message || error.message || 'Unknown error';
    this.snackBar.open(`${message}: ${userMessage}`, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Get company payments
   */
  getCompanyPayments(companyId: string | number): Observable<Payment[]> {
    const companyPaymentsUrl = `${environment.apiUrl}/companies/${companyId}/payments`;
    return this.http.get<any>(companyPaymentsUrl)
      .pipe(
        map(response => {
          const payments = response.data || response;
          return Array.isArray(payments) ? payments.map(p => this.convertPayment(p)) : [];
        }),
        tap(payments => console.log(`Fetched ${payments.length} payments for company ${companyId}`)),
        catchError(error => {
          this.handleError(`Failed to fetch payments for company ${companyId}`, error);
          return of([]);
        })
      );
  }
}
