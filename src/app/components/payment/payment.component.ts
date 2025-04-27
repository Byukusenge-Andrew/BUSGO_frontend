import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
import { PaymentService, PaymentMethod, PaymentRequest, PaymentResponse } from '../../services/payment.service';

@Component({
  selector: 'app-payment',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="payment-container">
      <mat-card class="payment-card">
        <mat-card-header>
          <mat-card-title>Payment Details</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="payment-summary" *ngIf="amount > 0">
            <div class="summary-item">
              <span class="label">Amount:</span>
              <span class="value">{{ amount | currency:currency }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Booking ID:</span>
              <span class="value">{{ bookingId }}</span>
            </div>
          </div>

          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" *ngIf="!isPaymentComplete">
            <div class="form-section">
              <h3>Select Payment Method</h3>

              <div class="payment-methods" *ngIf="paymentMethods.length > 0">
                <mat-radio-group formControlName="paymentMethodId" class="payment-method-list">
                  <mat-radio-button *ngFor="let method of paymentMethods" [value]="method.id" class="payment-method-item">
                    <div class="payment-method-content">
                      <mat-icon class="payment-icon" [ngClass]="method.type">
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
                <button mat-button color="primary" type="button">Add Payment Method</button>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="!paymentForm.valid || processing">
                <mat-spinner diameter="20" *ngIf="processing"></mat-spinner>
                <span *ngIf="!processing">Pay Now</span>
              </button>
            </div>
          </form>

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
                <span class="value">{{ paymentResponse?.amount | currency:paymentResponse?.currency }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value">{{ paymentResponse?.timestamp | date:'medium' }}</span>
              </div>
            </div>
            <div class="success-actions">
              <button mat-raised-button color="primary" (click)="onComplete()">Done</button>
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
    }

    .payment-summary {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      font-weight: 600;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .form-section h3 {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: #333;
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

    .payment-icon.card {
      color: #1976d2;
    }

    .payment-icon.mobile_money {
      color: #388e3c;
    }

    .payment-icon.bank_transfer {
      color: #7b1fa2;
    }

    .payment-method-details {
      display: flex;
      flex-direction: column;
    }

    .payment-method-name {
      font-weight: 500;
    }

    .payment-method-info {
      font-size: 0.85rem;
      color: #666;
    }

    .no-payment-methods {
      text-align: center;
      padding: 1.5rem;
      background-color: #f9f9f9;
      border-radius: 4px;
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
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin: 1.5rem 0;
      text-align: left;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .success-actions {
      margin-top: 1.5rem;
    }
  `]
})
export class PaymentComponent implements OnInit {
  @Input() bookingId: string = '';
  @Input() amount: number = 0;
  @Input() currency: string = 'RWF';
  @Output() paymentComplete = new EventEmitter<PaymentResponse>();
  @Output() paymentCancelled = new EventEmitter<void>();

  paymentForm: FormGroup;
  paymentMethods: PaymentMethod[] = [];
  processing: boolean = false;
  isPaymentComplete: boolean = false;
  paymentResponse: PaymentResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar
  ) {
    this.paymentForm = this.fb.group({
      paymentMethodId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.paymentService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
        // Set default payment method if available
        const defaultMethod = methods.find(m => m.isDefault);
        if (defaultMethod) {
          this.paymentForm.patchValue({ paymentMethodId: defaultMethod.id });
        }
      },
      error: (error) => {
        console.error(error);
        this.snackBar.open('Failed to load payment methods', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.processing = true;

    const paymentRequest: PaymentRequest = {
      bookingId: this.bookingId,
      amount: this.amount,
      currency: this.currency,
      paymentMethodId: this.paymentForm.value.paymentMethodId
    };

    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (response) => {
        this.processing = false;
        this.paymentResponse = response;
        this.isPaymentComplete = true;
        this.paymentComplete.emit(response);
      },
      error: (error) => {
        this.processing = false;
        console.error(error);
        this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.paymentCancelled.emit();
  }

  onComplete(): void {
    this.paymentComplete.emit(this.paymentResponse!);
  }

  getPaymentIcon(type: string): string {
    switch (type) {
      case 'card':
        return 'credit_card';
      case 'mobile_money':
        return 'smartphone';
      case 'bank_transfer':
        return 'account_balance';
      default:
        return 'payment';
    }
  }
}
