import { Component, OnInit } from '@angular/core';
import { BookingService, PaginatedBookings } from '../../services/bus-booking.service';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../models/booking.model';
import { DatePipe, NgClass, NgForOf, NgIf, CurrencyPipe, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { MatDivider } from '@angular/material/divider';
import { MatList, MatListItem, MatListItemIcon, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../services/company.services';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  templateUrl: './my-bookings.component.html',
  imports: [
    DatePipe,
    CurrencyPipe,
    RouterLink,
    NgIf,
    NgForOf,
    FormsModule,
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
    MatList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatListItemLine,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatPaginator,
    MatTooltip,
    MatDivider
  ],
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  error = '';
  cancellingId: string | null = null;

  companyNames: Map<string, Observable<string>> = new Map();

  totalItems = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;
  totalPages = 0;
  hasActiveBookings = false;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private companyService: CompanyService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.error = 'User authentication required. Please log in to view your bookings.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.cancellingId = null;
    this.companyNames.clear();

    this.bookingService.getUserBookingsPaginated(userId, this.currentPage, this.pageSize).subscribe({
      next: (response: PaginatedBookings) => {
        this.bookings = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;

        // Check if there are any active bookings (CONFIRMED or PENDING status)
        this.hasActiveBookings = this.bookings.some(booking =>
          booking.status === 'CONFIRMED' || booking.status === 'PENDING'
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.error = this.getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  private getErrorMessage(err: any): string {
    if (err.status === 401 || err.status === 403) {
      return 'Authentication expired. Please log in again to view your bookings.';
    } else if (err.status === 404) {
      return 'Booking service is currently unavailable. Please try again later.';
    } else if (err.status === 500) {
      return 'Server error occurred. Our team has been notified. Please try again later.';
    } else if (!navigator.onLine) {
      return 'No internet connection. Please check your network and try again.';
    } else if (err.error?.message) {
      return err.error.message;
    } else {
      return err.message || 'Failed to load your bookings. Please try again.';
    }
  }

  getCompanyName(companyId: string | number | undefined): Observable<string> {
    if (!companyId) {
      return of('Unknown Company');
    }

    const key = companyId.toString();
    if (!this.companyNames.has(key)) {
      this.companyNames.set(key, this.companyService.getCompanyName(companyId));
    }

    return this.companyNames.get(key) || of('Unknown Company');
  }

  cancelBooking(bookingId: string): void {
    // Enhanced confirmation dialog
    const booking = this.bookings.find(b => b.id === bookingId);
    const confirmMessage = booking
      ? `Are you sure you want to cancel your booking for "${booking.routeName}" on ${new Date(booking.date).toLocaleDateString()}?\n\nThis action cannot be undone and may be subject to cancellation fees.`
      : 'Are you sure you want to cancel this booking? This action cannot be undone and may be subject to cancellation fees.';

    if (confirm(confirmMessage)) {
      this.loading = true;
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          // Show success message
          if (booking) {
            console.log(`Booking ${booking.routeName} cancelled successfully`);
          }
          // Reload bookings to reflect the change
          this.loadBookings();
        },
        error: (err: any) => {
          console.error('Error cancelling booking:', err);
          this.error = `Failed to cancel booking: ${this.getErrorMessage(err)}`;
          this.loading = false;
        }
      });
    }
  }

  private getCancellationErrorMessage(err: any): string {
    if (err.status === 400) {
      return 'This booking cannot be cancelled. It may be too close to departure time or already processed.';
    } else if (err.status === 404) {
      return 'Booking not found. It may have already been cancelled or modified.';
    } else if (err.status === 409) {
      return 'Booking cancellation failed due to a conflict. Please contact customer support.';
    } else {
      return err.message || 'Failed to cancel booking. Please try again or contact customer support.';
    }
  }

  getStatusChipColor(status: string): 'primary' | 'warn' | 'accent' {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'primary';
      case 'CANCELLED':
        return 'warn';
      case 'PENDING':
      case 'PROCESSING':
        return 'accent';
      default:
        return 'accent';
    }
  }

  refreshBookings(): void {
    this.loadBookings();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBookings();
  }

  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadBookings();
  }

  // Track by function for better performance
  trackByBookingId(index: number, booking: Booking): string {
    return booking.id;
  }

  // Helper method to check if booking can be cancelled
  canCancelBooking(booking: Booking): boolean {
    if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
      return false;
    }

    // Check if booking is within cancellation window (e.g., 2 hours before departure)
    const travelDate = new Date(booking.date);
    const now = new Date();
    const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 3600);

    return hoursDifference > 2; // Can cancel if more than 2 hours before travel
  }

  // Helper method to check if payment is required
  requiresPayment(booking: Booking): boolean {
    return booking.paymentStatus !== 'COMPLETED' &&
           booking.paymentStatus !== 'PAID' &&
           booking.status !== 'CANCELLED';
  }

  // Helper method to get payment status display text
  getPaymentStatusText(paymentStatus: string): string {
    switch (paymentStatus?.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID':
        return 'Paid';
      case 'PENDING':
        return 'Payment Pending';
      case 'FAILED':
        return 'Payment Failed';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return 'Payment Required';
    }
  }
}
