
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

import { Payment, PaymentMethod, PaymentStatus } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DatePipe } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-admin-company-payments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    RouterLink
  ],
  providers: [DatePipe],
  template: `
    <div class="admin-payments-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Company Payments</mat-card-title>
          <mat-card-subtitle>Manage all payment transactions</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filter Form -->
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search payments..." formControlName="search">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="PENDING">Pending</mat-option>
                <mat-option value="COMPLETED">Completed</mat-option>
                <mat-option value="FAILED">Failed</mat-option>
                <mat-option value="REFUNDED">Refunded</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Payment Method</mat-label>
              <mat-select formControlName="paymentMethod">
                <mat-option value="">All Methods</mat-option>
                <mat-option value="CASH">Cash</mat-option>
                <mat-option value="CREDIT_CARD">Credit Card</mat-option>
                <mat-option value="DEBIT_CARD">Debit Card</mat-option>
                <mat-option value="UPI">UPI</mat-option>
                <mat-option value="MOBILE_MONEY">Mobile Money</mat-option>
                <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date Range</mat-label>
              <mat-date-range-input [rangePicker]="picker">
                <input matStartDate placeholder="Start date" formControlName="startDate">
                <input matEndDate placeholder="End date" formControlName="endDate">
              </mat-date-range-input>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-date-range-picker #picker></mat-date-range-picker>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="applyFilters()">
                <mat-icon>filter_list</mat-icon> Apply Filters
              </button>
              <button mat-button (click)="resetFilters()">
                <mat-icon>clear</mat-icon> Reset
              </button>
            </div>
          </form>

          <!-- Payment Stats -->
          <div class="payment-stats">
            <div class="stat-card">
              <div class="stat-value">{{ paymentStats.totalPayments }}</div>
              <div class="stat-label">Total Payments</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ paymentStats.totalAmount | currency }}</div>
              <div class="stat-label">Total Amount</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ paymentStats.completedPayments }}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ paymentStats.pendingPayments }}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ paymentStats.failedPayments }}</div>
              <div class="stat-label">Failed</div>
            </div>
          </div>

          <mat-divider class="my-3"></mat-divider>

          <!-- Actions -->
          <div class="table-actions">
            <button mat-raised-button color="primary" (click)="openPaymentDialog()">
              <mat-icon>add</mat-icon> New Payment
            </button>
            <button mat-raised-button color="accent" (click)="exportPayments()">
              <mat-icon>download</mat-icon> Export
            </button>
          </div>

          <!-- Payments Table -->
          <div class="table-container mat-elevation-z2">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Payment ID Column -->
              <ng-container matColumnDef="paymentId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                <td mat-cell *matCellDef="let payment"> {{ payment.paymentId }} </td>
              </ng-container>

              <!-- Booking ID Column -->
              <ng-container matColumnDef="bookingId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Booking ID </th>
                <td mat-cell *matCellDef="let payment">
                  <a [routerLink]="['/admin/bookings', payment.bookingId]">{{ payment.bookingId }}</a>
                </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount </th>
                <td mat-cell *matCellDef="let payment"> {{ payment.amount | currency }} </td>
              </ng-container>

              <!-- Payment Method Column -->
              <ng-container matColumnDef="paymentMethod">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Method </th>
                <td mat-cell *matCellDef="let payment">
                  <span class="payment-method-chip">{{ payment.paymentMethod }}</span>
                </td>
              </ng-container>

              <!-- Transaction ID Column -->
              <ng-container matColumnDef="transactionId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Transaction ID </th>
                <td mat-cell *matCellDef="let payment"> {{ payment.transactionId || 'N/A' }} </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                <td mat-cell *matCellDef="let payment">
                  <span class="status-chip" [ngClass]="'status-' + payment.status.toLowerCase()">
                    {{ payment.status }}
                  </span>
                </td>
              </ng-container>

              <!-- Payment Date Column -->
              <ng-container matColumnDef="paymentDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
                <td mat-cell *matCellDef="let payment"> {{ payment.paymentDate | date:'medium' }} </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let payment">
                  <button mat-icon-button color="primary" matTooltip="Edit Payment" (click)="editPayment(payment)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Delete Payment" (click)="deletePayment(payment)">
                    <mat-icon>delete</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="View Details" (click)="viewPaymentDetails(payment)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <!-- Row shown when there is no matching data -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="8">No payments found</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-payments-container {
      padding: 20px;
    }

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }

    .filter-form mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .filter-actions {
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .table-actions {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
    }

    .status-chip {
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-completed {
      background-color: #c8e6c9;
      color: #2e7d32;
    }

    .status-pending {
      background-color: #fff9c4;
      color: #f57f17;
    }

    .status-failed {
      background-color: #ffcdd2;
      color: #c62828;
    }

    .status-refunded {
      background-color: #e1f5fe;
      color: #0277bd;
    }

    .payment-method-chip {
      padding: 4px 8px;
      border-radius: 4px;
      background-color: #e0e0e0;
      font-size: 12px;
    }

    .payment-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      flex: 1;
      min-width: 150px;
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 500;
      color: #3f51b5;
    }

    .stat-label {
      font-size: 14px;
      color: #757575;
      margin-top: 4px;
    }

    .my-3 {
      margin-top: 16px;
      margin-bottom: 16px;
    }
  `]
})
export class AdminCompanyPaymentsComponent implements OnInit {
  displayedColumns: string[] = ['paymentId', 'bookingId', 'amount', 'paymentMethod', 'transactionId', 'status', 'paymentDate', 'actions'];
  dataSource = new MatTableDataSource<Payment>([]);
  filterForm: FormGroup;

