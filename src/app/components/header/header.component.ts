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
          <div class="logo">
            <a routerLink="/">
              <!-- <span class="brand-name">BUSGO</span>
              <span class="brand-country">Rwanda</span> -->
              <img alt="busgolog0" src="../../../assets/images/logo.png" width="90" height="80">

            </a>
          </div>
        </div>

        <div class="nav-links" *ngIf="!isLoggedIn">
          <!--          <a mat-button routerLink="/search">Find Buses</a>-->
          <a mat-button routerLink="/company/login">CompanyLogin</a>
          <a mat-button routerLink="/routes">Routes</a>
          <a mat-button routerLink="/login">Login</a>
          <a mat-raised-button color="accent" routerLink="/signup">Sign Up</a>
        </div>

        <!-- Regular User Navigation -->
        <div class="nav-links" *ngIf="isLoggedIn && userType === 'user'">
          <!--          <a mat-button routerLink="/search">Find Buses</a>-->
          <a mat-button routerLink="/my-bookings">My Bookings</a>
          <a mat-button routerLink="/schedule-search">Search</a>
          <a mat-button routerLink="/dashboard">Dashboard</a>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <img alt="accountsvg" src="../../../assets/images/account_circle.svg" style="fill: #1a1a1a;color: black">
          </button>
          <mat-menu #userMenu="matMenu">

            <a mat-menu-item routerLink="/payment" class="dropdown">Payment</a>
            <a mat-menu-item routerLink="/settings" class="dropdown">
              <span>Settings</span>
            </a>
            <a mat-menu-item routerLink="/support" class="dropdown">
              <span>Support</span>
            </a>
            <mat-divider ></mat-divider>
            <button mat-menu-item (click)="logout()" class="dropdown">
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>

        <!-- Company Navigation -->
        <div class="nav-links" *ngIf="isLoggedIn && userType === 'company'">
          <a mat-button routerLink="/company/dashboard">Dashboard</a>
          <a mat-button routerLink="/company/routes">Routes</a>
          <a mat-button routerLink="/company/tickets">Tickets</a>
          <a mat-button routerLink="/company/location">Locations</a>
          <a mat-button routerLink="/company/schedules">Schedules</a>
          <a mat-button routerLink="/company/buses">Buses</a>
          <a mat-button routerLink="/company/booking">Bookings</a>
          <button mat-icon-button [matMenuTriggerFor]="companyMenu">
            <img alt="accountsvg" src="../../../assets/images/account_circle.svg" style="fill: #1a1a1a;color: black">
          </button>
          <mat-menu #companyMenu="matMenu">
            <a mat-menu-item routerLink="/company/profile" class="dropdown">
              <span>Company Profile</span>
            </a>
            <a mat-menu-item routerLink="/company/settings" class="dropdown">
              <span>Settings</span>
            </a>
            <a mat-menu-item routerLink="/company/payment" class="dropdown">
              <span>Payment</span>
            </a>
            <a mat-menu-item routerLink="/company/reports" class="dropdown">
              <span>Report</span>
            </a>
            <a mat-menu-item routerLink="/company/support" class="dropdown">
              <span>Support</span>
            </a>
            <mat-divider class="dropdown"></mat-divider>
            <button mat-menu-item (click)="logout()" class="dropdown">
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
            <img alt="accountsvg" src="../../../assets/images/account_circle.svg" style="fill: #1a1a1a;color: black">
          </button>
          <mat-menu #adminMenu="matMenu">
            <a mat-menu-item routerLink="/admin/settings" class="dropdown">
              <span>Settings</span>
            </a>
            <a mat-menu-item routerLink="/admin/reports" class="dropdown">
              <span>Reports</span>
            </a>
            <mat-divider ></mat-divider>
            <button mat-menu-item (click)="logout()" class="dropdown">
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .dropdown{
      background-color: white;
    }
    .header {
      position: relative;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-red);
      text-decoration: none;

    }


    .brand-country {
      font-size: 1rem;
      margin-left: 0.5rem;
      color: var(--text-dark);
      text-decoration: none;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      text-decoration: none;
    }

    .logo-container {
      display: flex;
      align-items: center;
      text-decoration: none;

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
    .nav-links mat-menu{
      background: var(--white);
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
      const  userRole = this.authService.currentUserRole;
      console.log("the userole is "+ userRole)

      if (user) {
        if ( userRole === 'USER') {
          this.userType = 'user';
        } else if (userRole === 'COMPANY') {
          this.userType = 'company';
        } else {
          console.log("user role set to user")
          this.userType = 'admin';
        }
      } else {
        this.userType = null;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href="/";

  }
}
