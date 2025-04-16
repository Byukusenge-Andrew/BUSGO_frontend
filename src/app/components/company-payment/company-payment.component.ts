import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  name: string;
  details: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  paymentMethod: string;
}

@Component({
  selector: 'app-company-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="payment-container">
      <div class="page-header">
        <h1>Payment Management</h1>
        <p class="subtitle">Manage your payment methods, view transactions, and update billing information</p>
      </div>

      <mat-card class="main-card">
        <mat-card-content>
          <mat-tab-group animationDuration="300ms" class="custom-tabs">
            <mat-tab label="Payment Methods">
              <div class="tab-content">
                <div class="section-header">
                  <div class="header-content">
                    <h2>Your Payment Methods</h2>
                    <p class="section-description">Add and manage your payment methods for receiving payments</p>
                  </div>
                  <button mat-raised-button color="primary" (click)="openAddPaymentMethod()" class="action-button">
                    <mat-icon>add_circle</mat-icon> Add Payment Method
                  </button>
                </div>

                <div class="payment-methods">
                  <div *ngFor="let method of paymentMethods" class="payment-method-card">
                    <div class="payment-method-header">
                      <div class="payment-method-icon" [ngClass]="method.type.toLowerCase()">
                        <mat-icon>{{ getPaymentMethodIcon(method.type) }}</mat-icon>
                      </div>
                      <div class="payment-method-info">
                        <h4>{{ method.name }}</h4>
                        <p>{{ method.details }}</p>
                      </div>
                      <div class="payment-method-actions">
                        <button mat-icon-button color="primary" (click)="editPaymentMethod(method)" matTooltip="Edit payment method">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deletePaymentMethod(method)" matTooltip="Delete payment method">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                    <mat-divider></mat-divider>
                    <div class="payment-method-footer">
                      <mat-slide-toggle [checked]="method.isDefault" (change)="setDefaultPaymentMethod(method)">
                        Set as default
                      </mat-slide-toggle>
                      <div *ngIf="method.isDefault">
                        <mat-chip color="primary" selected>Default</mat-chip>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="paymentMethods.length === 0" class="no-payment-methods">
                    <mat-icon>payment</mat-icon>
                    <h3>No Payment Methods</h3>
                    <p>You haven't added any payment methods yet.</p>
                    <button mat-stroked-button color="primary" (click)="openAddPaymentMethod()">
                      <mat-icon>add</mat-icon> Add Your First Payment Method
                    </button>
                  </div>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Transaction History">
              <div class="tab-content">
                <div class="section-header">
                  <div class="header-content">
                    <h2>Recent Transactions</h2>
                    <p class="section-description">View your payment history and transaction details</p>
                  </div>
                  <div class="transaction-summary">
                    <div class="summary-item">
                      <span class="summary-label">Total Revenue</span>
                      <span class="summary-value">RWF {{ getTotalRevenue() | number }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Pending</span>
                      <span class="summary-value pending">RWF {{ getPendingAmount() | number }}</span>
                    </div>
                  </div>
                </div>

                <div class="table-container">
                  <table mat-table [dataSource]="transactions" matSort class="transactions-table">
                    <!-- Date Column -->
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                      <td mat-cell *matCellDef="let transaction">{{ transaction.date | date:'mediumDate' }}</td>
                    </ng-container>

                    <!-- Amount Column -->
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
                      <td mat-cell *matCellDef="let transaction">
                        <span class="amount">{{ transaction.currency }} {{ transaction.amount | number }}</span>
                      </td>
                    </ng-container>

                    <!-- Description Column -->
                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Description</th>
                      <td mat-cell *matCellDef="let transaction">{{ transaction.description }}</td>
                    </ng-container>

                    <!-- Payment Method Column -->
                    <ng-container matColumnDef="paymentMethod">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment Method</th>
                      <td mat-cell *matCellDef="let transaction">
                        <div class="payment-method-cell">
                          <mat-icon class="payment-icon">{{ getPaymentMethodIcon(getPaymentMethodType(transaction.paymentMethod)) }}</mat-icon>
                          <span>{{ transaction.paymentMethod }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                      <td mat-cell *matCellDef="let transaction">
                        <span class="status-badge" [ngClass]="transaction.status.toLowerCase()">
                          {{ transaction.status }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let transaction">
                        <button mat-icon-button color="primary" (click)="viewTransactionDetails(transaction)" matTooltip="View details">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button color="accent" (click)="downloadReceipt(transaction)" matTooltip="Download receipt">
                          <mat-icon>receipt</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>

                  <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of transactions"></mat-paginator>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Billing Information">
              <div class="tab-content">
                <div class="section-header">
                  <div class="header-content">
                    <h2>Billing Information</h2>
                    <p class="section-description">Update your company billing details for invoices and payments</p>
                  </div>
                </div>

                <div class="billing-form-container">
                  <form [formGroup]="billingForm" (ngSubmit)="onBillingSubmit()" class="billing-form">
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Company Name</mat-label>
                        <input matInput formControlName="companyName" required>
                        <mat-icon matPrefix>business</mat-icon>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Tax ID / VAT Number</mat-label>
                        <input matInput formControlName="taxId">
                        <mat-icon matPrefix>receipt</mat-icon>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline">
                      <mat-label>Billing Address</mat-label>
                      <textarea matInput formControlName="billingAddress" rows="3" required></textarea>
                      <mat-icon matPrefix>location_on</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Billing Email</mat-label>
                      <input matInput formControlName="billingEmail" type="email" required>
                      <mat-icon matPrefix>email</mat-icon>
                    </mat-form-field>

                    <div class="form-actions">
                      <button mat-stroked-button type="button" (click)="resetBillingForm()">Reset</button>
                      <button mat-raised-button color="primary" type="submit" [disabled]="!billingForm.valid || !billingForm.dirty">
                        <mat-icon>save</mat-icon> Save Billing Information
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--primary-black);
    }

    .subtitle {
      color: var(--text-dark);
      font-size: 1rem;
    }

    .main-card {
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .custom-tabs {
      margin-top: 1rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content {
      flex: 1;
    }

    .header-content h2 {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--primary-black);
    }

    .section-description {
      color: var(--text-dark);
      font-size: 0.9rem;
      margin: 0;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    }

    .payment-methods {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .payment-method-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .payment-method-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .payment-method-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .payment-method-icon {
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
    }

    .payment-method-icon.credit_card {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .payment-method-icon.bank_transfer {
      background-color: #e8f5e9;
      color: #388e3c;
    }

    .payment-method-icon.mobile_money {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .payment-method-info {
      flex: 1;
    }

    .payment-method-info h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .payment-method-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .payment-method-actions {
      display: flex;
      gap: 0.5rem;
    }

    .payment-method-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
    }

    .no-payment-methods {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      background-color: #f5f5f5;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .no-payment-methods mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #9e9e9e;
    }

    .no-payment-methods h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .no-payment-methods p {
      color: #666;
      margin: 0 0 1rem 0;
    }

    .transaction-summary {
      display: flex;
      gap: 1.5rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .summary-label {
      font-size: 0.8rem;
      color: #666;
    }

    .summary-value {
      font-size: 1.2rem;
      font-weight: 500;
      color: #388e3c;
    }

    .summary-value.pending {
      color: #f57c00;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .transactions-table {
      width: 100%;
    }

    .amount {
      font-weight: 500;
    }

    .payment-method-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .payment-icon {
      font-size: 1.2rem;
      color: #666;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-badge.completed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-badge.failed {
      background-color: #ffebee;
      color: #c62828;
    }

    .billing-form-container {
      max-width: 800px;
    }

    .billing-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1.5rem;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    mat-form-field {
      width: 100%;
    }

    mat-form-field mat-icon {
      margin-right: 0.5rem;
      color: #666;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .transaction-summary {
        width: 100%;
        justify-content: space-between;
      }

      .form-row {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class CompanyPaymentComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  transactions: Transaction[] = [];
  billingForm: FormGroup;
  displayedColumns: string[] = ['date', 'amount', 'description', 'paymentMethod', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.billingForm = this.fb.group({
      companyName: ['', Validators.required],
      taxId: [''],
      billingAddress: ['', Validators.required],
      billingEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadPaymentMethods();
    this.loadTransactions();
    this.loadBillingInfo();
  }

  loadPaymentMethods(): void {
    // In a real app, this would fetch from the API
    this.paymentMethods = [
      {
        id: 'PM001',
        type: 'CREDIT_CARD',
        name: 'Visa ending in 4242',
        details: 'Expires 12/25',
        isDefault: true
      },
      {
        id: 'PM002',
        type: 'BANK_TRANSFER',
        name: 'Bank Account',
        details: 'Acct: ****1234, Bank: Kigali Bank',
        isDefault: false
      },
      {
        id: 'PM003',
        type: 'MOBILE_MONEY',
        name: 'Mobile Money',
        details: '+250 788 123 456',
        isDefault: false
      }
    ];
  }

  loadTransactions(): void {
    // In a real app, this would fetch from the API
    this.transactions = [
      {
        id: 'TR001',
        date: new Date(2023, 5, 15),
        amount: 150000,
        currency: 'RWF',
        description: 'Monthly subscription',
        status: 'COMPLETED',
        paymentMethod: 'Visa ending in 4242'
      },
      {
        id: 'TR002',
        date: new Date(2023, 5, 10),
        amount: 75000,
        currency: 'RWF',
        description: 'Additional route fee',
        status: 'COMPLETED',
        paymentMethod: 'Bank Account'
      },
      {
        id: 'TR003',
        date: new Date(2023, 5, 5),
        amount: 50000,
        currency: 'RWF',
        description: 'Premium features',
        status: 'PENDING',
        paymentMethod: 'Mobile Money'
      },
      {
        id: 'TR004',
        date: new Date(2023, 4, 28),
        amount: 100000,
        currency: 'RWF',
        description: 'Monthly subscription',
        status: 'FAILED',
        paymentMethod: 'Visa ending in 4242'
      }
    ];
  }

  loadBillingInfo(): void {
    // In a real app, this would fetch from the API
    this.billingForm.patchValue({
      companyName: 'Rwanda Express',
      taxId: '123456789',
      billingAddress: 'KN 5 Rd, Kigali, Rwanda',
      billingEmail: 'billing@rwandaexpress.com'
    });
  }

  getPaymentMethodIcon(type: string): string {
    switch (type) {
      case 'CREDIT_CARD':
        return 'credit_card';
      case 'BANK_TRANSFER':
        return 'account_balance';
      case 'MOBILE_MONEY':
        return 'smartphone';
      default:
        return 'payment';
    }
  }

  getPaymentMethodType(paymentMethod: string): string {
    if (paymentMethod.includes('Visa') || paymentMethod.includes('Mastercard')) {
      return 'CREDIT_CARD';
    } else if (paymentMethod.includes('Bank')) {
      return 'BANK_TRANSFER';
    } else if (paymentMethod.includes('Mobile')) {
      return 'MOBILE_MONEY';
    }
    return 'payment';
  }

  getTotalRevenue(): number {
    return this.transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getPendingAmount(): number {
    return this.transactions
      .filter(t => t.status === 'PENDING')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  openAddPaymentMethod(): void {
    // In a real app, this would open a dialog to add a payment method
    this.snackBar.open('Add payment method functionality will be implemented', 'Close', { duration: 3000 });
  }

  editPaymentMethod(method: PaymentMethod): void {
    // In a real app, this would open a dialog to edit a payment method
    console.log('Edit payment method:', method);
  }

  deletePaymentMethod(method: PaymentMethod): void {
    if (confirm(`Are you sure you want to delete ${method.name}?`)) {
      // In a real app, this would delete the payment method from the API
      this.paymentMethods = this.paymentMethods.filter(m => m.id !== method.id);
      this.snackBar.open('Payment method deleted successfully', 'Close', { duration: 3000 });
    }
  }

  setDefaultPaymentMethod(method: PaymentMethod): void {
    // In a real app, this would update the default payment method via the API
    this.paymentMethods.forEach(m => {
      m.isDefault = m.id === method.id;
    });
    this.snackBar.open(`${method.name} set as default payment method`, 'Close', { duration: 3000 });
  }

  viewTransactionDetails(transaction: Transaction): void {
    // In a real app, this would open a dialog with transaction details
    console.log('View transaction details:', transaction);
  }

  downloadReceipt(transaction: Transaction): void {
    // In a real app, this would download a receipt for the transaction
    this.snackBar.open(`Receipt for transaction ${transaction.id} downloaded`, 'Close', { duration: 3000 });
  }

  resetBillingForm(): void {
    this.loadBillingInfo();
    this.snackBar.open('Form reset to original values', 'Close', { duration: 3000 });
  }

  onBillingSubmit(): void {
    if (this.billingForm.valid) {
      // In a real app, this would save billing information via an API call
      this.snackBar.open('Billing information saved successfully', 'Close', { duration: 3000 });
    }
  }
}
