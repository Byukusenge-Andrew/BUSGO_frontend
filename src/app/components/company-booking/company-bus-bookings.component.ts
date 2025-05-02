
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core'; // Added AfterViewInit
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DatePipe, CurrencyPipe, NgIf, NgFor, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/bus-booking.service'; // Corrected path if needed
import { AuthService, User, Company } from '../../services/auth.service'; // Corrected path if needed, Import User/Company
import { Booking } from '../../models/booking.model'; // Corrected path if needed
import { ThemePalette, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-company-bus-bookings',
  templateUrl: './company-bus-bookings.component.html',
  styleUrls: ['./company-bus-bookings.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDatepickerModule,
  ],
  providers: [
    DatePipe,
    provideNativeDateAdapter()
  ]
})
export class CompanyBusBookingsComponent implements OnInit, AfterViewInit { // Implement AfterViewInit
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  dataSource = new MatTableDataSource<Booking>([]);
  loading = false;
  error = '';
  companyId: string = '';

  displayedColumns: string[] = ['id', 'customer', 'route', 'date', 'time', 'seats', 'amount', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 10;
  totalItems = 0;

  filterForm: FormGroup;
  dateRangeFormGroup: FormGroup; // Keep for potential future use or UI consistency
  statusOptions = ['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.filterForm = this.fb.group({
      status: ['ALL'],
      searchTerm: ['']
    });

