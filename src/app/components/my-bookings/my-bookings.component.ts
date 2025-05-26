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
import { MatPaginator } from '@angular/material/paginator';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
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
    MatDivider,
    MatList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatListItemLine,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption
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
      this.error = 'User ID not available. Please log in.';
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

        // We no longer need to fetch company names separately as they are included in the booking data
        // The companyName field will be populated directly from the backend response

        // Check if there are any active bookings (CONFIRMED or PENDING status)
        this.hasActiveBookings = this.bookings.some(booking =>
          booking.status === 'CONFIRMED' || booking.status === 'PENDING'
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.error = err.message || 'Failed to load your bookings';
        this.loading = false;
      }
    });
  }

  getCompanyName(companyId: string | number | undefined): Observable<string> {
    // If the booking already has a company name, return it directly
    // This will be used as a fallback in case the booking doesn't have a company name
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
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    this.cancellingId = bookingId;
    this.error = '';

    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'CANCELLED';
        }
        this.cancellingId = null;
        // Optionally, add a success message/toast
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.error = err.message || 'Failed to cancel booking';
        this.cancellingId = null;
      }
    });
  }

  getStatusChipColor(status: string): 'primary' | 'warn' | 'accent' {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'primary';
      case 'CANCELLED':
        return 'warn';
      case 'PENDING':
        return 'accent';
      default:
        return 'accent';
    }
  }

  refreshBookings(): void {
    this.loadBookings();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBookings();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadBookings();
  }
}
