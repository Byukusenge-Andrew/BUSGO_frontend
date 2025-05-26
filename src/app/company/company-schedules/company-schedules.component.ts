import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import {ScheduleService} from '../../services/schedule.services';
import { RouteService } from '../../services/bus-route.service';
import { AuthService } from '../../services/auth.service';
import {AddScheduleDialogComponent} from './AddScheduleDialogComponent/AddScheduleDialogComponent';
import {Schedule} from '../../models/schedule.model';
import {EditScheduleDialogComponent} from './edit-schedule-dialog/edit-schedule-dialog.component';

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
              <input matInput (keyup)="applyFilter($event)" placeholder="Search by route or bus number" #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Route</mat-label>
              <mat-select (selectionChange)="filterByRoute($event)">
                <mat-option value="">All Routes</mat-option>
                <mat-option *ngFor="let route of routes" [value]="route.routeName">
                  {{ route.routeName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event)">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="SCHEDULED">Scheduled</mat-option>
                <mat-option value="FINISHED">FINISHED</mat-option>
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
            <table mat-table [dataSource]="filteredSchedules" matSort>
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.id }}</td>
              </ng-container>

              <ng-container matColumnDef="routeName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Route</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.routeName }}</td>
              </ng-container>

              <ng-container matColumnDef="sourceLocation">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Source</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.sourceLocation.locationName }} ({{ schedule.sourceLocation.city }})</td>
              </ng-container>

              <ng-container matColumnDef="destinationLocation">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Destination</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.destinationLocation.locationName }} ({{ schedule.destinationLocation.city }})</td>
              </ng-container>

              <ng-container matColumnDef="departureTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Departure</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.departureTime | date:'medium' }}</td>
              </ng-container>

              <ng-container matColumnDef="arrivalTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Arrival</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.arrivalTime | date:'medium' }}</td>
              </ng-container>

              <ng-container matColumnDef="busNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Bus</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.busNumber }}</td>
              </ng-container>

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

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
                <td mat-cell *matCellDef="let schedule">{{ schedule.price | currency:'RWF ' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let schedule">
                  <span class="status-badge" [ngClass]="schedule.status.toLowerCase()">
                    {{ schedule.status }}
                  </span>
                </td>
              </ng-container>

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

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="11">No data matching the filter "{{ input.value }}"</td>
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
    'id', 'routeName', 'sourceLocation', 'destinationLocation', 'departureTime',
    'arrivalTime', 'busNumber', 'availableSeats', 'price', 'status', 'actions'
  ];
  filteredSchedules: Schedule[] = [];
  private isLoading: boolean | undefined;
  private dataSource: any;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private scheduleService: ScheduleService,
    private routeService: RouteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
    this.loadRoutes();
  }

  loadSchedules(): void {
    const companyId = this.authService.getCurrentUserId();
    if (companyId) {
      this.scheduleService.getAllSchedules().subscribe({
        next: (schedules) => {
          this.schedules = schedules.filter(schedule => schedule.companyId === Number(companyId));
          this.filteredSchedules = [...this.schedules];
          this.table.renderRows();
          if (this.paginator) {
            this.paginator.length = this.filteredSchedules.length;
          }
        },
        error: (error) => {
          this.snackBar.open('Failed to load schedules: ' + error.message, 'Close', { duration: 5000 });
        }
      });
    } else {
      this.snackBar.open('Authentication error. Please log in again.', 'Close', { duration: 5000 });
    }
  }

  loadRoutes(): void {
    const companyId = this.authService.getCurrentUserId();
    if (companyId) {
      this.routeService.getCompanyRoutes(companyId).subscribe({
        next: (routes) => {
          this.routes = routes;
        },
        error: (error) => {
          this.snackBar.open('Failed to load routes: ' + error.message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredSchedules = this.schedules.filter(schedule =>
      schedule.routeName.toLowerCase().includes(filterValue) ||
      schedule.busNumber.toLowerCase().includes(filterValue) ||
      schedule.sourceLocation.locationName.toLowerCase().includes(filterValue) ||
      schedule.destinationLocation.locationName.toLowerCase().includes(filterValue)
    );
    this.table.renderRows();
    if (this.paginator) {
      this.paginator.length = this.filteredSchedules.length;
    }
  }

  filterByRoute(event: any): void {
    const routeName = event.value;
    if (!routeName) {
      this.filteredSchedules = [...this.schedules];
    } else {
      this.filteredSchedules = this.schedules.filter(schedule => schedule.routeName === routeName);
    }
    this.table.renderRows();
    if (this.paginator) {
      this.paginator.length = this.filteredSchedules.length;
    }
  }

  filterByStatus(event: any): void {
    const status = event.value;
    if (!status) {
      this.filteredSchedules = [...this.schedules];
    } else {
      this.filteredSchedules = this.schedules.filter(schedule => schedule.status === status);
    }
    this.table.renderRows();
    if (this.paginator) {
      this.paginator.length = this.filteredSchedules.length;
    }
  }

  filterByDate(event: any): void {
    const selectedDate = event.value;
    if (!selectedDate) {
      this.filteredSchedules = [...this.schedules];
    } else {
      this.filteredSchedules = this.schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.departureTime);
        return scheduleDate.toDateString() === selectedDate.toDateString();
      });
    }
    this.table.renderRows();
    if (this.paginator) {
      this.paginator.length = this.filteredSchedules.length;
    }
  }

  openAddScheduleDialog(): void {
    const dialogRef = this.dialog.open(AddScheduleDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.schedules.push(result);
        this.filteredSchedules = [...this.schedules];
        this.table.renderRows();
        if (this.paginator) {
          this.paginator.length = this.filteredSchedules.length;
        }
      }
    });
  }

  viewSchedule(schedule: Schedule): void {
    this.snackBar.open(`View schedule ${schedule.id} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  editSchedule(schedule: Schedule): void {
    // Open dialog and pass a copy of the schedule
    this.snackBar.open(`Schedule ${schedule.id} opened for editing`, 'Close', { duration: 3000 })
    const ref = this.dialog.open(EditScheduleDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { schedule: { ...schedule } }
    });

    ref.afterClosed().subscribe((result: Schedule|undefined) => {
      if (!result) {
        // dialog was cancelled
        this.snackBar.open(`Schedule editing canceled`, 'Close', { duration: 3000 })
        return;
      }

      // show loading spinner
      this.isLoading = true;

      // call update on backend
      this.scheduleService.updateSchedule(result.id, result).subscribe({
        next: (updated) => {
          // find index in current dataSource
          const idx = this.dataSource.data.findIndex((s: { id: number; }) => s.id === updated.id);
          if (idx > -1) {
            const arr = [...this.dataSource.data];
            arr[idx] = updated;
            this.dataSource.data = arr;  // reassign to trigger table update
          }
          this.snackBar.open(`Schedule ${updated.id} updated successfully.`, 'Close', { duration: 3000 });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating schedule:', err);
          this.snackBar.open(`Failed to update: ${err.error?.message|| err.message|| err}`, 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
    });


  }


  deleteSchedule(schedule: Schedule): void {
    if (confirm(`Are you sure you want to delete schedule ${schedule.id}?`)) {
      this.scheduleService.deleteSchedule(schedule.id).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(s => s.id !== schedule.id);
          this.filteredSchedules = this.filteredSchedules.filter(s => s.id !== schedule.id);
          this.table.renderRows();
          if (this.paginator) {
            this.paginator.length = this.filteredSchedules.length;
          }
          this.snackBar.open(`Schedule ${schedule.id} deleted successfully`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          let errorMessage = 'Failed to delete schedule';
          if (error.error?.error) {
            errorMessage += `: ${error.error.error}`;
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }
}
