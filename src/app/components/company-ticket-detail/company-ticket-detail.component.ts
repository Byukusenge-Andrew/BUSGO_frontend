import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Ticket {
  id: string;
  bookingId: string;
  routeName: string;
  origin: string;
  destination: string;
  departureDate: Date;
  departureTime: string;
  busRegistration: string;
  seatNumbers: string[];
  passengerName: string;
  passengerEmail: string;
  passengerPhone?: string;
  price: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  checkInStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN';
  checkInTime?: Date;
  notes?: string;
  createdAt: Date;
}

@Component({
  selector: 'app-company-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="ticket-container">
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading ticket details...</p>
      </div>

      <div *ngIf="error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <h3>{{ error }}</h3>
        <button mat-raised-button color="primary" routerLink="/company/tickets">Back to Tickets</button>
      </div>

      <ng-container *ngIf="ticket && !loading && !error">
        <div class="ticket-header">
          <div class="ticket-title">
            <h1>Ticket #{{ ticket.id }}</h1>
            <div class="ticket-status" [ngClass]="ticket.status.toLowerCase()">{{ ticket.status }}</div>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="updateTicketStatus()">
              <mat-icon>edit</mat-icon> Update Status
            </button>
            <button mat-raised-button (click)="printTicket()">
              <mat-icon>print</mat-icon> Print
            </button>
          </div>
        </div>

        <div class="ticket-content">
          <mat-card class="ticket-card main-info">
            <mat-card-content>
              <div class="ticket-section">
                <h2>Route Information</h2>
                <div class="route-name">{{ ticket.routeName }}</div>
                <div class="route-details">
                  <div class="info-row">
                    <div class="info-label">From:</div>
                    <div class="info-value">{{ ticket.origin }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">To:</div>
                    <div class="info-value">{{ ticket.destination }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Departure:</div>
                    <div class="info-value">{{ ticket.departureDate | date:'EEEE, MMMM d, y' }} at {{ ticket.departureTime }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Bus:</div>
                    <div class="info-value">{{ ticket.busRegistration }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Seats:</div>
                    <div class="info-value">{{ ticket.seatNumbers.join(', ') }}</div>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="ticket-section">
                <h2>Passenger Information</h2>
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value">{{ ticket.passengerName }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">{{ ticket.passengerEmail }}</div>
                </div>
                <div class="info-row" *ngIf="ticket.passengerPhone">
                  <div class="info-label">Phone:</div>
                  <div class="info-value">{{ ticket.passengerPhone }}</div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="ticket-section">
                <h2>Payment Information</h2>
                <div class="info-row">
                  <div class="info-label">Booking ID:</div>
                  <div class="info-value">{{ ticket.bookingId }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Price:</div>
                  <div class="info-value">RWF {{ ticket.price | number }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Payment Status:</div>
                  <div class="info-value" [ngClass]="ticket.paymentStatus.toLowerCase()">{{ ticket.paymentStatus }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Booked On:</div>
                  <div class="info-value">{{ ticket.createdAt | date:'medium' }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="side-content">
            <mat-card class="ticket-card">
              <mat-card-header>
                <mat-card-title>Check-In Status</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="check-in-status" [ngClass]="ticket.checkInStatus === 'CHECKED_IN' ? 'checked-in' : 'not-checked-in'">
                  <mat-icon>{{ ticket.checkInStatus === 'CHECKED_IN' ? 'check_circle' : 'cancel' }}</mat-icon>
                  <span>{{ ticket.checkInStatus === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In' }}</span>
                </div>

                <div *ngIf="ticket.checkInStatus === 'CHECKED_IN'" class="check-in-time">
                  <div class="info-label">Check-In Time:</div>
                  <div class="info-value">{{ ticket.checkInTime | date:'medium' }}</div>
                </div>

                <div class="check-in-actions">
                  <button
                    mat-raised-button
                    [color]="ticket.checkInStatus === 'CHECKED_IN' ? 'warn' : 'primary'"
                    (click)="updateCheckInStatus()">
                    <mat-icon>{{ ticket.checkInStatus === 'CHECKED_IN' ? 'cancel' : 'check_circle' }}</mat-icon>
                    {{ ticket.checkInStatus === 'CHECKED_IN' ? 'Undo Check-In' : 'Mark as Checked In' }}
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="ticket-card">
              <mat-card-header>
                <mat-card-title>Notes</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="notesForm">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Add or update notes</mat-label>
                    <textarea matInput formControlName="notes" rows="5"></textarea>
                  </mat-form-field>
                  <button
                    mat-raised-button
                    color="primary"
                    [disabled]="notesForm.pristine || notesForm.invalid"
                    (click)="saveNotes()">
                    Save Notes
                  </button>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="actions-footer">
          <button mat-button routerLink="/company/tickets">
            <mat-icon>arrow_back</mat-icon> Back to Tickets
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .ticket-container {
      max-width: 1100px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .loading-container p {
      margin-top: 1rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .error-container {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 2rem;
    }

    .error-container mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      margin-bottom: 1rem;
    }

    .error-container h3 {
      margin-bottom: 1.5rem;
      color: rgba(0, 0, 0, 0.8);
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .ticket-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .ticket-title h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .ticket-status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.875rem;
    }

    .ticket-status.confirmed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .ticket-status.pending {
      background-color: #fff8e1;
      color: #ff8f00;
    }

    .ticket-status.cancelled {
      background-color: #ffebee;
      color: #c62828;
    }

    .ticket-status.completed {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .ticket-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .ticket-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .side-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .ticket-section {
      padding: 1.5rem;
    }

    .ticket-section h2 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.8);
    }

    .route-name {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      color: rgba(0, 0, 0, 0.8);
    }

    .info-row {
      display: flex;
      margin-bottom: 0.75rem;
    }

    .info-label {
      flex: 0 0 120px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
    }

    .info-value {
      flex: 1;
    }

    .info-value.paid {
      color: #2e7d32;
      font-weight: 500;
    }

    .info-value.pending {
      color: #ff8f00;
      font-weight: 500;
    }

    .info-value.refunded {
      color: #c62828;
      font-weight: 500;
    }

    .check-in-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .check-in-status.checked-in {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .check-in-status.not-checked-in {
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.6);
    }

    .check-in-time {
      margin-bottom: 1rem;
    }

    .check-in-actions {
      margin-top: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .actions-footer {
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .ticket-content {
        grid-template-columns: 1fr;
      }

      .info-row {
        flex-direction: column;
      }

      .info-label {
        margin-bottom: 0.25rem;
      }

      .ticket-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class CompanyTicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = true;
  error: string | null = null;
  notesForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.notesForm = this.fb.group({
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      // Ensure only company users or admins can access
      if (user?.role !== 'company' && user?.role !== 'admin') {
        this.error = 'You do not have permission to view this ticket';
        this.loading = false;
        return;
      }

      this.loadTicket();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTicket(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (!ticketId) {
      this.error = 'Invalid ticket ID';
      this.loading = false;
      return;
    }

    // In a real app, this would call a service method
    // Here we're simulating an API call with mock data
    setTimeout(() => {
      // Simulate ticket data
      this.ticket = {
        id: ticketId,
        bookingId: 'BK' + Math.floor(1000 + Math.random() * 9000),
        routeName: 'Kigali-Musanze Express',
        origin: 'Kigali',
        destination: 'Musanze',
        departureDate: new Date(Date.now() + 86400000), // Tomorrow
        departureTime: '10:00 AM',
        busRegistration: 'RAB 456C',
        seatNumbers: ['B5', 'B6'],
        passengerName: 'John Doe',
        passengerEmail: 'john.doe@example.com',
        passengerPhone: '+250 788 123 456',
        price: 12500,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        checkInStatus: 'NOT_CHECKED_IN',
        notes: 'Customer requested window seats.',
        createdAt: new Date(Date.now() - 86400000) // Yesterday
      };

      this.notesForm.patchValue({ notes: this.ticket.notes });
      this.loading = false;
    }, 1000);
  }

  updateTicketStatus(): void {
    if (!this.ticket) return;

    // In a real app, this would open a dialog with status options
    const newStatus = prompt('Enter new status (CONFIRMED, PENDING, CANCELLED, COMPLETED):', this.ticket.status);

    if (newStatus && ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'].includes(newStatus)) {
      this.ticket.status = newStatus as any;
      this.snackBar.open('Ticket status updated successfully', 'Close', { duration: 3000 });
    } else if (newStatus) {
      this.snackBar.open('Invalid status entered', 'Close', { duration: 3000 });
    }
  }

  updateCheckInStatus(): void {
    if (!this.ticket) return;

    if (this.ticket.checkInStatus === 'NOT_CHECKED_IN') {
      this.ticket.checkInStatus = 'CHECKED_IN';
      this.ticket.checkInTime = new Date();
      this.snackBar.open('Passenger marked as checked in', 'Close', { duration: 3000 });
    } else {
      this.ticket.checkInStatus = 'NOT_CHECKED_IN';
      this.ticket.checkInTime = undefined;
      this.snackBar.open('Check-in status reset', 'Close', { duration: 3000 });
    }
  }

  saveNotes(): void {
    if (!this.ticket || this.notesForm.invalid) return;

    this.ticket.notes = this.notesForm.get('notes')?.value;
    this.notesForm.markAsPristine();
    this.snackBar.open('Notes updated successfully', 'Close', { duration: 3000 });
  }

  printTicket(): void {
    // In a real app, this would generate a printable version
    this.snackBar.open('Preparing ticket for printing...', '', { duration: 2000 });

    // Simulate print preparation
    setTimeout(() => {
      window.print();
    }, 500);
  }
}
