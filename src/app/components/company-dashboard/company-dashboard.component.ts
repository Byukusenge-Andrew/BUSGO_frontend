import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/bus-booking.service';
import { BusService } from '../../services/bus.service';
import { RouteService } from '../../services/bus-route.service';
import {scheduled, Subscription} from 'rxjs';
import {ScheduleService} from '../../services/schedule.services';
import {Schedule} from '../../models/schedule.model';

interface CompanyStats {
  totalBuses: number;
  activeRoutes: number;
  totalBookings: number;
  todayBookings: number;
  totalSchedules:number;
  revenue: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  route: string;
  date: Date;
  seats: number;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Company Dashboard</h1>
        <p class="welcome-message">Welcome, {{ companyName }}</p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading dashboard data...</p>
      </div>

      <ng-container *ngIf="!loading">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>directions_bus</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalBuses }}</div>
                <div class="stat-label">Total Buses</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>route</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeRoutes }}</div>
                <div class="stat-label">Active Routes</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>confirmation_number</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalBookings }}</div>
                <div class="stat-label">Total Bookings</div>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalSchedules }}</div>
                <div class="stat-label">Total Schedule</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>today</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.todayBookings }}</div>
                <div class="stat-label">Total Busses</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card revenue">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>payments</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">RWF {{ stats.revenue | number }}</div>
                <div class="stat-label">Total Revenue</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="dashboard-actions">
          <button mat-raised-button color="primary" routerLink="/company/routes">
          <mat-icon></mat-icon>  Manage Routes
          </button>
          <button mat-raised-button color="accent" routerLink="/company/schedules">
            Manage Schedules
          </button>
          <button mat-raised-button color="warn" routerLink="/company/bookings">
             View Bookings
          </button>
          <button mat-raised-button color="primary" routerLink="company/buses/add">
           Add Bus
          </button>
          <button mat-raised-button routerLink="/company/profile">
         Company Profile
          </button>
        </div>

        <div class="dashboard-content">
          <div class="recent-bookings">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Recent Bookings</mat-card-title>
                <button mat-button color="primary" routerLink="/company/bookings">View All</button>
              </mat-card-header>
              <mat-card-content>
                <mat-list>
                  <mat-list-item *ngFor="let booking of recentBookings">
                    <div class="booking-item">
                      <div class="booking-info">
                        <div class="customer-name">{{ booking.customerName }}</div>
                        <div class="route-info">{{ booking.route }}</div>
                        <div class="booking-date">{{ booking.date | date:'mediumDate' }}</div>
                      </div>
                      <div class="booking-details">
                        <mat-chip-listbox>
                          <mat-chip [color]="getStatusColor(booking.status)" selected>
                            {{ booking.status }}
                          </mat-chip>
                        </mat-chip-listbox>
                        <div class="booking-amount">RWF {{ booking.amount | number }}</div>
                      </div>
                    </div>
                  </mat-list-item>
                  <div *ngIf="recentBookings.length === 0" class="no-bookings">
                    <p>No recent bookings found</p>
                  </div>
                </mat-list>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="quick-actions">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Quick Actions</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="action-buttons">
                  <button mat-stroked-button color="primary" routerLink="/company/routes/add">
                  Add New Route
                  </button>
                  <button mat-stroked-button color="accent" routerLink="/company/schedules/add">
                    Create Schedule
                  </button>
                  <button mat-stroked-button routerLink="/company/reports">
                     Generate Report
                  </button>
                  <button mat-stroked-button routerLink="/company/buses/add">
                    Add Busses
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0;
      color: var(--primary-black);
    }

    .welcome-message {
      color: var(--text-dark);
      margin-top: 0.5rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .loading-container p {
      margin-top: 1rem;
      color: var(--text-dark);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 1rem;
    }

    .stat-icon {
      background-color: rgba(0, 0, 0, 0.04);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
    }

    .stat-icon mat-icon {
      color: var(--primary-red);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary-black);
    }

    .stat-label {
      color: var(--text-dark);
      font-size: 0.875rem;
    }

    .revenue .stat-icon mat-icon {
      color: #4caf50;
    }

    .dashboard-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    .booking-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0.5rem 0;
    }

    .booking-info {
      flex: 1;
    }

    .customer-name {
      font-weight: 500;
      color: var(--primary-black);
    }

    .route-info {
      color: var(--text-dark);
      font-size: 0.875rem;
    }

    .booking-date {
      color: var(--text-light);
      font-size: 0.75rem;
    }

    .booking-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .booking-amount {
      font-weight: 500;
      color: var(--primary-black);
    }

    .no-bookings {
      padding: 2rem;
      text-align: center;
      color: var(--text-light);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-buttons button {
      justify-content: flex-start;
    }
  `]
})
export class CompanyDashboardComponent implements OnInit, OnDestroy {
  companyName = 'Rwanda Express';
  companyId: string | null = null;
  loading = true;

  stats: CompanyStats = {
    totalBuses: 0,
    activeRoutes: 0,
    totalBookings: 0,
    todayBookings: 0,
    totalSchedules:0,
    revenue: 0
  };

  recentBookings: RecentBooking[] = [];
  private subscriptions: Subscription[] = [];
  private schedule: any;

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private busService: BusService,
    private routeService: RouteService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    // Subscribe to the currentUser$ observable
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (user && 'companyName' in user) {
        this.companyName = user.companyName;
        this.companyId = user.companyId?.toString() || null;
        this.loadDashboardData();
      }
    });

    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadDashboardData(): void {
    if (!this.companyId) {
      this.loading = false;
      return;
    }

    // Load buses count
    const busSub = this.busService.getCompanyBuses(this.companyId).subscribe({
      next: (buses) => {
        this.stats.totalBuses = buses.length;
      },
      error: (error) => {
        console.error(error);
      }
    });
    const ScheduleBus = this.scheduleService.getCompanySchedule(this.companyId).subscribe(
      {
        next:(schedules) => {
          console.log("this is the shedule "+schedules)
          this.stats.totalSchedules = schedules.length;

        },
        error: (error) => {
          console.error(error);
        }
      }
    )

    // Load routes count
    const routeSub = this.routeService.getCompanyRoutes(this.companyId).subscribe({
      next: (routes) => {
        this.stats.activeRoutes = routes.filter(route => route.active).length;
      },
      error: (error) => {
        console.error(error);
      }
    });

    // Load bookings data
    const bookingSub = this.bookingService.getCompanyBookings(this.companyId).subscribe({
      next: (bookings) => {
        // Calculate total bookings
        this.stats.totalBookings = bookings.length;

        // Calculate today's bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.stats.todayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        }).length;

        // Calculate total revenue
        this.stats.revenue = bookings.reduce((total, booking) => {
          return total + (booking.amount || 0);
        }, 0);

        // Get recent bookings (last 5)
        this.recentBookings = bookings
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map(booking => ({
            id: booking.id,
            customerName: booking.customerName || 'Unknown Customer',
            route: booking.routeName || 'Unknown Route',
            date: new Date(booking.date),
            seats: booking.seats || 1,
            amount: booking.amount || 0,
            status: booking.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED'
          }));

        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });

    this.subscriptions.push(busSub, routeSub, bookingSub,ScheduleBus);
  }

  getStatusColor(status: string): string {
    switch (status) {
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
