
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { AuthService } from '../../services/auth.service';
import { BusService, Bus } from '../../services/bus.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-buses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="buses-container">
      <div class="buses-header">
        <h1>Company Buses</h1>
        <p class="subtitle">Manage your fleet of buses</p>
      </div>

      <div class="action-bar">
        <button mat-raised-button color="primary" routerLink="/company/buses/add">
          <mat-icon>add</mat-icon> Add New Bus
        </button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading buses...</p>
      </div>

      <ng-container *ngIf="!loading">
        <div *ngIf="buses.length === 0" class="no-buses">
          <mat-card>
            <mat-card-content>
              <div class="empty-state">
                <mat-icon>directions_bus</mat-icon>
                <h2>No Buses Found</h2>
                <p>You haven't added any buses to your fleet yet.</p>
                <button mat-raised-button color="primary" routerLink="/company/buses/add">
                  Add Your First Bus
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div *ngIf="buses.length > 0" class="buses-table-container">
          <table mat-table [dataSource]="buses" matSort (matSortChange)="sortData($event)" class="buses-table">
            <!-- Registration Number Column -->
            <ng-container matColumnDef="registrationNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Registration No.</th>
              <td mat-cell *matCellDef="let bus">{{ bus.registrationNumber }}</td>
            </ng-container>

            <!-- Model Column -->
            <ng-container matColumnDef="model">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Model</th>
              <td mat-cell *matCellDef="let bus">{{ bus.model }}</td>
            </ng-container>

            <!-- Bus Type Column -->
            <ng-container matColumnDef="busType">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let bus">
                <span class="bus-type">{{ formatBusType(bus.busType) }}</span>
              </td>
            </ng-container>

            <!-- Capacity Column -->
            <ng-container matColumnDef="capacity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Capacity</th>
              <td mat-cell *matCellDef="let bus">{{ bus.capacity }} seats</td>
            </ng-container>

            <!-- Features Column -->
            <ng-container matColumnDef="features">
              <th mat-header-cell *matHeaderCellDef>Features</th>
              <td mat-cell *matCellDef="let bus">
                <div class="features-list">
                  <mat-chip-listbox>
                    <mat-chip *ngFor="let feature of getTopFeatures(bus.features, 2)" selected>
                      {{ feature }}
                    </mat-chip>
                    <mat-chip *ngIf="bus.features.length > 2" color="primary">
                      +{{ bus.features.length - 2 }} more
                    </mat-chip>
                  </mat-chip-listbox>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let bus">
                <span class="status-chip" [ngClass]="getStatusClass(bus.status)">
                  {{ bus.status }}
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let bus">
                <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Bus actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/company/buses/edit', bus.id]">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="updateBusStatus(bus.id, 'ACTIVE')" *ngIf="bus.status !== 'ACTIVE'">
                    <mat-icon>check_circle</mat-icon>
                    <span>Set Active</span>
                  </button>
                  <button mat-menu-item (click)="updateBusStatus(bus.id, 'MAINTENANCE')" *ngIf="bus.status !== 'MAINTENANCE'">
                    <mat-icon>build</mat-icon>
                    <span>Set Maintenance</span>
                  </button>
                  <button mat-menu-item (click)="updateBusStatus(bus.id, 'INACTIVE')" *ngIf="bus.status !== 'INACTIVE'">
                    <mat-icon>cancel</mat-icon>
                    <span>Set Inactive</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="deleteBus(bus.id)" class="delete-action">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalBuses"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .buses-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .buses-header {
      margin-bottom: 2rem;
    }

    .buses-header h1 {
      margin: 0;
      color: var(--primary-black);
    }

    .subtitle {
      color: var(--text-dark);
      margin-top: 0.5rem;
    }

    .action-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1.5rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .loading-container p {
      margin-top: 1rem;
      color: var(--text-dark);
    }

    .no-buses {
      margin-top: 2rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: var(--text-light);
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      margin: 0 0 0.5rem;
      color: var(--primary-black);
    }

    .empty-state p {
      margin: 0 0 1.5rem;
      color: var(--text-dark);
    }

    .buses-table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .buses-table {
      width: 100%;
    }

    .features-list {
      max-width: 200px;
    }

    .status-chip {
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-active {
      background-color: #e6f4ea;
      color: #137333;
    }

    .status-maintenance {
      background-color: #fef7e0;
      color: #b06000;
    }

    .status-inactive {
      background-color: #fce8e6;
      color: #c5221f;
    }

    .bus-type {
      text-transform: capitalize;
    }

    .delete-action {
      color: var(--warn-color);
    }

    @media (max-width: 768px) {
      .buses-container {
        padding: 1rem;
      }

      .buses-table {
        display: block;
        overflow-x: auto;
      }
    }
  `]
})
export class CompanyBusesComponent implements OnInit, OnDestroy {
  buses: Bus[] = [];
  filteredBuses: Bus[] = [];
  loading = true;
  companyId: string | null = null;
  displayedColumns: string[] = ['registrationNumber', 'model', 'busType', 'capacity', 'features', 'status', 'actions'];

  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalBuses = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private busService: BusService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (user && 'companyId' in user) {
        this.companyId = user.companyId?.toString() || null;
        this.loadBuses();
      }
    });

    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBuses(): void {
    if (!this.companyId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    const busSub = this.busService.getCompanyBuses(this.companyId).subscribe({
      next: (buses) => {
        this.buses = buses;
        this.totalBuses = buses.length;
        this.applyPagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading buses:', error);
        this.snackBar.open('Failed to load buses', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });

    this.subscriptions.push(busSub);
  }

  formatBusType(busType: string): string {
    if (!busType) return '';
    return busType.toLowerCase().replace('_', ' ');
  }

  getTopFeatures(features: string[], count: number): string[] {
    return features.slice(0, count);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'MAINTENANCE':
        return 'status-maintenance';
      case 'INACTIVE':
        return 'status-inactive';
      default:
        return '';
    }
  }

  updateBusStatus(busId: string, status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'): void {
    this.busService.updateBusStatus(busId, status).subscribe({
      next: () => {
        this.snackBar.open(`Bus status updated to ${status.toLowerCase()}`, 'Close', { duration: 3000 });
        this.loadBuses();
      },
      error: (error) => {
        console.error('Error updating bus status:', error);
        this.snackBar.open('Failed to update bus status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteBus(busId: string): void {
    if (confirm('Are you sure you want to delete this bus? This action cannot be undone.')) {
      this.busService.deleteBus(busId).subscribe({
        next: () => {
          this.snackBar.open('Bus deleted successfully', 'Close', { duration: 3000 });
          this.loadBuses();
        },
        error: (error) => {
          console.error('Error deleting bus:', error);
          this.snackBar.open('Failed to delete bus', 'Close', { duration: 3000 });
        }
      });
    }
  }

  sortData(sort: Sort): void {
    const data = this.buses.slice();
    if (!sort.active || sort.direction === '') {
      this.filteredBuses = data;
      return;
    }

    this.filteredBuses = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'registrationNumber': return this.compare(a.registrationNumber, b.registrationNumber, isAsc);
        case 'model': return this.compare(a.model, b.model, isAsc);
        case 'busType': return this.compare(a.busType, b.busType, isAsc);
        case 'capacity': return this.compare(a.capacity, b.capacity, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });

    this.applyPagination();
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const sortedData = this.filteredBuses.length > 0 ? this.filteredBuses : this.buses;
    this.filteredBuses = sortedData.slice(startIndex, startIndex + this.pageSize);
  }
}
