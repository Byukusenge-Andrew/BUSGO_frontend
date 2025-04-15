import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><a routerLink="users">Manage Users</a></li>
          <li><a routerLink="companies">Manage Companies</a></li>
          <li><a routerLink="routes">Manage Routes</a></li>
          <li><a routerLink="bookings">Manage Bookings</a></li>
        </ul>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;

      h1 {
        margin-bottom: 2rem;
        color: var(--primary-black);
      }

      nav {
        margin-bottom: 2rem;

        ul {
          list-style: none;
          padding: 0;
          display: flex;
          gap: 1rem;

          li {
            a {
              color: var(--primary-red);
              text-decoration: none;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              transition: background-color 0.3s ease;

              &:hover {
                background-color: var(--text-light);
              }
            }
          }
        }
      }
    }
  `]
})
export class AdminDashboardComponent {}
