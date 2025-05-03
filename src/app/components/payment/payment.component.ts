import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentMethod, UserPaymentMethod, UserPaymentRequest, UserPaymentResponse } from '../../models/payment.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/bus-booking.service';
import { Booking } from '../../models/booking.model';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-user-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="payment-container">
      <mat-card class="payment-card">
        <mat-card-header>
          <mat-card-title>Complete Your Payment</mat-card-title>
          <mat-card-subtitle>Secure payment for your booking</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Booking Summary -->
          <div class="booking-summary">
            <h3>Booking Summary</h3>
            <div class="summary-content">
              <div *ngIf="loadingBooking" class="loading-indicator">
                <mat-spinner diameter="30"></mat-spinner>
                <span>Loading booking details...</span>
              </div>

              <div *ngIf="error" class="error-message">
                <mat-icon>error</mat-icon>
                <span>{{ error }}</span>
              </div>

              <div *ngIf="!loadingBooking && !error">
                <div class="summary-item">
                  <span class="label">Booking ID:</span>
                  <span class="value">{{ bookingId }}</span>
                </div>
                <div class="summary-item" *ngIf="bookingDetails">
                  <span class="label">Trip:</span>
                  <span class="value">{{ bookingDetails.routeName }}</span>
                </div>
                <div class="summary-item" *ngIf="bookingDetails">
                  <span class="label">Date:</span>
                  <span class="value">{{ bookingDetails.date | date:'medium' }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Amount:</span>
                  <span class="value">{{ amount | currency:currency }}</span>
                </div>
              </div>
            </div>
          </div>

          <mat-divider class="section-divider"></mat-divider>

          <!-- Payment Form -->
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" *ngIf="!isPaymentComplete">
            <div class="form-section">
              <h3>Select Payment Method</h3>

              <div class="payment-methods" *ngIf="paymentMethods.length > 0">
                <mat-radio-group formControlName="paymentMethodId" class="payment-method-list">
                  <mat-radio-button *ngFor="let method of paymentMethods" [value]="method.id" class="payment-method-item">
                    <div class="payment-method-content">
                      <mat-icon class="payment-icon" [ngClass]="method.type.toLowerCase()">
                        {{ getPaymentIcon(method.type) }}
                      </mat-icon>
                      <div class="payment-method-details">
                        <div class="payment-method-name">{{ method.name }}</div>
                        <div class="payment-method-info">{{ method.details }}</div>
                      </div>
                    </div>
                  </mat-radio-button>
                </mat-radio-group>
              </div>

              <div class="no-payment-methods" *ngIf="paymentMethods.length === 0">
                <p>No payment methods available. Please add a payment method.</p>
                <button mat-button color="primary" type="button" (click)="addPaymentMethod()">Add Payment Method</button>
              </div>
            </div>

            <!-- Payment Terms -->
            <div class="payment-terms">
              <p>
                By proceeding with the payment, you agree to our
                <a href="/terms" target="_blank">Terms and Conditions</a> and
                <a href="/privacy" target="_blank">Privacy Policy</a>.
              </p>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="!paymentForm.valid || processing">
                <mat-spinner diameter="20" *ngIf="processing"></mat-spinner>
                <span *ngIf="!processing">Pay {{ amount | currency:currency }}</span>
              </button>
            </div>
          </form>

          <!-- Payment Success -->
          <div class="payment-success" *ngIf="isPaymentComplete">
            <mat-icon class="success-icon">check_circle</mat-icon>
            <h2>Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>

            <div class="transaction-details">
              <div class="detail-item">
                <span class="label">Transaction ID:</span>
                <span class="value">{{ paymentResponse?.transactionId }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Amount:</span>
<!--                <span class="value">{{ paymentResponse?.amount | currency:paymentResponse?.currency }}</span>-->
              </div>
              <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value">{{ paymentResponse?.timestamp | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status-badge">{{ paymentResponse?.status }}</span>
              </div>
            </div>

            <div class="receipt-info">
              <p>A receipt has been sent to your email address.</p>
            </div>

            <div class="success-actions">
              <button mat-stroked-button (click)="viewReceipt()">View Receipt</button>
              <button mat-raised-button color="primary" (click)="onComplete()">Continue</button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .payment-card {
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      margin-bottom: 1.5rem;
    }

    mat-card-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    mat-card-subtitle {
      color: #666;
    }

    .booking-summary {
      background-color: #f8f9fa;
      padding: 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .booking-summary h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: #333;
      font-weight: 500;
    }

    .summary-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      font-weight: 600;
      color: #333;
    }

    .section-divider {
      margin: 1.5rem 0;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .form-section h3 {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: #333;
      font-weight: 500;
    }

    .payment-method-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .payment-method-item {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .payment-method-content {
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
    }

    .payment-icon {
      margin-right: 1rem;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .payment-icon.credit_card, .payment-icon.debit_card {
      color: #1976d2;
    }

    .payment-icon.mobile_money {
      color: #388e3c;
    }

    .payment-icon.bank_transfer {
      color: #7b1fa2;
    }

    .payment-icon.cash {
      color: #f57c00;
    }

    .payment-icon.upi {
      color: #d81b60;
    }

    .payment-method-details {
      display: flex;
      flex-direction: column;
    }

    .payment-method-name {
      font-weight: 500;
      color: #333;
    }

    .payment-method-info {
      font-size: 0.85rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .no-payment-methods {
      text-align: center;
      padding: 1.5rem;
      background-color: #f9f9f9;
      border-radius: 8px;
    }

    .payment-terms {
      font-size: 0.85rem;
      color: #666;
      margin: 1.5rem 0;
      padding: 0.75rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .payment-terms a {
      color: #1976d2;
      text-decoration: none;
    }

    .payment-terms a:hover {
      text-decoration: underline;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .payment-success {
      text-align: center;
      padding: 2rem 0;
    }

    .success-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      color: #4caf50;
      margin-bottom: 1rem;
    }

    .transaction-details {
      background-color: #f8f9fa;
      padding: 1.25rem;
      border-radius: 8px;
      margin: 1.5rem 0;
      text-align: left;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .status-badge {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .receipt-info {
      margin: 1.5rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .success-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 600px) {
      .payment-container {
        padding: 0 0.5rem;
        margin: 1rem auto;
      }

      .payment-card {
        padding: 1rem;
      }

      .success-actions {
        flex-direction: column;
        gap: 0.75rem;
      }

      .success-actions button {
        width: 100%;
      }
    }
  `]
})
export class UserPaymentComponent implements OnInit, OnDestroy {
  bookingId: string = '';
  bookingDetails: Booking | null = null;
  amount: number = 0;
  currency: string = 'RWF';

  @Output() paymentComplete = new EventEmitter<UserPaymentResponse>();
  @Output() paymentCancelled = new EventEmitter<void>();

  paymentForm: FormGroup;
  paymentMethods: UserPaymentMethod[] = [];
  processing: boolean = false;
  isPaymentComplete: boolean = false;
  paymentResponse: UserPaymentResponse | null = null;
  loadingBooking: boolean = true;
  error: string | null = null;

  private routeSub: Subscription | null = null;
  private paymentSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      paymentMethodId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bookingId = id;
        this.loadBookingDetails();
      } else {
        console.error('No booking ID found in route parameters.');
        this.error = 'Booking information is missing. Cannot proceed with payment.';
        this.loadingBooking = false;
      }
    });
    this.loadPaymentMethods();
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.paymentSub) {
      this.paymentSub.unsubscribe();
    }
  }

  loadBookingDetails(): void {
    this.loadingBooking = true;
    this.error = null;
    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (booking) => {
        this.bookingDetails = booking;
        this.amount = booking.amount || 0;
        this.currency =  'RWF';

        if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
          this.error = `This booking (Status: ${booking.status}) does not require payment or cannot be paid for.`;
        }
        this.loadingBooking = false;
      },
      error: (err) => {
        console.error('Error loading booking details:', err);
        this.error = 'Failed to load booking details. Please try again later.';
        this.loadingBooking = false;
      }
    });
  }

  loadPaymentMethods(): void {
    // Mock payment methods for demonstration
    // In a real application, this would come from the PaymentService
    this.paymentMethods = [
      {
        id: '1',
        type: 'CREDIT_CARD',
        name: 'Visa Card',
        details: '**** **** **** 4242',
        isDefault: true
      },
      {
        id: '2',
        type: 'MOBILE_MONEY',
        name: 'MTN Mobile Money',
        details: '+250 78 123 4567',
        isDefault: false
      },
      {
        id: '3',
        type: 'BANK_TRANSFER',
        name: 'Bank of Kigali',
        details: 'Account ending in 5678',
        isDefault: false
      },
      {
        id: '4',
        type: 'CASH',
        name: 'Cash Payment',
        details: 'Pay at pickup',
        isDefault: false
      }
    ];

    // Set default payment method if available
    const defaultMethod = this.paymentMethods.find(m => m.isDefault);
    if (defaultMethod) {
      this.paymentForm.patchValue({ paymentMethodId: defaultMethod.id });
    }
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || !this.bookingDetails) {
      this.snackBar.open('Please select a payment method and ensure booking details are loaded.', 'Close', { duration: 3000 });
      return;
    }

    if (this.processing || this.isPaymentComplete) {
      return;
    }

    this.processing = true;
    this.error = null;

    const paymentRequest: UserPaymentRequest = {
      bookingId: this.bookingId,
      amount: this.bookingDetails?.totalAmount || this.amount,
      currency: this.currency || 'RWF',
      paymentMethodId: this.paymentForm.value.paymentMethodId
    };

    this.paymentSub = this.paymentService.createPayment(paymentRequest).subscribe({
      next: (response) => {
        this.processing = false;
        this.paymentResponse = response;
        this.isPaymentComplete = true;
        this.paymentComplete.emit(response);
        this.snackBar.open('Payment Successful!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.processing = false;
        this.error = 'Payment failed. Please check the details or try again.';
        console.error('Payment Component Error:', error);
        this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.paymentCancelled.emit();
    this.router.navigate(['/my-bookings']);
  }

  onComplete(): void {
    if (this.paymentResponse) {
      this.paymentComplete.emit(this.paymentResponse);
    }
    this.router.navigate(['/booking-confirmation', this.bookingId]);
  }

  addPaymentMethod(): void {
    // This would open a dialog or navigate to a page to add a payment method
    this.snackBar.open('Add payment method functionality will be implemented soon.', 'Close', { duration: 3000 });
  }

  viewReceipt(): void {
    if (this.isPaymentComplete && this.bookingId) {
      this.router.navigate(['/booking-confirmation', this.bookingId]);
    } else {
      this.snackBar.open('Payment must be complete to view receipt.', 'Close', { duration: 3000 });
    }
  }

  getPaymentIcon(type: string): string {
    switch (type) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return 'credit_card';
      case 'MOBILE_MONEY':
        return 'smartphone';
      case 'BANK_TRANSFER':
        return 'account_balance';
      case 'CASH':
        return 'payments';
      case 'UPI':
        return 'currency_exchange';
      default:
        return 'payment';
    }
  }
}
