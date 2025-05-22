
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Payment, PaymentMethod, PaymentStatus } from '../../../models/payment.model';

export interface PaymentDialogData {
  title: string;
  payment?: Partial<Payment>;
  bookingId?: number;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `

    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content>
      <form [formGroup]="paymentForm">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount">
            <mat-error *ngIf="paymentForm.get('amount')?.hasError('required')">
              Amount is required
            </mat-error>
            <mat-error *ngIf="paymentForm.get('amount')?.hasError('min')">
              Amount must be greater than 0
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Payment Method</mat-label>
            <mat-select formControlName="paymentMethod">
              <mat-option value="CASH">Cash</mat-option>
              <mat-option value="CREDIT_CARD">Credit Card</mat-option>
              <mat-option value="DEBIT_CARD">Debit Card</mat-option>
              <mat-option value="UPI">UPI</mat-option>
              <mat-option value="MOBILE_MONEY">Mobile Money</mat-option>
              <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
            </mat-select>
            <mat-error *ngIf="paymentForm.get('paymentMethod')?.hasError('required')">
              Payment method is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Transaction ID</mat-label>
            <input matInput formControlName="transactionId">
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="isEditMode">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="PENDING">Pending</mat-option>
              <mat-option value="COMPLETED">Completed</mat-option>
              <mat-option value="FAILED">Failed</mat-option>
              <mat-option value="REFUNDED">Refunded</mat-option>
            </mat-select>
            <mat-error *ngIf="paymentForm.get('status')?.hasError('required')">
              Status is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Payment Details</mat-label>
            <textarea matInput formControlName="paymentDetails" rows="3"></textarea>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="paymentForm.invalid"
        (click)="onSubmit()">
        {{ isEditMode ? 'Update' : 'Create' }} Payment
      </button>
    </mat-dialog-actions>

  `,
  styles: [`
    .form-row {
      margin-bottom: 1rem;
      display: flex;
      gap: 1rem;
    }

    mat-form-field {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 400px;
      max-width: 600px;
      padding-top: 1rem;
    }
  `]
})
export class PaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.isEditMode = !!data.payment?.paymentId;

    this.paymentForm = this.fb.group({
      amount: [data.payment?.amount || '', [Validators.required, Validators.min(0.01)]],
      paymentMethod: [data.payment?.paymentMethod || 'CASH', Validators.required],
      transactionId: [data.payment?.transactionId || ''],
      paymentDetails: [data.payment?.paymentDetails || '']
    });

    // Add status field only in edit mode
    if (this.isEditMode) {
      this.paymentForm.addControl('status', this.fb.control(data.payment?.status || 'PENDING', Validators.required));
    }

    // If bookingId is provided, use it
    if (data.bookingId) {
      this.paymentForm.addControl('bookingId', this.fb.control(data.bookingId));
    } else if (data.payment?.bookingId) {
      this.paymentForm.addControl('bookingId', this.fb.control(data.payment.bookingId));
    }
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) return;

    // Return form data to the caller
    this.dialogRef.close(this.paymentForm.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
