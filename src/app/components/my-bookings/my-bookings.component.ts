import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/bus-booking.service';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../models/booking.model';
import { DatePipe, NgClass, NgForOf, NgIf, CurrencyPipe } from '@angular/common'; // Added CurrencyPipe
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner'; // Keep if used standalone
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card'; // Import Card components
import { MatIcon } from '@angular/material/icon'; // Import Icon
import { MatButton } from '@angular/material/button'; // Import Button
import { MatChip, MatChipListbox } from '@angular/material/chips'; // Import Chip components
import { MatDivider } from '@angular/material/divider'; // Import Divider
import { MatList, MatListItem, MatListItemIcon, MatListItemLine, MatListItemTitle } from '@angular/material/list'; // Import List components

@Component({
  selector: 'app-my-bookings',
  standalone: true, // Assuming standalone component based on previous context
  templateUrl: './my-bookings.component.html',
  imports: [
    // Common Angular Modules
    DatePipe,
    CurrencyPipe, // Add CurrencyPipe here
    RouterLink,
    NgIf,
    NgForOf,

    // Angular Material Modules (Standalone Components)
    MatProgressSpinner,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatIcon,
    MatButton,
    MatChipListbox,
    MatChip,
    MatDivider,
    MatList,
    MatListItem,
    MatListItemIcon, // If using icons inside list items
    MatListItemTitle, // If using titles inside list items
    MatListItemLine // If using lines inside list items

  ],
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  error = '';
  cancellingId: string | null = null; // To track which booking cancellation is in progress

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.error = 'User ID not available. Please log in.';
      this.loading = false; // Stop loading if no user ID
      return;
    }

    this.loading = true;
    this.error = '';
    this.cancellingId = null; // Reset cancelling state on load

    this.bookingService.getUserBookings(userId).subscribe({
      next: (data) => {
        // Sort bookings, e.g., by date descending (most recent first)
        this.bookings = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        // Use the error message from the service if available
        this.error = err.message || 'Failed to load your bookings';
        this.loading = false;
      }
    });
  }

  cancelBooking(bookingId: string): void {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    this.cancellingId = bookingId; // Set cancelling state for this specific booking
    this.error = ''; // Clear previous errors

    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        // Update the status in the local array optimistically
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'CANCELLED';
        }
        this.cancellingId = null; // Reset cancelling state on success
        // Optionally, add a success message/toast
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.error = err.message || 'Failed to cancel booking';
        this.cancellingId = null; // Reset cancelling state on error
      }
    });
  }

  // This method might not be directly needed if chip color is handled in the template,
  // but kept for potential reuse or more complex logic.
  getStatusChipColor(status: string): 'primary' | 'warn' | 'accent' {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'primary'; // Or 'accent' if you prefer green-like
      case 'CANCELLED':
        return 'warn'; // Red
      case 'PENDING':
        return 'accent'; // Amber/Orange like
      default:
        return 'accent'; // Default color
    }
  }

  refreshBookings(): void {
    this.loadBookings(); // Reload data
  }
}
