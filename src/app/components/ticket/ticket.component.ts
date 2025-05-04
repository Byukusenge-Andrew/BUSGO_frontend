import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { BookingService } from '../../services/bus-booking.service';
import { Booking } from '../../models/booking.model';
import {MatError} from '@angular/material/input';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatToolbarModule,
    MatDividerModule,
    MatError

  ]
})
export class TicketComponent implements OnInit {
  ticket: Booking | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  isCanceling = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Invalid booking ID';
      this.isLoading = false;
      this.snackBar.open('Invalid booking ID', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.ticket = {
          ...booking,
          from: booking.from || booking.routeName?.split(' to ')[0] || 'Unknown',
          to: booking.to || booking.routeName?.split(' to ')[1] || 'Unknown',
          time: booking.time || booking.departureTime,
          totalAmount: booking.totalAmount || booking.amount
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load ticket details';
        this.isLoading = false;
        this.snackBar.open(`${this.errorMessage}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancelBooking() {
    if (!this.ticket?.id) return;

    this.isCanceling = true;
    this.bookingService.cancelBooking(this.ticket.id).subscribe({
      next: () => {
        this.ticket = { ...this.ticket!, status: 'CANCELLED' };
        this.isCanceling = false;
        this.snackBar.open('Booking cancelled successfully', 'Close', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isCanceling = false;
        this.snackBar.open(err.message || 'Failed to cancel booking', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/my-bookings']);
  }

  printTicket() {
    if (!this.ticket) return;

    const printContent = `
      <h2>Ticket Details</h2>
      <p><strong>Booking ID:</strong> ${this.ticket.id}</p>
      <p><strong>Customer:</strong> ${this.ticket.customerName}</p>
      <p><strong>Route:</strong> ${this.ticket.from} → ${this.ticket.to}</p>
      <p><strong>Date:</strong> ${new Date(this.ticket.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${this.ticket.time || this.ticket.departureTime} - ${this.ticket.arrivalTime}</p>
      <p><strong>Bus:</strong> ${this.ticket.busName || 'N/A'}</p>
      <p><strong>Seats:</strong> ${this.ticket.seatNumbers || this.ticket.seats}</p>
      <p><strong>Amount:</strong> ${this.ticket.totalAmount || this.ticket.amount}</p>
      <p><strong>Status:</strong> ${this.ticket.status}</p>
      <p><strong>Payment Status:</strong> ${this.ticket.paymentStatus || 'N/A'}</p>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Ticket #${this.ticket.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #3f51b5; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  }

  shareTicket() {
    if (!this.ticket) return;

    const shareText = `
Ticket Details
Booking ID: ${this.ticket.id}
Customer: ${this.ticket.customerName}
Route: ${this.ticket.from} → ${this.ticket.to}
Date: ${new Date(this.ticket.date).toLocaleDateString()}
Time: ${this.ticket.time || this.ticket.departureTime} - ${this.ticket.arrivalTime}
Bus: ${this.ticket.busName || 'N/A'}
Seats: ${this.ticket.seatNumbers || this.ticket.seats}
Amount: ${this.ticket.totalAmount || this.ticket.amount}
Status: ${this.ticket.status}
Payment Status: ${this.ticket.paymentStatus || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(shareText).then(() => {
      this.snackBar.open('Ticket details copied to clipboard', 'Close', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    }).catch(() => {
      this.snackBar.open('Failed to copy ticket details', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    });
  }

  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }
}
