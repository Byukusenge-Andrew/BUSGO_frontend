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
  paymentStatus?: PaymentStatus;
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
      <!-- Balanced Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>🚌 Company Dashboard</h1>
          <p class="welcome-message">Welcome back, <strong>{{ companyName }}</strong></p>
        </div>
        <div class="header-decoration"></div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="60" color="primary"></mat-progress-spinner>
        <p>Loading dashboard insights...</p>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Balanced Stats Grid -->
        <div class="stats-grid">
          <mat-card class="stat-card buses">
            <mat-card-content>
              <div class="stat-icon buses-icon">
                <mat-icon>directions_bus</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalBuses }}</div>
                <div class="stat-label">Total Buses</div>
                <div class="stat-trend">+2 this month</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card routes">
            <mat-card-content>
              <div class="stat-icon routes-icon">
                <mat-icon>route</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeRoutes }}</div>
                <div class="stat-label">Active Routes</div>
                <div class="stat-trend">{{ stats.activeRoutes > 5 ? 'Excellent coverage' : 'Expand network' }}</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card bookings">
            <mat-card-content>
              <div class="stat-icon bookings-icon">
                <mat-icon>confirmation_number</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalBookings }}</div>
                <div class="stat-label">Total Bookings</div>
                <div class="stat-trend">{{ stats.todayBookings }} today</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card schedules">
            <mat-card-content>
              <div class="stat-icon schedules-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalSchedules }}</div>
                <div class="stat-label">Active Schedules</div>
                <div class="stat-trend">Well organized</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card revenue">
            <mat-card-content>
              <div class="stat-icon revenue-icon">
                <mat-icon>payments</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.revenue | number:'1.0-0' }}</div>
                <div class="stat-label">Total Revenue (RWF)</div>
                <div class="stat-trend">{{ getRevenueGrowth() }}</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card payments">
            <mat-card-content>
              <div class="stat-icon payments-icon">
                <mat-icon>credit_card</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completedPayments }}/{{ stats.totalPayments }}</div>
                <div class="stat-label">Completed Payments</div>
                <div class="stat-trend">{{ getPaymentRate() }}% success rate</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Balanced Quick Actions -->
        <div class="quick-actions-section">
          <h2>
            <mat-icon>flash_on</mat-icon>
            Quick Actions
          </h2>
          <div class="dashboard-actions">
            <button mat-raised-button color="primary" routerLink="/company/routes">
              <mat-icon>route</mat-icon>
              Manage Routes
            </button>
            <button mat-raised-button routerLink="/company/schedules" class="secondary-btn">
              <mat-icon>schedule</mat-icon>
              Manage Schedules
            </button>
            <button mat-raised-button routerLink="/company/bookings" class="secondary-btn">
              <mat-icon>confirmation_number</mat-icon>
              View Bookings
            </button>
            <button mat-raised-button routerLink="/company/buses/add" class="secondary-btn">
              <mat-icon>add</mat-icon>
              Add Bus
            </button>
            <button mat-stroked-button color="primary" routerLink="/company/profile">
              <mat-icon>business</mat-icon>
              Company Profile
            </button>
          </div>
        </div>

        <!-- Balanced Charts Section -->
        <div class="charts-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>trending_up</mat-icon>
                Revenue Trends
              </mat-card-title>
              <mat-card-subtitle>Monthly revenue performance</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="chart-container">
              <canvas baseChart
                      [data]="revenueChartData"
                      [options]="revenueChartOptions"
                      [type]="'line'">
              </canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>pie_chart</mat-icon>
                Booking Distribution
              </mat-card-title>
              <mat-card-subtitle>Status breakdown</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="chart-container">
              <canvas baseChart
                      [data]="bookingDistributionData"
                      [options]="bookingDistributionOptions"
                      [type]="'pie'">
              </canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Balanced Content Grid -->
        <div class="dashboard-content">
          <!-- Recent Bookings -->
          <div class="recent-bookings">
            <mat-card class="content-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>receipt_long</mat-icon>
                  Recent Bookings
                </mat-card-title>
                <button mat-button color="primary" routerLink="/company/bookings">
                  <mat-icon>arrow_forward</mat-icon>
                  View All
                </button>
              </mat-card-header>
              <mat-card-content>
                <div class="booking-list">
                  <div *ngFor="let booking of recentBookings" class="booking-item">
                    <div class="booking-avatar">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="booking-info">
                      <div class="customer-name">{{ booking.customerName }}</div>
                      <div class="route-info">{{ booking.route }}</div>
                      <div class="booking-date">{{ booking.date | date:'MMM d, y' }}</div>
                    </div>
                    <div class="booking-details">
                      <div class="booking-amount">{{ booking.amount | number:'1.0-0' }} RWF</div>
                      <mat-chip [color]="getStatusColor(booking.status)" selected>
                        {{ booking.status }}
                      </mat-chip>
                      <mat-chip *ngIf="booking.paymentStatus" [color]="getPaymentStatusColor(booking.paymentStatus)" selected>
                        {{ booking.paymentStatus }}
                      </mat-chip>
                    </div>
                  </div>
                  <div *ngIf="recentBookings.length === 0" class="no-data">
                    <mat-icon>inbox</mat-icon>
                    <p>No recent bookings found</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Sidebar Content -->
          <div class="dashboard-sidebar">
            <!-- Quick Actions Card -->
            <mat-card class="content-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>speed</mat-icon>
                  Quick Actions
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="action-buttons">
                  <button mat-stroked-button color="primary" routerLink="/company/routes/add">
                    <mat-icon>add_road</mat-icon>
                    Add New Route
                  </button>
                  <button mat-stroked-button routerLink="/company/schedules" class="neutral-btn">
                    <mat-icon>add_task</mat-icon>
                    Create Schedule
                  </button>
                  <button mat-stroked-button routerLink="/company/reports" class="neutral-btn">
                    <mat-icon>assessment</mat-icon>
                    Generate Report
                  </button>
                  <button mat-stroked-button routerLink="/company/buses/add" class="neutral-btn">
                    <mat-icon>add</mat-icon>
                    Add Bus
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Recent Payments -->
            <mat-card class="content-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>payment</mat-icon>
                  Recent Payments
                </mat-card-title>
                <button mat-button color="primary" routerLink="/company/payments">
                  <mat-icon>arrow_forward</mat-icon>
                  View All
                </button>
              </mat-card-header>
              <mat-card-content>
                <div class="payment-list">
                  <div *ngFor="let payment of recentPayments" class="payment-item">
                    <div class="payment-icon">
                      <mat-icon>credit_card</mat-icon>
                    </div>
                    <div class="payment-info">
                      <div class="payment-method">{{ payment.paymentMethod }}</div>
                      <div class="payment-date">{{ payment.paymentDate | date:'MMM d, y' }}</div>
                    </div>
                    <div class="payment-details">
                      <div class="payment-amount">{{ payment.amount | number:'1.0-0' }} RWF</div>
                      <mat-chip [color]="getPaymentStatusColor(payment.status)" selected>
                        {{ payment.status }}
                      </mat-chip>
                    </div>
                  </div>
                  <div *ngIf="recentPayments.length === 0" class="no-data">
                    <mat-icon>inbox</mat-icon>
                    <p>No recent payments found</p>
                  </div>
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
      max-width: 1400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: 100vh;
    }

    /* Balanced Header */
    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
      padding: 2rem 0;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .welcome-message {
      font-size: 1.125rem;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    .welcome-message strong {
      color: #ff0000;
    }

    .header-decoration {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, #ff0000, #dc2626);
      border-radius: 2px;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .loading-container p {
      margin-top: 1.5rem;
      color: #64748b;
      font-size: 1.125rem;
      font-weight: 500;
    }

    /* Balanced Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
      background: white;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #e2e8f0;
    }

    .stat-card.revenue::before {
      background: linear-gradient(90deg,rgb(113, 113, 113),rgb(120, 118, 118));
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      gap: 1rem;
    }

    .stat-icon {
      border-radius: 12px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .buses-icon {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    }

    .routes-icon {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    }

    .bookings-icon {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    }

    .schedules-icon {
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    }

    .revenue-icon {
      background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    }

    .payments-icon {
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
    }

    .buses-icon mat-icon { color: #2563eb; }
    .routes-icon mat-icon { color: #059669; }
    .bookings-icon mat-icon { color: #d97706; }
    .schedules-icon mat-icon { color: #4f46e5; }
    .revenue-icon mat-icon { color:rgb(200, 200, 200); }
    .payments-icon mat-icon { color: #7c3aed; }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .stat-trend {
      color: #059669;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Balanced Quick Actions */
    .quick-actions-section {
      margin-bottom: 3rem;
    }

    .quick-actions-section h2 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1.5rem;
    }

    .quick-actions-section h2 mat-icon {
      color: #f59e0b;
    }

    .dashboard-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .dashboard-actions button {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .dashboard-actions button[color="primary"] {
      background-color: #ff0000;
      box-shadow: 0 4px 12px rgba(255, 0, 0, 0.25);
    }

    .dashboard-actions button[color="primary"]:hover {
      background-color: #dc2626;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 0, 0, 0.3);
    }

    .secondary-btn {
      background-color: #64748b !important;
      color: white !important;
      box-shadow: 0 4px 12px rgba(100, 116, 139, 0.25);
    }

    .secondary-btn:hover {
      background-color: #475569 !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(100, 116, 139, 0.3);
    }

    .dashboard-actions button mat-icon {
      font-size: 1.125rem;
      width: 1.125rem;
      height: 1.125rem;
    }

    /* Balanced Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .chart-card {
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      background: white;
    }

    .chart-card mat-card-header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .chart-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .chart-card mat-card-title mat-icon {
      color: #64748b;
    }

    .chart-card mat-card-subtitle {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }

    .chart-container {
      padding: 1.5rem;
      height: 300px;
    }

    .chart-container canvas {
      max-width: 100%;
      height: 100% !important;
    }

    /* Balanced Content Grid */
    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .content-card {
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin-bottom: 1.5rem;
      background: white;
    }

    .content-card mat-card-header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .content-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .content-card mat-card-title mat-icon {
      color: #64748b;
    }

    .content-card mat-card-content {
      padding: 0;
    }

    /* Booking List */
    .booking-list, .payment-list {
      padding: 0;
    }

    .booking-item, .payment-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      transition: all 0.3s ease;
    }

    .booking-item:hover, .payment-item:hover {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .booking-item:last-child, .payment-item:last-child {
      border-bottom: none;
    }

    .booking-avatar, .payment-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .booking-avatar mat-icon, .payment-icon mat-icon {
      color: #64748b;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .booking-info, .payment-info {
      flex: 1;
      margin-right: 1rem;
    }

    .customer-name, .payment-method {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .route-info, .payment-date {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .booking-date {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .booking-details, .payment-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .booking-amount, .payment-amount {
      font-weight: 700;
      color: #059669;
      font-size: 0.875rem;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem;
    }

    .action-buttons button {
      justify-content: flex-start;
      padding: 0.75rem 1rem;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .action-buttons button:hover {
      transform: translateX(4px);
    }

    .action-buttons button[color="primary"]:hover {
      background-color: rgba(255, 0, 0, 0.04);
    }

    .neutral-btn {
      border-color: #64748b !important;
      color: #64748b !important;
    }

    .neutral-btn:hover {
      background-color: rgba(100, 116, 139, 0.04) !important;
      border-color: #475569 !important;
      color: #475569 !important;
    }

    .action-buttons button mat-icon {
      margin-right: 0.75rem;
    }

    .action-buttons button[color="primary"] mat-icon {
      color: #ff0000;
    }

    .neutral-btn mat-icon {
      color: #64748b;
    }

    /* No Data State */
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #94a3b8;
      margin-bottom: 1rem;
    }

    .no-data p {
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    /* Material Design Overrides */
    :host ::ng-deep .mat-mdc-card {
      border-radius: 16px;
    }

    :host ::ng-deep .mat-mdc-chip {
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.75rem;
    }

    :host ::ng-deep .mat-primary {
      --mdc-filled-button-container-color: #ff0000;
      --mdc-outlined-button-outline-color: #ff0000;
      --mdc-text-button-label-text-color: #ff0000;
    }

    :host ::ng-deep .mat-mdc-raised-button.mat-primary {
      background-color: #ff0000;
    }

    :host ::ng-deep .mat-mdc-raised-button.mat-primary:hover {
      background-color: #dc2626;
    }

    :host ::ng-deep .mat-mdc-outlined-button.mat-primary {
      border-color: #ff0000;
      color: #ff0000;
    }

    :host ::ng-deep .mat-mdc-outlined-button.mat-primary:hover {
      background-color: rgba(255, 0, 0, 0.04);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .dashboard-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .dashboard-actions button {
        width: 100%;
        justify-content: center;
      }

      .charts-section {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .chart-container {
        height: 250px;
      }

      .booking-item, .payment-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .booking-details, .payment-details {
        align-items: flex-start;
        width: 100%;
      }
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
  recentPayments: Payment[] = [];
  private subscriptions: Subscription[] = [];

  // Balanced Revenue Chart
  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenue (RWF)',
        fill: true,
        tension: 0.4,
        borderColor: '#ff0000',
        backgroundColor: 'rgba(255, 0, 0, 0.08)',
        pointBackgroundColor: '#ff0000',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ff0000',
        pointHoverBorderWidth: 3,
      }
    ]
  };

  public revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#1e293b',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        bodyColor: '#fff',
        titleColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 11 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',

        }
      },
      y: {
        ticks: {
          color: '#64748b',
          font: { size: 11 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',

        }
      }
    }
  };

  // Balanced Booking Distribution Chart
  public bookingDistributionData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Confirmed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderColor: '#fff',
      borderWidth: 3,
      hoverBorderWidth: 4,
    }]
  };

  public bookingDistributionOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#1e293b',
          font: {
            size: 12,

          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        bodyColor: '#fff',
        titleColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
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
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (user && 'companyName' in user) {
        this.companyName = user.companyName;
        this.companyId = user.companyId?.toString() || null;
        this.loadDashboardData();
      } else {
        this.loading = false;
      }
    });

    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
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
        // Process stats
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

        // Process recent data
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

        // Process chart data
        this.updateChartData(payments, bookings);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private updateChartData(payments: Payment[], bookings: any[]): void {
    // Revenue chart data
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
          monthlyRevenue[5 - monthDiff] += payment.amount || 0;
        }
      }
    });

    this.revenueChartData.labels = months;
    this.revenueChartData.datasets[0].data = monthlyRevenue;

    // Booking distribution data
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;

    this.bookingDistributionData.datasets[0].data = [confirmed, pending, cancelled];
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

  getRevenueGrowth(): string {
    return this.stats.revenue > 100000 ? '+12% this month' : 'Growing steadily';
  }

  getPaymentRate(): number {
    if (this.stats.totalPayments === 0) return 0;
    return Math.round((this.stats.completedPayments / this.stats.totalPayments) * 100);
  }
}