  paymentStats = {
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    paymentsByMethod: {}
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      paymentMethod: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.loadPaymentStats();

    // Subscribe to filter form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPayments(): void {
    this.paymentService.getAllPayments().subscribe((payments: Payment[]) => {
      this.dataSource.data = payments;
    });
  }

  loadPaymentStats(): void {
    this.paymentService.getPaymentStats().subscribe((stats: { totalPayments: number; totalAmount: number; completedPayments: number; pendingPayments: number; failedPayments: number; refundedPayments: number; paymentsByMethod: {}; }) => {
      this.paymentStats = stats;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    // Apply complex filtering
    this.dataSource.filterPredicate = (data: Payment, filter: string) => {
      // Search text filter
      const searchMatch = !filters.search ||
        data.paymentId.toString().includes(filters.search) ||
        data.bookingId.toString().includes(filters.search) ||
        data.amount.toString().includes(filters.search) ||
        data.transactionId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.paymentMethod.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.status.toLowerCase().includes(filters.search.toLowerCase());

      // Status filter
      const statusMatch = !filters.status || data.status === filters.status;

      // Payment method filter
      const methodMatch = !filters.paymentMethod || data.paymentMethod === filters.paymentMethod;

      // Date range filter
      let dateMatch = true;
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        dateMatch = dateMatch && data.paymentDate >= startDate;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateMatch = dateMatch && data.paymentDate <= endDate;
      }

      return searchMatch && statusMatch && methodMatch && dateMatch;
    };

    // Trigger filtering
    this.dataSource.filter = 'trigger';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      paymentMethod: '',
      startDate: null,
      endDate: null
    });
    this.dataSource.filter = '';
  }

  openPaymentDialog(bookingId?: number): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: {
        title: 'Create New Payment',
        bookingId: bookingId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.paymentService.createPayment(result).subscribe({
          next: () => {
            this.loadPayments();
            this.loadPaymentStats();
          }
        });
      }
    });
  }

  editPayment(payment: Payment): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Payment',
        payment: payment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.paymentService.updatePayment(payment.paymentId, result).subscribe({
          next: () => {
            this.loadPayments();
            this.loadPaymentStats();
          }
        });
      }
    });
  }

  deletePayment(payment: Payment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Payment',
        message: `Are you sure you want to delete payment #${payment.paymentId}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.paymentService.deletePayment(payment.paymentId).subscribe({
          next: () => {
            this.loadPayments();
            this.loadPaymentStats();
          }
        });
      }
    });
  }

  viewPaymentDetails(payment: Payment): void {
    // You could implement a detailed view dialog or navigate to a details page
    console.log('View payment details', payment);
    // Example: this.router.navigate(['/admin/payments', payment.paymentId]);
  }

  exportPayments(): void {
    // Get current filtered data
    const data = this.dataSource.filteredData;

    // Convert to CSV
    const headers = ['Payment ID', 'Booking ID', 'Amount', 'Method', 'Transaction ID', 'Status', 'Date'];
    const csvData = data.map(payment => [
      payment.paymentId,
      payment.bookingId,
      payment.amount,
      payment.paymentMethod,
      payment.transactionId || 'N/A',
      payment.status,
      this.datePipe.transform(payment.paymentDate, 'medium') || ''
    ]);

    // Add headers
    csvData.unshift(headers);

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');

    // Create download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `payments-export-${new Date().toISOString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
