import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { BookingService } from '../../services/bus-booking.service';
import { Booking } from '../../models/booking.model';
import {CurrencyPipe, formatDate, NgIf} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDivider} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

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
    MatButton

  ],
  styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
  bookingId: string | null = null;
  booking: Booking | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
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
