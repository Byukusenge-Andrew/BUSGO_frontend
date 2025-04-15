import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusBookingService } from '../../services/bus-booking.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>My Dashboard</h1>

      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>Total Bookings</h3>
          <p>{{ totalBookings }}</p>
        </div>
        <div class="stat-card">
          <h3>Upcoming Trips</h3>
          <p>{{ upcomingTrips }}</p>
        </div>
        <div class="stat-card">
          <h3>Completed Trips</h3>
          <p>{{ completedTrips }}</p>
        </div>
      </div>

      <div class="recent-bookings">
        <h2>Recent Bookings</h2>
        <div class="bookings-list" *ngIf="!loading; else loadingState">
          <div *ngIf="bookings.length === 0" class="no-bookings">
            <p>No bookings found</p>
            <a routerLink="/search" class="search-link">Search for buses</a>
          </div>
          <div *ngFor="let booking of bookings" class="booking-card">
            <div class="booking-info">
              <h3>{{ booking.route?.source }} → {{ booking.route?.destination }}</h3>
              <p>Date: {{ booking.travelDate | date:'mediumDate' }}</p>
              <p>Time: {{ booking.travelTime }}</p>
              <p>Seats: {{ booking.seats }}</p>
              <p>Status: <span [class]="booking.status">{{ booking.status }}</span></p>
            </div>
            <div class="booking-actions">
              <button *ngIf="booking.status === 'CONFIRMED'"
                      (click)="cancelBooking(booking.id)"
                      class="cancel-btn">
                Cancel Booking
              </button>
              <button *ngIf="booking.status === 'CONFIRMED'"
                      class="view-ticket-btn"
                      (click)="viewTicket(booking.id)">
                View Ticket
              </button>
            </div>
          </div>
        </div>
        <ng-template #loadingState>
          <div class="loading">Loading bookings...</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: var(--primary-black);
      margin-bottom: 2rem;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;

      h3 {
        color: var(--text-dark);
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--primary-black);
        font-size: 2rem;
        font-weight: 600;
      }
    }

    .recent-bookings {
      h2 {
        color: var(--primary-black);
        margin-bottom: 1.5rem;
      }
    }

    .bookings-list {
      display: grid;
      gap: 1.5rem;
    }

    .booking-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .booking-info {
        h3 {
          color: var(--primary-black);
          margin-bottom: 0.5rem;
        }

        p {
          color: var(--text-dark);
          margin: 0.25rem 0;
        }

        .CONFIRMED {
          color: #28a745;
        }

        .CANCELLED {
          color: #dc3545;
        }

        .COMPLETED {
          color: #6c757d;
        }
      }

      .booking-actions {
        display: flex;
        gap: 1rem;

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;

          &.cancel-btn {
            background-color: #dc3545;
            color: white;

            &:hover {
              background-color: darken(#dc3545, 10%);
            }
          }

          &.view-ticket-btn {
            background-color: var(--primary-red);
            color: white;

            &:hover {
              background-color: darken(#ff4c30, 10%);
            }
          }
        }
      }
    }

    .no-bookings {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      p {
        color: var(--text-dark);
        margin-bottom: 1rem;
      }

      .search-link {
        color: var(--primary-red);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-dark);
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  bookings: any[] = [];
  loading = true;
  totalBookings = 0;
  upcomingTrips = 0;
  completedTrips = 0;

  constructor(private bookingService: BusBookingService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.calculateStats(bookings);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading = false;
      }
    });
  }

  calculateStats(bookings: any[]) {
    this.totalBookings = bookings.length;
    this.upcomingTrips = bookings.filter(b =>
      b.status === 'CONFIRMED' &&
      new Date(b.travelDate) > new Date()
    ).length;
    this.completedTrips = bookings.filter(b =>
      b.status === 'COMPLETED'
    ).length;
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
        }
      });
    }
  }

  viewTicket(bookingId: number) {
    // TODO: Implement ticket viewing functionality
    console.log('View ticket:', bookingId);
  }
}
