import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService, Booking } from '../../services/bus-booking.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="confirmation-container">
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading booking details...</p>
      </div>

      <div *ngIf="!loading && !booking" class="error-message">
        <h3>Booking Not Found</h3>
        <p>The booking you're looking for could not be found.</p>
        <button mat-raised-button color="primary" routerLink="/schedule-search">
          <mat-icon>search</mat-icon> Search Schedules
        </button>
      </div>

      <div *ngIf="!loading && booking">
        <mat-card class="confirmation-card">
          <mat-card-content>
            <div class="confirmation-header">
              <div class="confirmation-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              <h2>Booking Confirmed!</h2>
              <p>Your booking has been successfully confirmed.</p>
            </div>

            <mat-divider></mat-divider>

            <div class="booking-details">
              <div class="detail-item">
                <span class="label">Booking ID:</span>
                <span class="value">{{ booking.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Route:</span>
                <span class="value">{{ booking.routeName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value">{{ formatDate(booking.date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Departure:</span>
                <span class="value">{{ booking.departureTime }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Arrival:</span>
                <span class="value">{{ booking.arrivalTime }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Passenger:</span>
                <span class="value">{{ booking.customerName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Seats:</span>
                <span class="value">{{ booking.seats }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Amount:</span>
                <span class="value highlight">{{ booking.amount | currency:'RWF':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status">{{ booking.status }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="confirmation-message">
              <p>A confirmation email has been sent to <strong>{{ booking.customerEmail }}</strong>.</p>
              <p>Please arrive at least 30 minutes before departure time.</p>
              <p>Thank you for choosing our service!</p>
            </div>

            <div class="confirmation-actions">
              <button mat-raised-button color="primary" (click)="printTicket()">
                <mat-icon>print</mat-icon> Print Ticket
              </button>
              <button mat-stroked-button routerLink="/my-bookings">
                <mat-icon>list</mat-icon> My Bookings
              </button>
              <button mat-stroked-button routerLink="/schedule-search">
                <mat-icon>search</mat-icon> Book Another Trip
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 40px 0;
    }

    .error-message {
      text-align: center;
      margin: 40px 0;
    }

    .confirmation-card {
      border-radius: 8px;
      overflow: hidden;
    }

    .confirmation-header {
      text-align: center;
      margin: 20px 0 30px;
    }

    .confirmation-icon {
      margin-bottom: 15px;
    }

    .confirmation-icon mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #4CAF50;
    }

    .booking-details {
      margin: 20px 0;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 5px 0;
    }

    .detail-item:nth-child(even) {
      background-color: #f9f9f9;
    }

    .label {
      font-weight: 500;
      color: #555;
    }

    .value {
      font-weight: 400;
    }

    .value.highlight {
      font-weight: 700;
      color: #1a73e8;
    }

    .value.status {
      font-weight: 700;
      color: #4CAF50;
    }

    .confirmation-message {
      margin: 20px 0;
      text-align: center;
      line-height: 1.6;
    }

    .confirmation-actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 30px;
      flex-wrap: wrap;
    }

    @media (max-width: 600px) {
      .detail-item {
        flex-direction: column;
      }

      .label {
        margin-bottom: 5px;
      }

      .confirmation-actions {
        flex-direction: column;
        gap: 10px;
      }

      .confirmation-actions button {
        width: 100%;
      }
    }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  booking: Booking | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const bookingId = params.get('id');
      if (bookingId) {
        this.loadBookingDetails(bookingId);
      } else {
        this.loading = false;
      }
    });
  }

  loadBookingDetails(bookingId: string): void {
    this.loading = true;
    this.bookingService.getBookingById(bookingId).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.loading = false;
        this.snackBar.open('Failed to load booking details', 'Close', { duration: 5000 });
      }
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  printTicket(): void {
    window.print();
  }
}
