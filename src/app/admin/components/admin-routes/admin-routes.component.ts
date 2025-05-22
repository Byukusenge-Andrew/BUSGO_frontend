import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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
import { RouteService, Route } from '../../../services/bus-route.service';
import { CompanyService, Company } from '../../../services/company.services';
import { RouteDialogComponent } from './route-dialog.component';

// Interface for display purposes (extends Route)
interface DisplayRoute extends Route {
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  price: number;
  companyName: string;
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
  ],
  template: `
    <div class="admin-routes">
      <div class="header">
        <h2>Route Management</h2>
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
            <mat-option *ngFor="let company of companies" [value]="company.companyId">
              {{ company.name }}
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
        <div *ngIf="isLoading" class="loading">Loading...</div>
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let route">{{ route.id }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let route">{{ route.routeName || route.origin + ' - ' + route.destination }}</td>
          </ng-container>

          <ng-container matColumnDef="company">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Company</th>
            <td mat-cell *matCellDef="let route">{{ route.companyName }}</td>
          </ng-container>

          <ng-container matColumnDef="origin">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Origin</th>
            <td mat-cell *matCellDef="let route">{{ route.origin }}</td>
          </ng-container>

          <ng-container matColumnDef="destination">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Destination</th>
            <td mat-cell *matCellDef="let route">{{ route.destination }}</td>
          </ng-container>

          <ng-container matColumnDef="distance">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Distance</th>
            <td mat-cell *matCellDef="let route">{{ route.distance }} km</td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Duration</th>
            <td mat-cell *matCellDef="let route">{{ route.duration }} hrs</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
            <td mat-cell *matCellDef="let route">{{ route.price | currency:'RWF ' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let route">
              <span class="status-badge" [ngClass]="route.status.toLowerCase()">
                {{ route.status }}
              </span>
            </td>
          </ng-container>

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

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="10">No data matching the filter "{{ input.value }}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of routes"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-routes {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h2 {
          margin: 0;
          font-size: 1.8rem;
          color: #333;
        }
      }

      .filters {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;

        mat-form-field {
          flex: 1;
          min-width: 250px;
        }
      }

      .table-container {
        position: relative;
        background: white;
        border-radius: 8px;
        overflow: hidden;
      }

      .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.2rem;
        color: #666;
        z-index: 10;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      .mat-column-actions {
        width: 150px;
        text-align: center;
      }

      .status-badge {
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;

        &.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        &.inactive {
          background-color: #ffebee;
          color: #c62828;
        }

        &.maintenance {
          background-color: #fff3e0;
          color: #ef6c00;
        }
      }
    }
  `],
})
export class AdminRoutesComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<DisplayRoute>([]);
  companies: Company[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'company',
    'origin',
    'destination',
    'distance',
    'duration',
    'price',
    'status',
    'actions',
  ];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private routeService: RouteService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadRoutes();
    this.loadCompanies();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private mapToDisplayRoute(route: Route, companyName: string): DisplayRoute {
    return {
      ...route,
      price: route.basePrice,
      status: route.active ? 'ACTIVE' : 'INACTIVE', // Note: MAINTENANCE not supported by service
      companyName,
    };
  }

  loadRoutes(): void {
    this.isLoading = true;
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.routeService.getAllRoutes().subscribe({
          next: (routes) => {
            this.dataSource.data = routes.map((route) => {
              const company = companies.find((c) => c.companyId === route.companyId);
              return this.mapToDisplayRoute(route, company?.name || 'Unknown');
            });
            this.isLoading = false;
          },
          error: (error) => {
            this.snackBar.open('Failed to load routes: ' + error.message, 'Close', { duration: 5000 });
            this.isLoading = false;
          },
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to load companies: ' + error.message, 'Close', { duration: 5000 });
        this.isLoading = false;
      },
    });
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error) => {
        this.snackBar.open('Failed to load companies: ' + error.message, 'Close', { duration: 5000 });
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.isLoading = true;
    if (filterValue) {
      this.routeService.searchRoutes(filterValue).subscribe({
        next: (routes) => {
          this.dataSource.data = routes.map((route) => {
            const company = this.companies.find((c) => c.companyId === route.companyId);
            return this.mapToDisplayRoute(route, company?.name || 'Unknown');
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to search routes: ' + error.message, 'Close', { duration: 5000 });
          this.isLoading = false;
        },
      });
    } else {
      this.loadRoutes();
    }
  }

  filterByCompany(event: any): void {
    const companyId = event.value;
    if (!companyId) {
      this.loadRoutes();
      return;
    }
    this.isLoading = true;
    this.routeService.getCompanyRoutes(companyId).subscribe({
      next: (routes) => {
        this.dataSource.data = routes.map((route) => {
          const company = this.companies.find((c) => c.companyId === route.companyId);
          return this.mapToDisplayRoute(route, company?.name || 'Unknown');
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to filter by company: ' + error.message, 'Close', { duration: 5000 });
        this.isLoading = false;
      },
    });
  }

  filterByStatus(event: any): void {
    const status = event.value;
    if (!status) {
      this.loadRoutes();
      return;
    }
    this.dataSource.data = this.dataSource.data.filter((route) => route.status === status);
  }

  openAddRouteDialog(): void {
    const dialogRef = this.dialog.open(RouteDialogComponent, {
      width: '600px',
      data: { mode: 'add', route: {} as Route, companies: this.companies },
    });

    dialogRef.afterClosed().subscribe((result: Route | undefined) => {
      if (result) {
        this.isLoading = true;
        this.routeService.createRoute(result).subscribe({
          next: (newRoute) => {
            const company = this.companies.find((c) => c.companyId === newRoute.companyId);
            this.dataSource.data = [
              ...this.dataSource.data,
              this.mapToDisplayRoute(newRoute, company?.name || 'Unknown'),
            ];
            this.snackBar.open(`Route created`, 'Close', { duration: 3000 });
            this.isLoading = false;
          },
          error: (error) => {
            this.snackBar.open('Failed to create route: ' + error.message, 'Close', { duration: 5000 });
            this.isLoading = false;
          },
        });
      }
    });
  }

  viewRoute(route: DisplayRoute): void {
    this.dialog.open(RouteDialogComponent, {
      width: '600px',
      data: { mode: 'view', route, companies: this.companies },
    });
  }

  editRoute(route: DisplayRoute): void {
    const dialogRef = this.dialog.open(RouteDialogComponent, {
      width: '600px',
      data: { mode: 'edit', route, companies: this.companies },
    });

    dialogRef.afterClosed().subscribe((result: Route | undefined) => {
      if (result) {
        this.isLoading = true;
        this.routeService.updateRoute(route.id, result).subscribe({
          next: (updatedRoute) => {
            const company = this.companies.find((c) => c.companyId === updatedRoute.companyId);
            const index = this.dataSource.data.findIndex((r) => r.id === updatedRoute.id);
            if (index !== -1) {
              this.dataSource.data[index] = this.mapToDisplayRoute(updatedRoute, company?.name || 'Unknown');
              this.dataSource.data = [...this.dataSource.data];
            }
            this.snackBar.open(`Route updated`, 'Close', { duration: 3000 });
            this.isLoading = false;
          },
          error: (error) => {
            this.snackBar.open('Failed to update route: ' + error.message, 'Close', { duration: 5000 });
            this.isLoading = false;
          },
        });
      }
    });
  }

  deleteRoute(route: DisplayRoute): void {
    if (confirm(`Are you sure you want to delete ${route.routeName || route.origin + ' - ' + route.destination}?`)) {
      this.isLoading = true;
      this.routeService.deleteRoute(route.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter((r) => r.id !== route.id);
          this.snackBar.open(`Route deleted`, 'Close', { duration: 3000 });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to delete route: ' + error.message, 'Close', { duration: 5000 });
          this.isLoading = false;
        },
      });
    }
  }
}
