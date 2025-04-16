import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

interface Route {
  id: number;
  name: string;
  company: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  price: number;
  status: string;
  scheduleCount: number;
  lastUpdated: Date;
}

@Component({
  selector: 'app-admin-routes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="admin-routes">
      <div class="header">
        <h2>Manage Bus Routes</h2>
        <button mat-raised-button color="primary" (click)="openAddRouteDialog()">
          <mat-icon>add</mat-icon> Add Route
        </button>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Search Routes</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, origin, or destination" #input>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Company</mat-label>
          <mat-select (selectionChange)="filterByCompany($event)">
            <mat-option value="">All Companies</mat-option>
            <mat-option *ngFor="let company of companies" [value]="company">
              {{ company }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select (selectionChange)="filterByStatus($event)">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="INACTIVE">Inactive</mat-option>
            <mat-option value="MAINTENANCE">Maintenance</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="routes" matSort>
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let route">{{ route.id }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let route">{{ route.name }}</td>
          </ng-container>

          <!-- Company Column -->
          <ng-container matColumnDef="company">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Company</th>
            <td mat-cell *matCellDef="let route">{{ route.company }}</td>
          </ng-container>

          <!-- Origin Column -->
          <ng-container matColumnDef="origin">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Origin</th>
            <td mat-cell *matCellDef="let route">{{ route.origin }}</td>
          </ng-container>

          <!-- Destination Column -->
          <ng-container matColumnDef="destination">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Destination</th>
            <td mat-cell *matCellDef="let route">{{ route.destination }}</td>
          </ng-container>

          <!-- Distance Column -->
          <ng-container matColumnDef="distance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Distance</th>
            <td mat-cell *matCellDef="let route">{{ route.distance }} km</td>
          </ng-container>

          <!-- Duration Column -->
          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Duration</th>
            <td mat-cell *matCellDef="let route">{{ route.duration }} hrs</td>
          </ng-container>

          <!-- Price Column -->
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
            <td mat-cell *matCellDef="let route">{{ route.price | currency:'RWF ' }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let route">
              <span class="status-badge" [ngClass]="route.status.toLowerCase()">
                {{ route.status }}
              </span>
            </td>
          </ng-container>

          <!-- Schedule Count Column -->
          <ng-container matColumnDef="scheduleCount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Schedules</th>
            <td mat-cell *matCellDef="let route">
              <mat-chip-listbox>
                <mat-chip color="primary" selected>
                  {{ route.scheduleCount }} Schedules
                </mat-chip>
              </mat-chip-listbox>
            </td>
          </ng-container>

          <!-- Last Updated Column -->
          <ng-container matColumnDef="lastUpdated">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
            <td mat-cell *matCellDef="let route">{{ route.lastUpdated | date:'medium' }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let route">
              <button mat-icon-button color="primary" (click)="viewRoute(route)">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" (click)="editRoute(route)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteRoute(route)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="12">No data matching the filter "{{ input.value }}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of routes"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-routes {
      padding: 1rem;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h2 {
          margin: 0;
          color: var(--primary-black);
        }
      }

      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;

        mat-form-field {
          flex: 1;
          min-width: 200px;
        }
      }

      .table-container {
        position: relative;
        min-height: 200px;
        max-height: 600px;
        overflow: auto;
      }

      table {
        width: 100%;
      }

      .mat-column-actions {
        width: 120px;
        text-align: center;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.active {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        &.inactive {
          background-color: #ffebee;
          color: #d32f2f;
        }

        &.maintenance {
          background-color: #fff3e0;
          color: #f57c00;
        }
      }

      mat-chip-list {
        display: inline-block;
      }
    }
  `]
})
export class AdminRoutesComponent implements OnInit {
  routes: Route[] = [];
  companies: string[] = [];
  displayedColumns: string[] = [
    'id', 'name', 'company', 'origin', 'destination', 'distance',
    'duration', 'price', 'status', 'scheduleCount', 'lastUpdated', 'actions'
  ];
  filteredRoutes: Route[] = [];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoutes();
    this.loadCompanies();
  }

  loadRoutes(): void {
    // In a real app, this would fetch from the API
    this.routes = [
      {
        id: 1,
        name: 'Kigali-Kampala Express',
        company: 'Rwanda Express',
        origin: 'Kigali',
        destination: 'Kampala',
        distance: 450,
        duration: 8,
        price: 15000,
        status: 'ACTIVE',
        scheduleCount: 4,
        lastUpdated: new Date(2023, 0, 15)
      },
      {
        id: 2,
        name: 'Kigali-Bujumbura Route',
        company: 'Volcano Transport',
        origin: 'Kigali',
        destination: 'Bujumbura',
        distance: 350,
        duration: 6,
        price: 12000,
        status: 'ACTIVE',
        scheduleCount: 3,
        lastUpdated: new Date(2023, 1, 20)
      },
      {
        id: 3,
        name: 'Kigali-Gisenyi Express',
        company: 'Kigali Bus Services',
        origin: 'Kigali',
        destination: 'Gisenyi',
        distance: 150,
        duration: 3,
        price: 5000,
        status: 'MAINTENANCE',
        scheduleCount: 2,
        lastUpdated: new Date(2023, 2, 5)
      },
      {
        id: 4,
        name: 'Kigali-Cyangugu Route',
        company: 'Lake Kivu Transport',
        origin: 'Kigali',
        destination: 'Cyangugu',
        distance: 200,
        duration: 4,
        price: 7000,
        status: 'INACTIVE',
        scheduleCount: 1,
        lastUpdated: new Date(2023, 1, 28)
      },
      {
        id: 5,
        name: 'Kigali-Ruhengeri Express',
        company: 'Mountain View Buses',
        origin: 'Kigali',
        destination: 'Ruhengeri',
        distance: 100,
        duration: 2,
        price: 4000,
        status: 'ACTIVE',
        scheduleCount: 5,
        lastUpdated: new Date(2023, 2, 10)
      }
    ];
    this.filteredRoutes = [...this.routes];
  }

  loadCompanies(): void {
    // In a real app, this would fetch from the API
    this.companies = [
      'Rwanda Express',
      'Volcano Transport',
      'Kigali Bus Services',
      'Lake Kivu Transport',
      'Mountain View Buses'
    ];
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredRoutes = this.routes.filter(route =>
      route.name.toLowerCase().includes(filterValue) ||
      route.origin.toLowerCase().includes(filterValue) ||
      route.destination.toLowerCase().includes(filterValue)
    );
  }

  filterByCompany(event: any): void {
    const company = event.value;
    if (!company) {
      this.filteredRoutes = [...this.routes];
      return;
    }
    this.filteredRoutes = this.routes.filter(route => route.company === company);
  }

  filterByStatus(event: any): void {
    const status = event.value;
    if (!status) {
      this.filteredRoutes = [...this.routes];
      return;
    }
    this.filteredRoutes = this.routes.filter(route => route.status === status);
  }

  openAddRouteDialog(): void {
    // In a real app, this would open a dialog to add a route
    this.snackBar.open('Add route functionality will be implemented', 'Close', { duration: 3000 });
  }

  viewRoute(route: Route): void {
    // In a real app, this would open a dialog to view route details
    this.snackBar.open(`View route ${route.name} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  editRoute(route: Route): void {
    // In a real app, this would open a dialog to edit a route
    this.snackBar.open(`Edit route ${route.name} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  deleteRoute(route: Route): void {
    if (confirm(`Are you sure you want to delete ${route.name}?`)) {
      // In a real app, this would delete the route from the API
      this.routes = this.routes.filter(r => r.id !== route.id);
      this.filteredRoutes = this.filteredRoutes.filter(r => r.id !== route.id);
      this.snackBar.open(`Route ${route.name} deleted successfully`, 'Close', { duration: 3000 });
    }
  }
}
