import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="header">
      <div class="header-container">
        <div class="logo-container">
          <a routerLink="/" class="logo">
            <span>Bus Booking</span>
      
          </a>
        </div>

        <div class="nav-links" *ngIf="!isLoggedIn">
          <a mat-button routerLink="/search">Find Buses</a>
          <a mat-button routerLink="/routes">Routes</a>
          <a mat-button routerLink="/login">Login</a>
          <a mat-raised-button color="accent" routerLink="/signup">Sign Up</a>
        </div>

        <!-- Regular User Navigation -->
        <div class="nav-links" *ngIf="isLoggedIn && userType === 'user'">
          <a mat-button routerLink="/search">Find Buses</a>
          <a mat-button routerLink="/my-bookings">My Bookings</a>
          <a mat-button routerLink="/routes">Routes</a>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <a mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </a>
            <a mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
            <a mat-menu-item routerLink="/support">
              <mat-icon>help</mat-icon>
              <span>Support</span>
            </a>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>

        <!-- Company Navigation -->
        <div class="nav-links" *ngIf="isLoggedIn && userType === 'company'">
          <a mat-button routerLink="/company/dashboard">Dashboard</a>
          <a mat-button routerLink="/company/routes">Routes</a>
          <a mat-button routerLink="/company/schedules">Schedules</a>
          <a mat-button routerLink="/company/bookings">Bookings</a>
          <button mat-icon-button [matMenuTriggerFor]="companyMenu">
            <mat-icon>business</mat-icon>
          </button>
          <mat-menu #companyMenu="matMenu">
            <a mat-menu-item routerLink="/company/profile">
              <mat-icon>business</mat-icon>
              <span>Company Profile</span>
            </a>
            <a mat-menu-item routerLink="/company/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
            <a mat-menu-item routerLink="/company/payment">
              <mat-icon>payment</mat-icon>
              <span>Payment</span>
            </a>
            <a mat-menu-item routerLink="/company/support">
              <mat-icon>help</mat-icon>
              <span>Support</span>
            </a>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>

        <!-- Admin Navigation -->
        <div class="nav-links" *ngIf="isLoggedIn && userType === 'admin'">
          <a mat-button routerLink="/admin/dashboard">Dashboard</a>
          <a mat-button routerLink="/admin/companies">Companies</a>
          <a mat-button routerLink="/admin/routes">Routes</a>
          <a mat-button routerLink="/admin/users">Users</a>
          <button mat-icon-button [matMenuTriggerFor]="adminMenu">
            <mat-icon>admin_panel_settings</mat-icon>
          </button>
          <mat-menu #adminMenu="matMenu">
            <a mat-menu-item routerLink="/admin/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
            <a mat-menu-item routerLink="/admin/reports">
              <mat-icon>assessment</mat-icon>
              <span>Reports</span>
            </a>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .logo-container {
      display: flex;
      align-items: center;
      background-color:red;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
      font-weight: 500;
      font-size: 1.5rem;
    }

    .logo mat-icon {
      margin-right: 0.5rem;
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-links a {
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .header-container {
        padding: 0 0.5rem;
      }

      .logo span {
        display: none;
      }

      .nav-links {
        gap: 0.25rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userType: 'user' | 'company' | 'admin' | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      
      if (user) {
        if ('role' in user && user.role === 'ADMIN') {
          this.userType = 'admin';
        } else if ('role' in user && user.role === 'COMPANY') {
          this.userType = 'company';
        } else {
          this.userType = 'user';
        }
      } else {
        this.userType = null;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
