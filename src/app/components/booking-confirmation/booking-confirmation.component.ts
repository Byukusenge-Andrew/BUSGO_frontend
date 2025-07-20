import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { BookingService } from '../../services/bus-booking.service';
import { Booking } from '../../models/booking.model';
import {CurrencyPipe, formatDate, NgIf, AsyncPipe} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDivider} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import { CompanyService } from '../../services/company.services';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  imports: [
    MatProgressSpinner,
    NgIf,
    CurrencyPipe,
    MatCardContent,
    MatCard,
    MatDivider,
    MatIcon,
    RouterLink,
    MatButton,
    AsyncPipe
  ],
  styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
  bookingId: string | null = null;
  booking: Booking | null = null;
  loading = true;
  error = '';
  companyName$: Observable<string> = of('Unknown Company');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private companyService: CompanyService
  ) { }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    if (this.bookingId) {
      this.loadBooking();
    } else {
      this.error = 'Booking ID not provided';
      this.loading = false;
    }
  }

  loadBooking(): void {
    if (!this.bookingId) return;

    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (data) => {
        this.booking = data;
        this.loading = false;

        // Fetch company name if companyId is available
        if (this.booking.companyId) {
          this.companyName$ = this.companyService.getCompanyName(this.booking.companyId);
        }
      },
      error: (err) => {
        console.error('Error loading booking:', err);
        this.error = 'Failed to load booking details';
        this.loading = false;
      }
    });
  }

  printTicket(): void {
   this.router.navigate([`/ticket/${this.bookingId}`])
  }

  goToMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  protected readonly formatDate = formatDate;
}