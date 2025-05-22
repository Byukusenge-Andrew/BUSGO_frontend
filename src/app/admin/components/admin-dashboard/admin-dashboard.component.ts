import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Route, RouterModule} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {CanvasJS, CanvasJSAngularChartsModule} from '@canvasjs/angular-charts';
import { AdminService, AdminUserStats } from '../../../services/admin.service';
import { BookingService } from '../../../services/bus-booking.service';
import { RouteService } from '../../../services/bus-route.service';
import {Observable, forkJoin, of, Subject, ObservedValueOf} from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

interface PopularRoute {
  routeName: string;
  bookingCount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CanvasJSAngularChartsModule,
  ],
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button mat-icon-button color="primary" (click)="refreshAnalytics()" title="Refresh Analytics">
          <mat-icon>refresh</mat-icon>
        </button>
      </header>

      <!-- Navigation -->
      <nav class="nav-links">
        <button mat-raised-button color="primary" routerLink="users">
          <mat-icon>people</mat-icon> Manage Users
        </button>
        <button mat-raised-button color="primary" routerLink="companies">
          <mat-icon>business</mat-icon> Manage Companies
        </button>
        <button mat-raised-button color="primary" routerLink="routes">
          <mat-icon>map</mat-icon> Manage Routes
        </button>
        <button mat-raised-button color="primary" routerLink="bookings">
          <mat-icon>event</mat-icon> Manage Bookings
        </button>
      </nav>

      <!-- Analytics Section -->
      <mat-grid-list [cols]="breakpoint" rowHeight="350px" gutterSize="20px">
        <!-- User Statistics (Pie Chart) -->
        <mat-grid-tile>
          <mat-card>
            <mat-card-title>User Statistics</mat-card-title>
            <mat-card-content class="chart-card-content">
              <mat-spinner *ngIf="loading"></mat-spinner>
              <div *ngIf="!loading" class="chart-container">
                <canvasjs-chart [options]="userChartOptions"></canvasjs-chart>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Booking Trends (Line Chart) -->
        <mat-grid-tile>
          <mat-card>
            <mat-card-title>Booking Trends (Last 30 Days)</mat-card-title>
            <mat-card-content class="chart-card-content">
              <mat-spinner *ngIf="loading"></mat-spinner>
              <div *ngIf="!loading" class="chart-container">
                <canvasjs-chart [options]="bookingChartOptions"></canvasjs-chart>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Top 5 Popular Routes (Pie Chart) -->
        <mat-grid-tile colspan="2">
          <mat-card>
            <mat-card-title>Top 5 Popular Routes</mat-card-title>
            <mat-card-content class="chart-card-content">
              <mat-spinner *ngIf="loading"></mat-spinner>
              <div *ngIf="!loading" class="chart-container">
                <canvasjs-chart [options]="routeChartOptions"></canvasjs-chart>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <router-outlet></router-outlet>
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
      --text-dark: #555;
    }

    .admin-dashboard {
      padding: 2rem;
      background: var(--primary-bg);
      min-height: 100vh;
      color: var(--primary-black);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--text-light);
      box-shadow: var(--card-shadow);
      border-radius: 8px;
    }

    h1 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0;
    }

    .nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .nav-links button {
      transition: transform 0.2s ease, background-color 0.3s ease;
    }

    .nav-links button:hover {
      transform: translateY(-2px);
      background-color: var(--accent-color);
    }

    mat-grid-list {
      background: var(--text-light);
      padding: 1rem;
      border-radius: 8px;
      box-shadow: var(--card-shadow);
    }

    mat-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      box-shadow: var(--card-shadow);
      transition: transform 0.3s ease;
    }

    mat-card:hover {
      transform: translateY(-4px);
    }

    mat-card-title {
      font-size: 1.3rem;
      font-weight: 500;
      color: var(--primary-black);
      margin-bottom: 1rem;
      padding: 0 1rem;
    }

    .chart-card-content {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
    }

    .chart-container {
      width: 100%;
      height: 100%;
      max-height: 300px;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      padding: 0.5rem;
    }

    mat-spinner {
      margin: auto;
    }

    /* Responsive Design */
    @media (max-width: 960px) {
      mat-grid-list {
        padding: 0.5rem;
      }
      mat-card-title {
        font-size: 1.1rem;
      }
      .chart-container {
        max-height: 250px;
      }
    }

    @media (max-width: 600px) {
      .admin-dashboard {
        padding: 1rem;
      }
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      h1 {
        font-size: 1.5rem;
      }
      .nav-links {
        flex-direction: column;
        align-items: stretch;
      }
      .nav-links button {
        width: 100%;
      }
      .chart-container {
        max-height: 200px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  userChartOptions: any = {};
  bookingChartOptions: any = {};
  routeChartOptions: any = {};
  loading = true;
  breakpoint = 2;
  private refreshSubject = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private bookingService: BookingService,
    private routeService: RouteService
  ) {
    this.setBreakpoint();
  }

  ngOnInit(): void {
    this.loadAnalytics();
    this.refreshSubject.subscribe(() => this.loadAnalytics());
    window.addEventListener('resize', () => this.setBreakpoint());
  }

  ngOnDestroy(): void {
    this.refreshSubject.unsubscribe();
    window.removeEventListener('resize', () => this.setBreakpoint());
  }

  refreshAnalytics(): void {
    this.loading = true;
    this.refreshSubject.next();
  }

  private loadAnalytics(): void {
    this.loading = true;
    forkJoin({
      userStats: this.adminService.getUserStats().pipe(
        catchError(() => of({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, usersByRole: {} as { [key: string]: number } }))
      ),
      bookings: this.getBookingTrends().pipe(catchError(() => of([] as { date: string; count: number }[]))),
      popularRoutes: this.routeService.getPopularRoutes('5').pipe(
      catchError(() => of([] as PopularRoute[]))
    )
    }).subscribe({
      next: ({ userStats, bookings, popularRoutes }) => {
        this.setupUserChart(userStats);
        this.setupBookingChart(bookings);

        const formattedPopularRoutes = (popularRoutes as any[]).map(route => ({
          routeName: route.routeName,
          bookingCount: route.bookingCount || 0
        }));

        this.setupRouteChart(formattedPopularRoutes);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.loading = false;
      }
    });
  }

  private getBookingTrends(): Observable<{ date: string; count: number }[]> {
    console.warn("getBookingTrends needs a proper service implementation calling the backend.");
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return of(this.generateMockBookingTrends(thirtyDaysAgo, today));
  }

  private generateMockBookingTrends(startDate: Date, endDate: Date): { date: string; count: number }[] {
    const data = [];
    let currentDate = new Date(startDate);
    while(currentDate <= endDate) {
      data.push({
        date: currentDate.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  }

  private setupUserChart(userStats: AdminUserStats): void {
    const dataPoints = Object.keys(userStats.usersByRole).map(role => ({
      y: userStats.usersByRole[role],
      name: role.charAt(0).toUpperCase() + role.slice(1) + ' Users'
    }));

    this.userChartOptions = {
      animationEnabled: true,
      theme: "light2",
      exportEnabled: false,
      title: {
        text: "User Distribution by Role",
        fontColor: "var(--primary-black)",
        fontSize: 18,
        fontWeight: "bold"
      },
      legend: {
        cursor: "pointer",
        itemmouseover: function(e: any) { e.chart.data[0].toolTipContent = "<b>{name}</b>: {y} (#percent)"; },
        itemmouseout: function(e: any) { e.chart.data[0].toolTipContent = "<b>{name}</b>: {y} (#percent)"; },
        itemclick: function(e: any) {
          if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        },
        fontColor: "var(--primary-black)"
      },
      data: [{
        type: "pie",
        showInLegend: true,
        toolTipContent: "<b>{name}</b>: {y} (#percent)",
        indexLabel: "{name} - #percent",
        colorSet: "customUserColorSet",
        dataPoints: dataPoints
      }]
    };

    (CanvasJS as any).addColorSet("customUserColorSet", [
      "#4299e1",
      "#48bb78",
      "#f6e05e",
      "#f687b3",
      "#9f7aea"
    ]);
  }

  private setupBookingChart(bookings: { date: string; count: number }[]): void {
    const dataPoints = bookings.map(booking => ({
      x: new Date(booking.date),
      y: booking.count
    }));

    this.bookingChartOptions = {
      animationEnabled: true,
      theme: "light2",
      exportEnabled: false,
      title: {
        text: "Daily Booking Count (Last 30 Days)",
        fontColor: "var(--primary-black)",
        fontSize: 18,
        fontWeight: "bold"
      },
      axisX: {
        valueFormatString: "MMM DD",
        labelFontColor: "var(--text-dark)",
        lineColor: "rgba(0,0,0,0.1)",
        tickColor: "rgba(0,0,0,0.1)"
      },
      axisY: {
        title: "Number of Bookings",
        titleFontColor: "var(--primary-black)",
        labelFontColor: "var(--text-dark)",
        lineColor: "rgba(0,0,0,0.1)",
        tickColor: "rgba(0,0,0,0.1)",
        gridColor: "rgba(0,0,0,0.05)"
      },
      toolTip: {
        shared: true,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        fontColor: "#fff",
        cornerRadius: 5
      },
      data: [{
        type: "line",
        name: "Bookings",
        color: "var(--primary-red)",
        markerSize: 5,
        xValueFormatString: "YYYY-MM-DD",
        yValueFormatString: "#,##0",
        dataPoints: dataPoints
      }]
    };
  }

  private setupRouteChart(popularRoutes: { routeName: string; bookingCount: number }[]): void {
    const dataPoints = popularRoutes.map(route => ({
      y: route.bookingCount,
      name: route.routeName
    }));

    this.routeChartOptions = {
      animationEnabled: true,
      theme: "light2",
      exportEnabled: false,
      title: {
        text: "Top 5 Popular Routes by Booking Count",
        fontColor: "var(--primary-black)",
        fontSize: 18,
        fontWeight: "bold"
      },
      legend: {
        cursor: "pointer",
        itemmouseover: function(e: any) { e.chart.data[0].toolTipContent = "<b>{name}</b>: {y} Bookings (#percent)"; },
        itemmouseout: function(e: any) { e.chart.data[0].toolTipContent = "<b>{name}</b>: {y} Bookings (#percent)"; },
        itemclick: function(e: any) {
          if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        },
        fontColor: "var(--primary-black)"
      },
      data: [{
        type: "pie",
        showInLegend: true,
        toolTipContent: "<b>{name}</b>: {y} Bookings (#percent)",
        indexLabel: "{name} - #percent",
        colorSet: "customRouteColorSet",
        dataPoints: dataPoints
      }]
    };

    (CanvasJS as any).addColorSet("customRouteColorSet", [
      "#b71c1c",
      "#d32f2f",
      "#ef5350",
      "#e57373",
      "#ffcdd2"
    ]);
  }

  setBreakpoint(): void {
    this.breakpoint = (window.innerWidth <= 960) ? 1 : 2;
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
