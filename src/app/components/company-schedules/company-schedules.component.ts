import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';

interface Schedule {
  id: number;
  routeName: string;
  departureTime: Date;
  arrivalTime: Date;
  busNumber: string;
  driverName: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  status: string;
  lastUpdated: Date;
}

@Component({
  selector: 'app-company-schedules',
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
    MatAutocompleteModule
  ],
  template: `
    <div class="schedules-container">
      <div class="header">
        <h1>Manage Schedules</h1>
        <button mat-raised-button color="primary" (click)="openAddScheduleDialog()">
          <mat-icon>add</mat-icon> Add New Schedule
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search Schedules</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search by route, bus number, or driver" #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Route</mat-label>
              <mat-select (selectionChange)="filterByRoute($event)">
                <mat-option value="">All Routes</mat-option>
                <mat-option *ngFor="let route of routes" [value]="route.name">
                  {{ route.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event)">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="SCHEDULED">Scheduled</mat-option>
                <mat-option value="IN_PROGRESS">In Progress</mat-option>
                <mat-option value="COMPLETED">Completed</mat-option>
                <mat-option value="CANCELLED">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" (dateChange)="filterByDate($event)">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="table-container mat-elevation-z8">
            <table mat-table [dataSource]="schedules" matSort>
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.id }}</td>
              </ng-container>

              <!-- Route Name Column -->
              <ng-container matColumnDef="routeName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Route</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.routeName }}</td>
              </ng-container>

              <!-- Departure Time Column -->
              <ng-container matColumnDef="departureTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Departure</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.departureTime | date:'medium' }}</td>
              </ng-container>

              <!-- Arrival Time Column -->
              <ng-container matColumnDef="arrivalTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Arrival</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.arrivalTime | date:'medium' }}</td>
              </ng-container>

              <!-- Bus Number Column -->
              <ng-container matColumnDef="busNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Bus</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.busNumber }}</td>
              </ng-container>

              <!-- Driver Name Column -->
              <ng-container matColumnDef="driverName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Driver</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.driverName }}</td>
              </ng-container>

              <!-- Available Seats Column -->
              <ng-container matColumnDef="availableSeats">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Available Seats</th>
                <td mat-cell *matCellDef="let schedule">
                  <mat-chip-listbox>
                    <mat-chip [color]="schedule.availableSeats < 5 ? 'warn' : 'primary'" selected>
                      {{ schedule.availableSeats }}/{{ schedule.totalSeats }}
                    </mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.price | currency:'RWF ' }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let schedule">
                  <span class="status-badge" [ngClass]="schedule.status.toLowerCase()">
                    {{ schedule.status }}
                  </span>
                </td>
              </ng-container>

              <!-- Last Updated Column -->
              <ng-container matColumnDef="lastUpdated">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.lastUpdated | date:'medium' }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let schedule">
                  <button mat-icon-button color="primary" (click)="viewSchedule(schedule)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="editSchedule(schedule)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteSchedule(schedule)">
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

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of schedules"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .schedules-container {
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

    .status-badge.scheduled {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-badge.in_progress {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-badge.completed {
      background-color: #e8f5e9;
      color: #388e3c;
    }

    .status-badge.cancelled {
      background-color: #ffebee;
      color: #d32f2f;
    }

    mat-chip-listbox {
      display: inline-block;
    }
  `]
})
export class CompanySchedulesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Schedule>;

  schedules: Schedule[] = [];
  routes: any[] = [];
  displayedColumns: string[] = [
    'id', 'routeName', 'departureTime', 'arrivalTime', 'busNumber',
    'driverName', 'availableSeats', 'price', 'status', 'lastUpdated', 'actions'
  ];
  filteredSchedules: Schedule[] = [];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
    this.loadRoutes();
  }

  loadSchedules(): void {
    // In a real app, this would fetch from the API
    this.schedules = [
      {
        id: 1,
        routeName: 'Kigali-Kampala Express',
        departureTime: new Date(2024, 2, 15, 8, 0),
        arrivalTime: new Date(2024, 2, 15, 16, 0),
        busNumber: 'BUS001',
        driverName: 'John Doe',
        availableSeats: 15,
        totalSeats: 50,
        price: 15000,
        status: 'SCHEDULED',
        lastUpdated: new Date(2024, 2, 14, 10, 0)
      },
      {
        id: 2,
        routeName: 'Kigali-Bujumbura Route',
        departureTime: new Date(2024, 2, 15, 9, 0),
        arrivalTime: new Date(2024, 2, 15, 15, 0),
        busNumber: 'BUS002',
        driverName: 'Jane Smith',
        availableSeats: 3,
        totalSeats: 50,
        price: 12000,
        status: 'IN_PROGRESS',
        lastUpdated: new Date(2024, 2, 15, 9, 0)
      },
      {
        id: 3,
        routeName: 'Kigali-Gisenyi Express',
        departureTime: new Date(2024, 2, 15, 10, 0),
        arrivalTime: new Date(2024, 2, 15, 13, 0),
        busNumber: 'BUS003',
        driverName: 'Mike Johnson',
        availableSeats: 0,
        totalSeats: 50,
        price: 5000,
        status: 'COMPLETED',
        lastUpdated: new Date(2024, 2, 15, 13, 0)
      },
      {
        id: 4,
        routeName: 'Kigali-Cyangugu Route',
        departureTime: new Date(2024, 2, 15, 11, 0),
        arrivalTime: new Date(2024, 2, 15, 15, 0),
        busNumber: 'BUS004',
        driverName: 'Sarah Wilson',
        availableSeats: 45,
        totalSeats: 50,
        price: 7000,
        status: 'CANCELLED',
        lastUpdated: new Date(2024, 2, 15, 10, 0)
      },
      {
        id: 5,
        routeName: 'Kigali-Ruhengeri Express',
        departureTime: new Date(2024, 2, 15, 12, 0),
        arrivalTime: new Date(2024, 2, 15, 14, 0),
        busNumber: 'BUS005',
        driverName: 'David Brown',
        availableSeats: 20,
        totalSeats: 50,
        price: 4000,
        status: 'SCHEDULED',
        lastUpdated: new Date(2024, 2, 14, 15, 0)
      }
    ];
    this.filteredSchedules = [...this.schedules];
  }

  loadRoutes(): void {
    // In a real app, this would fetch from the API
    this.routes = [
      { id: 1, name: 'Kigali-Kampala Express' },
      { id: 2, name: 'Kigali-Bujumbura Route' },
      { id: 3, name: 'Kigali-Gisenyi Express' },
      { id: 4, name: 'Kigali-Cyangugu Route' },
      { id: 5, name: 'Kigali-Ruhengeri Express' }
    ];
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredSchedules = this.schedules.filter(schedule =>
      schedule.routeName.toLowerCase().includes(filterValue) ||
      schedule.busNumber.toLowerCase().includes(filterValue) ||
      schedule.driverName.toLowerCase().includes(filterValue)
    );
  }

  filterByRoute(event: any): void {
    const routeName = event.value;
    if (!routeName) {
      this.filteredSchedules = [...this.schedules];
      return;
    }
    this.filteredSchedules = this.schedules.filter(schedule => schedule.routeName === routeName);
  }

  filterByStatus(event: any): void {
    const status = event.value;
    if (!status) {
      this.filteredSchedules = [...this.schedules];
      return;
    }
    this.filteredSchedules = this.schedules.filter(schedule => schedule.status === status);
  }

  filterByDate(event: any): void {
    const selectedDate = event.value;
    if (!selectedDate) {
      this.filteredSchedules = [...this.schedules];
      return;
    }
    this.filteredSchedules = this.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.departureTime);
      return scheduleDate.toDateString() === selectedDate.toDateString();
    });
  }

  openAddScheduleDialog(): void {
    // In a real app, this would open a dialog to add a schedule
    this.snackBar.open('Add schedule functionality will be implemented', 'Close', { duration: 3000 });
  }

  viewSchedule(schedule: Schedule): void {
    // In a real app, this would open a dialog to view schedule details
    this.snackBar.open(`View schedule ${schedule.id} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  editSchedule(schedule: Schedule): void {
    // In a real app, this would open a dialog to edit a schedule
    this.snackBar.open(`Edit schedule ${schedule.id} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  deleteSchedule(schedule: Schedule): void {
    if (confirm(`Are you sure you want to delete schedule ${schedule.id}?`)) {
      // In a real app, this would delete the schedule from the API
      this.schedules = this.schedules.filter(s => s.id !== schedule.id);
      this.filteredSchedules = this.filteredSchedules.filter(s => s.id !== schedule.id);
      this.snackBar.open(`Schedule ${schedule.id} deleted successfully`, 'Close', { duration: 3000 });
    }
  }
}
