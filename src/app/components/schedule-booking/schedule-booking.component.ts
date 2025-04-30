import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ScheduleService, Schedule } from '../../services/schedule.services';
import { BookingService } from '../../services/bus-booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-schedule-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="booking-container">
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading schedule details...</p>
      </div>

      <div *ngIf="!loading && !schedule" class="error-message">
        <h3>Schedule not found</h3>
        <p>The schedule you're looking for could not be found.</p>
        <button mat-raised-button color="primary" routerLink="/schedule-search">
          <mat-icon>search</mat-icon> Search Schedules
        </button>
      </div>

      <div *ngIf="!loading && schedule">
        <mat-card class="schedule-summary">
          <mat-card-content>
            <h2>Booking Summary</h2>
            <div class="schedule-header">
              <div>
                <h3>{{ schedule.routeName }}</h3>
                <p class="bus-type">{{ schedule.busType }}</p>
              </div>
              <div class="price-tag">
                <span class="price">{{ schedule.price | currency:'RWF':'symbol':'1.0-0' }}</span>
                <span class="per-person">per person</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="schedule-details">
              <div class="time-details">
                <div class="departure">
                  <p class="time">{{ formatTime(schedule.departureTime) }}</p>
                  <p class="date">{{ formatDate(schedule.departureTime) }}</p>
                  <p class="location">{{ schedule.sourceLocation.locationName }}</p>
                  <p class="city">{{ schedule.sourceLocation.city }}</p>
                </div>

                <div class="journey-line">
                  <span class="duration">{{ calculateDuration(schedule.departureTime, schedule.arrivalTime) }}</span>
                </div>

                <div class="arrival">
                  <p class="time">{{ formatTime(schedule.arrivalTime) }}</p>
                  <p class="date">{{ formatDate(schedule.arrivalTime) }}</p>
                  <p class="location">{{ schedule.destinationLocation.locationName }}</p>
                  <p class="city">{{ schedule.destinationLocation.city }}</p>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="bus-details">
              <p><mat-icon>event_seat</mat-icon> {{ schedule.availableSeats }} seats available</p>
              <p><mat-icon>directions_bus</mat-icon> Bus #{{ schedule.busNumber }}</p>
              <p><mat-icon>person</mat-icon> {{ passengers }} passenger(s)</p>
              <p><mat-icon>attach_money</mat-icon> Total: {{ schedule.price * passengers | currency:'RWF':'symbol':'1.0-0' }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="booking-form">
          <mat-card-content>
            <h2>Passenger Details</h2>
            <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="passengerName" placeholder="Enter your full name">
                <mat-error *ngIf="bookingForm.get('passengerName')?.hasError('required')">
                  Full name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="passengerEmail" placeholder="Enter your email">
                <mat-error *ngIf="bookingForm.get('passengerEmail')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="bookingForm.get('passengerEmail')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="passengerPhone" placeholder="Enter your phone number">
                <mat-error *ngIf="bookingForm.get('passengerPhone')?.hasError('required')">
                  Phone number is required
                </mat-error>
              </mat-form-field>

              <div class="booking-actions">
                <button mat-button routerLink="/schedule-search">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="bookingForm.invalid || isSubmitting">
                  <mat-icon>payment</mat-icon> Proceed to Payment
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .booking-container {
      max-width: 900px;
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

    .schedule-summary, .booking-form {
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
    }

    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .bus-type {
      color: #666;
      font-size: 14px;
    }

    .price-tag {
      text-align: right;
    }

    .price {
      font-size: 24px;
      font-weight: bold;
      color: #1a73e8;
    }

    .per-person {
      display: block;
      font-size: 12px;
      color: #666;
    }

    .schedule-details {
      margin: 20px 0;
    }

    .time-details {
      display: flex;
      align-items: center;
    }

    .departure, .arrival {
      flex: 1;
    }

    .time {
      font-size: 18px;
      font-weight: bold;
    }

    .date {
      color: #666;
    }

    .location {
      font-weight: 500;
    }

    .city {
      color: #666;
      font-size: 14px;
    }

    .journey-line {
      position: relative;
      height: 2px;
      background-color: #ddd;
      flex: 1;
      margin: 0 15px;
    }

    .duration {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #f5f5f5;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      white-space: nowrap;
    }

    .bus-details {
      margin: 20px 0;
    }

    .bus-details p {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }

    .bus-details mat-icon {
      margin-right: 8px;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    .booking-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .time-details {
        flex-direction: column;
      }

      .departure, .arrival {
        margin-bottom: 20px;
      }

      .journey-line {
        display: none;
      }
    }
  `]
})
export class ScheduleBookingComponent implements OnInit {
  schedule: Schedule | null = null;
  loading = true;
  isSubmitting = false;
  passengers = 1;
  bookingForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private bookingService: BookingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.bookingForm = this.fb.group({
      passengerName: ['', Validators.required],
      passengerEmail: ['', [Validators.required, Validators.email]],
      passengerPhone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get schedule ID from route params
    this.route.paramMap.subscribe(params => {
      const scheduleId = Number(params.get('id'));
      
      // Get passengers from query params
      this.route.queryParamMap.subscribe(queryParams => {
        const passengersParam = queryParams.get('passengers');
        if (passengersParam) {
          this.passengers = Number(passengersParam);
        }
        
        // Load schedule details
        this.loadSchedule(scheduleId);
      });
    });

    // Pre-fill form with user data if logged in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      if ('email' in currentUser) {
        // User account
        this.bookingForm.patchValue({
          passengerName: currentUser.name || '',
          passengerEmail: currentUser.email || '',
          passengerPhone: currentUser.phone || ''
        });
      } else {
        // Company account
        this.bookingForm.patchValue({
          passengerName: currentUser.contactPerson || '',
          passengerEmail: currentUser.contactEmail || '',
          passengerPhone: currentUser.contactPhone || ''
        });
      }
    }
  }

  loadSchedule(scheduleId: number): void {
    this.loading = true;
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (schedule) => {
        this.schedule = schedule;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        this.loading = false;
        this.snackBar.open('Failed to load schedule details', 'Close', { duration: 5000 });
      }
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(dateTime: Date): string {
    if (!dateTime) return '';
    const d = new Date(dateTime);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  calculateDuration(departureTime: Date, arrivalTime: Date): string {
    if (!departureTime || !arrivalTime) return '';
    
    const depTime = new Date(departureTime).getTime();
    const arrTime = new Date(arrivalTime).getTime();
    const diffMs = arrTime - depTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  onSubmit(): void {
    if (this.bookingForm.valid && this.schedule) {
      this.isSubmitting = true;
      
      const bookingData = {
        scheduleId: this.schedule.id,
        routeId: this.schedule.routeId,
        customerName: this.bookingForm.get('passengerName')?.value,
        customerEmail: this.bookingForm.get('passengerEmail')?.value,
        customerPhone: this.bookingForm.get('passengerPhone')?.value,
        seats: this.passengers,
        amount: this.schedule.price * this.passengers,
        date: new Date(this.schedule.departureTime)
      };

      this.bookingService.bookTicket(bookingData).subscribe({
        next: (booking) => {
          this.isSubmitting = false;
          this.snackBar.open('Booking successful!', 'Close', { duration: 5000 });
          this.router.navigate(['/booking-confirmation', booking.id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating booking:', error);
          this.snackBar.open('Failed to create booking. Please try again.', 'Close', { duration: 5000 });
        }
      });
    }
  }
}
