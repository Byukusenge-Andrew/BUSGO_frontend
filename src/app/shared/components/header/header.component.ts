import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo">
          <a routerLink="/">
            <span class="brand-name">BUSGO</span>
            <span class="brand-country">Rwanda</span>
          </a>
        </div>
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/routes" routerLinkActive="active">Routes</a>
          <a routerLink="/search" routerLinkActive="active">Book</a>
          <ng-container *ngIf="isAuthenticated">
            <a routerLink="/my-bookings" routerLinkActive="active">My Bookings</a>
            <a href="javascript:void(0)" (click)="logout()">Logout</a>
          </ng-container>
          <ng-container *ngIf="!isAuthenticated">
            <a routerLink="/login" routerLinkActive="active">Login</a>
            <a routerLink="/signup" routerLinkActive="active">Sign Up</a>
          </ng-container>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--white);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo a {
      display: flex;
      align-items: baseline;
      text-decoration: none;
      color: var(--primary-black);
    }

    .brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-red);
    }

    .brand-country {
      font-size: 1rem;
      margin-left: 0.5rem;
      color: var(--text-dark);
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      align-items: center;

      a {
        text-decoration: none;
        color: var(--text-dark);
        font-weight: 500;
        transition: color 0.3s ease;

        &:hover {
          color: var(--primary-red);
        }

        &.active {
          color: var(--primary-red);
        }
      }
    }

    @media (max-width: 768px) {
      .container {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-links {
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class HeaderComponent {
  isAuthenticated = false;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  logout() {
    this.authService.logout();
  }
}
