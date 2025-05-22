import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {BookingService } from '../../services/bus-booking.service';
import { UserService, User as ServiceUser } from '../../services/user.service';
import { error } from 'console';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  lastLogin: Date;
}

interface Stats {
  activeBookings: number;
  totalBookings: number;
  rewardsPoints: number;
}

interface Booking {
  id: string;
  from: string;
  to: string;
  date: Date;
  departureTime: string;
  seatNumber: string;
  canCancel: boolean;
}

interface Activity {
  type: 'booking' | 'cancellation' | 'profile' | 'support';
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent implements OnInit {

  user: User | null = null;

  stats: Stats = {
    activeBookings: 0,
    totalBookings: 0,
    rewardsPoints: 0
  };
  activeBookings: Booking[] = [];
  recentActivity: Activity[] = [];
  bookings: any[] = [];
  loading = true;
  totalBookings = 0;
  upcomingTrips = 0;
  completedTrips = 0;
  loadingCharts = true;

  // Booking History Chart
  public bookingHistoryChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Bookings',
        fill: true,
        tension: 0.4,
        borderColor: '#4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        pointBackgroundColor: '#4299e1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4299e1',
      }
    ]
  };

  public bookingHistoryChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#2d3748',
        }
      },
      title: {
        display: true,
        text: 'Booking History (Last 6 Months)',
        color: '#2d3748',
        font: {
          size: 16,
          weight: 'bold' as any
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyColor: '#fff',
        titleColor: '#fff',
      }
    },
    scales: {
      x: {
        ticks: { color: '#718096' },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      y: {
        ticks: { color: '#718096' },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };

  // Rewards Points Chart
  public rewardsChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Used Points', 'Available Points'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#e53e3e', '#48bb78'],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  public rewardsChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#2d3748',
        }
      },
      title: {
        display: true,
        text: 'Rewards Points Distribution',
        color: '#2d3748',
        font: {
          size: 16,
          weight: 'bold' as any
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyColor: '#fff',
        titleColor: '#fff',
      }
    }
  };

  constructor(
    private userService: UserService,
    private bookingService: BookingService,
    private router: Router,
    private authservice: AuthService
  ) {}

  ngOnInit() {
    const userId = this.authservice.getCurrentUserId();
    this.loadUserData();
    this.loadBookings();
    // After all data is loaded (or subscriptions complete), set loadingCharts to false
    // This might need more sophisticated logic if data loading is staggered.
    // For simplicity, let's assume data loads relatively quickly after user data.
    // A better approach would be to use forkJoin for charts data as well.
    forkJoin([
      this.bookingService.getUserBookings(userId),
      this.userService.getUserStats(userId || " ")
    ]).subscribe({
      next: ([bookings, stats]) => {
        console.log('Stats response:', stats); // Log the stats for debugging

        // Process bookings for history chart
        const months = Array.from({length: 6}, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return d.toLocaleString('default', {month: 'short'});
        }).reverse();
        const monthlyCounts = new Array(6).fill(0);
        bookings.forEach(booking => {
          const bookingDate = new Date(booking.date);
          const monthDiff = (new Date().getMonth() - bookingDate.getMonth() + 12) % 12;
          if (monthDiff < 6) {
            monthlyCounts[monthDiff]++;
          }
        });
        this.bookingHistoryChartData.labels = months;
        this.bookingHistoryChartData.datasets[0].data = monthlyCounts.reverse();

        // Process stats for rewards chart
        this.stats = stats;
        this.rewardsChartData.datasets[0].data = [
          stats.usedPoints ?? 0, // Fallback to 0 if usedPoints is undefined
          stats.rewardsPoints ?? 0 // Fallback to 0 if rewardsPoints is undefined
        ];

        this.loadingCharts = false;
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        this.loadingCharts = false;
        // Optionally display an error message to the user
        alert('Failed to load chart data. Please try again later.');
      }
    });
  }

  private loadUserData() {
    this.userService.getCurrentUser().subscribe({
      next: (user: ServiceUser) => {
        this.user = {
          id: user.id,
          name: user.username,
          email: user.email,
          lastLogin: user.lastLogin || new Date()
        };
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  private loadBookings() {
    const userId = this.authservice.getCurrentUserId();
    this.bookingService.getUserBookings(userId).subscribe({
      next: (bookings: any) => {
        this.activeBookings = bookings;
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  private loadActivity() {
    if (this.user && this.user.id) {
      this.userService.getRecentActivity(this.user.id).subscribe({
        next: (activity: any) => {
          this.recentActivity = activity;
        },
        error: (error: any) => {
          console.error(error);
        }
      });
    } else {
      this.recentActivity = [];
    }
  }

  viewTicket(bookingId: string) {
    this.router.navigate(['/ticket', bookingId]);
  }

  cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId as unknown as any).subscribe({
        next: () => {
          this.loadBookings();
          this.loadActivity();
          if (this.user && this.user.id) {
            this.userService.getUserStats(this.user.id).subscribe({
              next: (stats: any) => {
                this.stats = stats;
              },
              error: (error: any) => {
                console.error(error);
              }
            });
          }
        },
        error: (error: any) => {
          console.error(error);
        }
      });
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'booking':
        return 'fas fa-ticket-alt';
      case 'cancellation':
        return 'fas fa-times-circle';
      case 'profile':
        return 'fas fa-user';
      case 'support':
        return 'fas fa-headset';
      default:
        return 'fas fa-info-circle';
    }
  }
}
