import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
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
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouteService, Route } from '../../services/bus-route.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { RouteDisplay } from '../../models/route-display.model';

@Component({
  selector: 'app-company-routes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    MatNativeDateModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="routes-container">
      <div class="header">
        <h1>Manage Routes</h1>
        <button mat-raised-button color="primary" (click)="openAddRouteDialog()">
          <mat-icon>add</mat-icon> Add New Route
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search Routes</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, origin, or destination" #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event)">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="ACTIVE">Active</mat-option>
                <mat-option value="INACTIVE">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="loading-shade" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <div class="table-container mat-elevation-z8">
            <table mat-table [dataSource]="dataSource" matSort>
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
                <td class="mat-cell" colspan="12">
                  <div *ngIf="input.value">No data matching the filter "{{ input.value }}"</div>
                  <div *ngIf="!input.value && !isLoading && dataSource.data.length === 0">No routes found. Click "Add New Route" to create one.</div>
                </td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of routes"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .routes-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      color: var(--primary-black);
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      flex: 1;
      min-width: 200px;
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
    }

    .status-badge.active {
      background-color: #e8f5e9;
      color: #388e3c;
    }

    .status-badge.inactive {
      background-color: #ffebee;
      color: #d32f2f;
    }

    mat-chip-listbox {
      display: inline-block;
    }

    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CompanyRoutesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<RouteDisplay>;

  dataSource = new MatTableDataSource<RouteDisplay>([]);
  displayedColumns: string[] = [
    'id', 'name', 'origin', 'destination', 'distance',
    'duration', 'price', 'status', 'scheduleCount', 'lastUpdated', 'actions'
  ];

  isLoading = false;
  error: string | null = null;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private routeService: RouteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRoutes(): void {
    this.isLoading = true;
    const companyId = this.authService.getCurrentUserId();

    if (!companyId) {
      this.snackBar.open('Authentication error. Please log in again.', 'Close', { duration: 5000 });
      this.isLoading = false;
      return;
    }

    this.routeService.getCompanyRoutes(companyId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (routes) => {
          // Transform the backend routes to the display format
          const displayRoutes = routes.map(route => this.mapRouteToDisplay(route));
          this.dataSource.data = displayRoutes;
        },
        error: (error) => {
          console.error('Error loading routes:', error);
          this.error = 'Failed to load routes. Please try again.';
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
        }
      });
  }

  // Map the backend route model to the display model
  mapRouteToDisplay(route: Route): RouteDisplay {
    return {
      id: route.id,
      name: route.origin + ' - ' + route.destination,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      duration: route.duration / 60, // Convert minutes to hours
      price: route.basePrice,
      status: route.active ? 'ACTIVE' : 'INACTIVE',
      scheduleCount: 0, // This would need to be fetched from another service
      lastUpdated: route.createdAt
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(event: any): void {
    const status = event.value;

    // Reset filter first
    this.dataSource.filter = '';

    // If no status selected, show all routes
    if (!status) {
      return;
    }

    // Apply custom filter predicate for status
    this.dataSource.filterPredicate = (data: RouteDisplay, filter: string) => {
      return data.status === filter;
    };

    this.dataSource.filter = status;
  }

  openAddRouteDialog(): void {
    this.router.navigate(['/company/routes/add']);
  }

  viewRoute(route: RouteDisplay): void {
    this.router.navigate(['/company/routes', route.id]);
  }

  editRoute(route: RouteDisplay): void {
    this.router.navigate(['/company/routes/edit', route.id]);
  }

  deleteRoute(route: RouteDisplay): void {
    if (confirm(`Are you sure you want to delete ${route.name}?`)) {
      this.isLoading = true;

      this.routeService.deleteRoute(route.id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            // Remove the route from the data source
            const data = this.dataSource.data;
            this.dataSource.data = data.filter(r => r.id !== route.id);

            this.snackBar.open(`Route ${route.name} deleted successfully`, 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error deleting route:', error);
            this.snackBar.open('Failed to delete route. Please try again.', 'Close', {
              duration: 5000
            });
          }
        });
    }
  }
}
