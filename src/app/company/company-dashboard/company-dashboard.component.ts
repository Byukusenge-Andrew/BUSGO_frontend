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
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/bus-booking.service';
import { BusService } from '../../services/bus.service';
import { RouteService } from '../../services/bus-route.service';
import { Subscription, forkJoin } from 'rxjs';
import { ScheduleService } from '../../services/schedule.services';
import { Schedule } from '../../models/schedule.model';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentStatus } from '../../models/payment.model';
import { Booking } from '../../models/booking.model';
import { Bus } from '../../services/bus.service';
import { Route } from '../../services/bus-route.service';

interface CompanyStats {
  totalBuses: number;
  activeRoutes: number;
  totalBookings: number;
  todayBookings: number;
  totalSchedules: number;
  revenue: number;
  totalPayments: number;
  completedPayments: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  route: string;
  date: Date;
  seats: number;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  paymentStatus?: PaymentStatus; // Add payment status
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
    MatProgressSpinnerModule,
    BaseChartDirective
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

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>credit_card</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completedPayments }}/{{ stats.totalPayments }}</div>
                <div class="stat-label">Completed Payments</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="charts-section">
          <mat-card>
            <mat-card-title>Revenue Trends</mat-card-title>
            <mat-card-content class="chart-container">
              <canvas baseChart
                [data]="revenueChartData"
                [options]="revenueChartOptions"
                [type]="'line'">
              </canvas>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-title>Booking Distribution</mat-card-title>
            <mat-card-content class="chart-container">
              <canvas baseChart
                [data]="bookingDistributionData"
                [options]="bookingDistributionOptions"
                [type]="'pie'">
              </canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="dashboard-actions">
          <button mat-raised-button color="primary" routerLink="/company/routes">
          <mat-icon>route</mat-icon>  Manage Routes
          </button>
          <button mat-raised-button color="accent" routerLink="/company/schedules">
            <mat-icon>schedule</mat-icon> Manage Schedules
          </button>
          <button mat-raised-button color="warn" routerLink="/company/bookings">
             <mat-icon>confirmation_number</mat-icon> View Bookings
          </button>
          <button mat-raised-button color="primary" routerLink="/company/buses/add">
           <mat-icon>add</mat-icon> Add Bus
          </button>
          <button mat-raised-button routerLink="/company/profile">
         <mat-icon>business</mat-icon> Company Profile
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
                  <mat-list-item *ngFor="let booking of recentBookings" >
                    <div class="booking-item">
                      <div class="booking-info">
                        <div class="customer-name">{{ booking.customerName }}</div>
                        <div class="route-info">{{ booking.route }}</div>
                        <div class="booking-date">{{ booking.date | date:'mediumDate' }}</div>
                      </div>
                      <div class="booking-details">
                        <mat-chip-listbox aria-label="Booking Status">
                          <mat-chip [color]="getStatusColor(booking.status)" selected>
                            {{ booking.status }}
                          </mat-chip>
                        </mat-chip-listbox>
                        <!-- Payment Status Chip -->
                        <mat-chip-listbox aria-label="Payment Status" *ngIf="booking.paymentStatus">
                          <mat-chip [color]="getPaymentStatusColor(booking.paymentStatus)" selected>
                            {{ booking.paymentStatus }}
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

          <div class="dashboard-right">
            <div class="quick-actions">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Quick Actions</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="action-buttons">
                    <button mat-stroked-button color="primary" routerLink="/company/routes/add">
                    <mat-icon>add_road</mat-icon> Add New Route
                    </button>
                    <button mat-stroked-button color="accent" routerLink="/company/schedules/add">
                      <mat-icon>add_task</mat-icon> Create Schedule
                    </button>
                    <button mat-stroked-button routerLink="/company/reports">
                       <mat-icon>assessment</mat-icon> Generate Report
                    </button>
                    <button mat-stroked-button routerLink="/company/buses/add">
                      <mat-icon>add</mat-icon> Add Bus
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="recent-payments">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Recent Payments</mat-card-title>
                  <button mat-button color="primary" routerLink="/company/payments">View All</button>
                </mat-card-header>
                <mat-card-content>
                  <mat-list>
                    <mat-list-item *ngFor="let payment of recentPayments">
                      <div class="payment-item">
                        <div class="payment-info">

                          <div class="payment-method">{{ payment.paymentMethod }}</div>
                          <div class="payment-date">{{ payment.paymentDate | date:'mediumDate' }}</div>
                        </div>
                        <div class="payment-details">
                          <mat-chip-listbox>
                            <mat-chip [color]="getPaymentStatusColor(payment.status)" selected>
                              {{ payment.status }}
                            </mat-chip>
                          </mat-chip-listbox>
                          <div class="payment-amount">RWF {{ payment.amount | number }}</div>
                        </div>
                      </div>
                    </mat-list-item>
                    <div *ngIf="recentPayments.length === 0" class="no-payments">
                      <p>No recent payments found</p>
                    </div>
                  </mat-list>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      --primary-black: #333;
      --primary-red: #d32f2f;
      --text-light: #f5f5f5;
      --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      --primary-bg: #ffffff;
      --accent-color: #b71c1c;
      --text-dark: #555; /* Define text-dark if not globally available */
    }
    .booking-info {
      margin-top: 10px;
         margin-bottom: 10px;
      padding: 10px;
    }

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
      border-radius: 8px; /* Add border-radius for consistency */
      box-shadow: var(--card-shadow); /* Add shadow for consistency */
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
      color: var(--primary-red);
    }

    .dashboard-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .dashboard-actions button mat-icon {
        margin-right: 8px; /* Add space between icon and text */
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    /* Charts Section Styles */
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Use auto-fit */
      gap: 1.5rem;
      margin: 1.5rem 0;

      mat-card {
        border-radius: 8px;
        box-shadow: var(--card-shadow);
        mat-card-title {
           color: var(--primary-black);
           font-size: 1.25rem; /* Consistent title size */
           font-weight: 500;
           margin-bottom: 1rem;
           padding: 0 1rem;
        }
      }
    }

    .chart-container { /* Style for chart canvas container */
        padding: 1rem;
        background-color: rgba(0, 0, 0, 0.02); /* Slight background for visual separation */
        border-radius: 4px;
        canvas {
            max-width: 100%;
            height: 250px; /* Fixed height for charts */
        }
    }


    @media (max-width: 992px) { /* Adjusted breakpoint */
      .dashboard-content {
        grid-template-columns: 1fr;
      }
      .stats-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Smaller cards on medium screens */
      }
    }
     @media (max-width: 768px) { /* Keep breakpoint for smaller screens */
        .stats-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Even smaller cards */
        }
        .dashboard-actions {
            flex-direction: column; /* Stack actions vertically */
            align-items: stretch; /* Make buttons full width */
        }
        .dashboard-actions button {
            width: 100%; /* Ensure buttons take full width */
        }
         .charts-section {
           grid-template-columns: 1fr; /* Stack charts on smaller screens */
         }
         .chart-container canvas {
            height: 200px; /* Smaller height on mobile */
        }
    }

    .dashboard-right {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .payment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0.5rem 0;
    }

    .payment-info {
      flex: 1;
    }

    .payment-id {
      font-weight: 500;
      color: var(--primary-black);
    }

    .payment-method {
      color: var(--text-dark);
      font-size: 0.875rem;
    }

    .payment-date {
      color: var(--text-light);
      font-size: 0.75rem;
    }

    .payment-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .payment-amount {
      font-weight: 500;
      color: var(--primary-black);
    }

    .no-payments {
      padding: 2rem;
      text-align: center;
      color: var(--text-light);
    }

    .booking-item {
      display: flex;
      justify-content: space-between;\r
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
      justify-content: flex-start; /* Align text to the left */
    }
    .action-buttons button mat-icon {
        margin-right: 8px; /* Space between icon and text */
    }

    /* Ensure mat-list-item content doesn\'t overflow */
    mat-list-item {
        height: auto !important; /* Allow item height to adjust */
        padding-top: 8px;
        padding-bottom: 8px;
    }
    mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    mat-card-title {
        margin-bottom: 0; /* Remove default margin if needed */
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
    totalSchedules: 0,
    revenue: 0,
    totalPayments: 0,
    completedPayments: 0
  };

  recentBookings: RecentBooking[] = [];
  recentPayments: Payment[] = []; // Using imported Payment type
  private subscriptions: Subscription[] = [];

  // Revenue Chart
  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenue',
        fill: true,
        tension: 0.4, // Slightly smoother line
        borderColor: '#d32f2f', // Use existing primary red
        backgroundColor: 'rgba(211, 47, 47, 0.2)', // Lighter red background
        pointBackgroundColor: '#d32f2f',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#d32f2f',
      }
    ]
  };

  public revenueChartOptions: ChartOptions<'line'> = { // Use ChartOptions
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'var(--primary-black)',
        }
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
        color: 'var(--primary-black)',
         font: {
          size: 16,
          weight: 'bold' as any
        }
      },
       tooltip: { // Improve tooltip appearance
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyColor: '#fff',
        titleColor: '#fff',
      }
    },
    scales: { // Style scales
      x: {
        ticks: { color: 'var(--text-dark)' },
         grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      y: {
        ticks: { color: 'var(--text-dark)' },
         grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };

  // Booking Distribution Chart
  public bookingDistributionData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Confirmed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'], // Example colors (Material Design like)
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  public bookingDistributionOptions: ChartOptions<'pie'> = { // Use ChartOptions
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
         labels: {
          color: 'var(--primary-black)',
        }
      },
      title: {
        display: true,
        text: 'Booking Status Distribution',
        color: 'var(--primary-black)',
         font: {
          size: 16,
          weight: 'bold' as any
        }
      },
       tooltip: { // Improve tooltip appearance
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyColor: '#fff',
        titleColor: '#fff',
      }
    }
  };

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private busService: BusService,
    private routeService: RouteService,
    private scheduleService: ScheduleService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Subscribe to the currentUser$ observable
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (user && 'companyName' in user) {
        this.companyName = user.companyName;
        this.companyId = user.companyId?.toString() || null;
        this.loadDashboardData(); // This method now loads all data including charts
      } else {
          this.loading = false; // Stop loading if no user/company found
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

    forkJoin({
      buses: this.busService.getCompanyBuses(this.companyId),
      schedules: this.scheduleService.getCompanySchedule(this.companyId),
      routes: this.routeService.getCompanyRoutes(this.companyId),
      bookings: this.bookingService.getCompanyBookings(this.companyId),
      payments: this.paymentService.getCompanyPayments(this.companyId)
    }).subscribe({
      next: ({ buses, schedules, routes, bookings, payments }) => {
        // Process stats (existing logic)
        this.stats.totalBuses = buses.length;
          this.stats.totalSchedules = schedules.length;
        this.stats.activeRoutes = routes.filter(route => route.active).length;

        this.stats.totalBookings = bookings.length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.stats.todayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        }).length;


        this.stats.totalPayments = payments.length;
        this.stats.completedPayments = payments.filter((payment: Payment) =>
          payment.status === 'COMPLETED'
        ).length;

         this.stats.revenue = payments
           .filter((payment: Payment) => payment.status === 'COMPLETED')
           .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Process recent data (existing logic)
        this.recentBookings = bookings
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((booking: any) => ({
            id: booking.id,
            customerName: booking.customerName || 'Unknown Customer',
            route: booking.routeName || 'Unknown Route',
            date: new Date(booking.date),
            seats: booking.seats || 1,
            amount: booking.amount || 0,
            status: booking.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED',
            paymentStatus: booking.paymentStatus as PaymentStatus | undefined
          }));

        this.recentPayments = payments
          .sort((a: Payment, b: Payment) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
          .slice(0, 5);

        // Process revenue data for chart
        const monthlyRevenue = new Array(6).fill(0);
        const months = Array.from({length: 6}, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return d.toLocaleString('default', { month: 'short' });
        }).reverse();

        payments.forEach(payment => {
          if (payment.status === 'COMPLETED') {
            const paymentDate = new Date(payment.paymentDate);
            const monthDiff = (new Date().getMonth() - paymentDate.getMonth() + 12) % 12;
            if (monthDiff < 6) {
              monthlyRevenue[monthDiff] += payment.amount || 0;
            }
          }
        });

        this.revenueChartData.labels = months;
        this.revenueChartData.datasets[0].data = monthlyRevenue.reverse();

        // Calculate booking distribution
        const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
        const pending = bookings.filter(b => b.status === 'PENDING').length;
        const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;

        this.bookingDistributionData.datasets[0].data = [confirmed, pending, cancelled];


        this.loading = false; // Set loading to false after all data is processed
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false; // Set loading to false even on error
      }
    });
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

  getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case 'COMPLETED':
        return 'primary';
      case 'PENDING':
        return 'accent';
      case 'FAILED':
        return 'warn';
      default:
        return '';
    }
  }
}