    // Keep the date range form, but note it's not used by getCompanyBookings currently
    this.dateRangeFormGroup = this.fb.group({
      startDate: [new Date(new Date().setDate(new Date().getDate() - 30))],
      endDate: [new Date()]
    });
  }

  ngOnInit(): void {
    this.getCompanyId();
    // loadBookings is now called within getCompanyId after companyId is confirmed
  }

  ngAfterViewInit() {
    // Assign paginator after view init
    this.dataSource.paginator = this.paginator;
  }

  getCompanyId(): void {
    this.loading = true; // Start loading indicator
    const currentUser: User | Company | null = this.authService.getCurrentUser(); // Get user directly

    if (currentUser && 'companyId' in currentUser && currentUser.companyId) {
      this.companyId = currentUser.companyId; // Assuming companyId is string, adjust if number
      console.log('Company ID found:', this.companyId);
      this.loadBookings(); // Load bookings now that we have the ID
    } else {
      this.error = 'User is not associated with a company or company ID is missing.';
      console.error(this.error, 'Current User:', currentUser);
      this.loading = false; // Stop loading as we can't proceed
      this.bookings = []; // Clear any existing data
      this.applyFilters(); // Update table display
    }
  }

  loadBookings(): void {
    if (!this.companyId) {
      this.error = 'Company ID is required to load bookings.';
      this.loading = false; // Ensure loading stops if called erroneously
      return;
    }

    this.loading = true; // Ensure loading is true when starting
    this.error = '';

    // const startDate = this.dateRangeFormGroup.get('startDate')?.value; // Not used by current service method
    // const endDate = this.dateRangeFormGroup.get('endDate')?.value;     // Not used by current service method
    // const validStartDate = startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate : undefined; // Not used
    // const validEndDate = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : undefined;         // Not used

    // Call getCompanyBookings with only companyId
    this.bookingService.getCompanyBookings(this.companyId).subscribe({
      next: (bookings: Booking[]) => {
        this.bookings = bookings;
        this.applyFilters(); // Apply filters which sets dataSource and totalItems
        this.loading = false;
        // Paginator is linked in ngAfterViewInit and updated via applyFilters
      },
      error: (err: any) => { // Explicitly type error
        this.error = 'Failed to load bookings. Please try again.';
        this.loading = false;
        console.error('Error loading bookings:', err);
        this.bookings = []; // Clear data on error
        this.applyFilters(); // Update table display
      }
    });
  }

  applyFilters(): void {
    const status = this.filterForm.get('status')?.value || 'ALL';
    const searchTerm = (this.filterForm.get('searchTerm')?.value || '').toLowerCase();

    this.filteredBookings = this.bookings.filter(booking => {
      const statusMatch = status === 'ALL' || booking.status === status;
      if (!statusMatch) return false;

      if (searchTerm) {
        const searchFields = [
          booking.id,
          booking.customerName,
          booking.customerEmail,
          booking.customerPhone,
          booking.routeName,
          // booking.bus?.registrationNumber, // Removed: 'bus' does not exist on Booking model
          // booking.schedule?.departureTime, // Removed: 'schedule' does not exist on Booking model
          booking.departureTime, // Added: Search directly on departureTime if needed
          booking.arrivalTime,   // Added: Search directly on arrivalTime if needed
          booking.seatNumbers,   // Added: Search on seatNumbers
          booking.amount?.toString() // Added: Search on amount (convert to string)
        ];
        const termMatch = searchFields.some(field =>
          field && field.toString().toLowerCase().includes(searchTerm)
        );
        if (!termMatch) return false;
      }

      return true;
    });

    this.totalItems = this.filteredBookings.length;
    this.dataSource.data = this.filteredBookings;

    // Reset paginator to the first page when filters change
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    } else {
      // If paginator isn't ready yet (e.g., initial load before ngAfterViewInit),
      // it will be assigned later. The data source update is sufficient for now.
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: 'ALL',
      searchTerm: ''
    });
    this.dateRangeFormGroup.reset({ // Reset date range form as well
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date()
    });
    // Re-apply filters to the existing data, or reload if desired
    this.applyFilters();
    // Optionally call this.loadBookings() if you want to fetch fresh data on reset
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    // Paginator handles page index changes automatically with dataSource
  }

  updateBookingStatus(booking: Booking, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'): void {
    if (!booking || !booking.id) {
      this.error = 'Invalid booking information provided.';
      console.error('Update status called with invalid booking:', booking);
      return;
    }

    this.loading = true;
    this.bookingService.updateBookingStatus(booking.id, status).subscribe({
      next: (updatedBooking) => {
        const index = this.bookings.findIndex(b => b.id === booking.id);
        if (index !== -1) {
          // Merge updates: Preserve existing fields, update changed ones
          this.bookings[index] = { ...this.bookings[index], ...updatedBooking };
          // Ensure status is explicitly updated if not returned by backend merge
          this.bookings[index].status = status;
          this.applyFilters(); // Re-apply filters to update the view
        }
        this.loading = false;
      },
      error: (err: any) => { // Explicitly type error
        this.error = `Failed to update booking status to ${status}. Please try again.`;
        this.loading = false;
        console.error('Error updating booking status:', err);
      }
    });
  }

  cancelBooking(bookingId: string): void {
    if (!bookingId) {
      this.error = 'Invalid booking ID provided for cancellation.';
      return;
    }
    const bookingToCancel = this.bookings.find(b => b.id === bookingId);
    if (!bookingToCancel) {
      this.error = `Booking with ID ${bookingId} not found.`;
      return;
    }
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.updateBookingStatus(bookingToCancel, 'CANCELLED');
    }
  }

  deleteBooking(bookingId: string): void {
    if (!bookingId) {
      this.error = 'Invalid booking ID provided for deletion.';
      return;
    }
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      this.loading = true;
      this.bookingService.deleteBooking(bookingId).subscribe({
        next: () => {
          this.bookings = this.bookings.filter(b => b.id !== bookingId);
          this.applyFilters();
          this.loading = false;
        },
        error: (err: any) => { // Explicitly type error
          this.error = 'Failed to delete booking. Please try again.';
          this.loading = false;
          console.error('Error deleting booking:', err);
        }
      });
    }
  }

  refreshBookings(): void {
    this.getCompanyId(); // Re-check company ID and reload
  }

  getStatusChipColor(status: string): ThemePalette {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'PENDING': return 'accent';
      case 'CANCELLED': return 'warn';
      default: return undefined;
    }
  }

  getNestedValue(obj: any, path: string): any {
    // This function might not be needed anymore if not accessing nested props
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
  }

  protected readonly Math = Math;
}

