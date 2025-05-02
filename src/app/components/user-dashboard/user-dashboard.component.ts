import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {BookingService } from '../../services/bus-booking.service';
import { UserService, User as ServiceUser } from '../../services/user.service';
import { error } from 'console';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../services/auth.service';

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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2d3748;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .dashboard-header .last-login {
      color: #718096;
      font-size: 0.9rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.5rem;
    }

    /* Stats Card */
    .stats-card {
      grid-column: span 12;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
    }

    .stats-card h2 {
      color: #2d3748;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      transition: transform 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
    }

    .stat-item i {
      font-size: 1.5rem;
      color: #4299e1;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #718096;
    }

    /* Bookings Card */
    .bookings-card {
      grid-column: span 8;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .card-header h2 {
      color: #2d3748;
      font-size: 1.25rem;
      margin: 0;
    }

    .new-booking-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #4299e1;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.3s ease;
    }

    .new-booking-btn:hover {
      background: #3182ce;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .booking-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      transition: transform 0.3s ease;
    }

    .booking-item:hover {
      transform: translateY(-2px);
    }

    .booking-info .route-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .booking-info .from,
    .booking-info .to {
      font-weight: 500;
      color: #2d3748;
    }

    .booking-info i {
      color: #cbd5e0;
    }

    .journey-details {
      display: flex;
      gap: 1.5rem;
      color: #718096;
      font-size: 0.875rem;
    }

    .journey-details span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .booking-actions {
      display: flex;
      gap: 0.75rem;
    }

    .booking-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .booking-actions button.view-ticket {
      background: #edf2f7;
      color: #4a5568;
      border: none;
    }

    .booking-actions button.view-ticket:hover {
      background: #e2e8f0;
    }

    .booking-actions button.cancel-booking {
      background: #fff5f5;
      color: #e53e3e;
      border: none;
    }

    .booking-actions button.cancel-booking:hover {
      background: #fed7d7;
    }

    .no-bookings {
      text-align: center;
      padding: 3rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .no-bookings i {
      font-size: 3rem;
      color: #cbd5e0;
      margin-bottom: 1rem;
    }

    .no-bookings p {
      color: #718096;
      margin-bottom: 1rem;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #4299e1;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.3s ease;
    }

    .btn-primary:hover {
      background: #3182ce;
    }

    /* Activity Card */
    .activity-card {
      grid-column: span 4;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
    }

    .activity-card h2 {
      color: #2d3748;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .activity-icon {
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 1.25rem;
    }

    .activity-icon.booking {
      background: #ebf8ff;
      color: #2b6cb0;
    }

    .activity-icon.cancellation {
      background: #fff5f5;
      color: #e53e3e;
    }

    .activity-icon.profile {
      background: #f0fff4;
      color: #2f855a;
    }

    .activity-icon.support {
      background: #faf5ff;
      color: #805ad5;
    }

    .activity-details {
      flex: 1;
    }

    .activity-text {
      color: #2d3748;
      margin-bottom: 0.25rem;
    }

    .activity-time {
      font-size: 0.875rem;
      color: #718096;
    }

    /* Quick Actions Card */
    .quick-actions-card {
      grid-column: span 12;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
    }

    .quick-actions-card h2 {
      color: #2d3748;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: 8px;
      text-decoration: none;
      color: #2d3748;
      transition: all 0.3s ease;
    }

    .action-item:hover {
      transform: translateY(-2px);
      background: #edf2f7;
    }

    .action-item i {
      font-size: 1.5rem;
      color: #4299e1;
    }

    .action-item span {
      font-weight: 500;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .bookings-card,
      .activity-card {
        grid-column: span 1;
      }
    }

    @media (max-width: 768px) {
      .booking-item {
        flex-direction: column;
        gap: 1rem;
      }

      .booking-actions {
        width: 100%;
        justify-content: stretch;
      }

      .booking-actions button {
        flex: 1;
        justify-content: center;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
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

  constructor(
    private userService: UserService,
    private bookingService: BookingService,
    private router: Router,
    private authservice: AuthService
  ) {}

  ngOnInit() {
    // Load user data first, which will then trigger loading stats
    this.loadUserData();
    // Load bookings separately
    this.loadBookings();
    // Activity will be loaded after user data is available
  }

  private loadUserData() {
    this.userService.getCurrentUser().subscribe({
      next: (user: ServiceUser) => {
        // Convert ServiceUser to the component's User interface
        this.user = {
          id: user.id,
          name: user.username, // Use username as name
          email: user.email,
          lastLogin: user.lastLogin || new Date()
        };
        this.loadUserStats(user.id);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  private loadUserStats(userId: string) {
    this.userService.getUserStats(userId).subscribe({
      next: (stats : any) => {
        this.stats = stats;
        console.log('User stats loaded:', this.stats);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  private loadBookings() {
    const userId = this.authservice.getCurrentUserId();
    this.bookingService.getUserBookings(userId).subscribe({
      next: (bookings: any) => {
        //only get booking with active status

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
      // If no user is loaded yet, set up an empty activity list
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
          // Refresh bookings and activity
          this.loadBookings();
          this.loadActivity();
          if (this.user && this.user.id) {
            this.loadUserStats(this.user.id);
          }
        },
        error: (error: any) => {
          console.error(error);
          // Show error message to user
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
