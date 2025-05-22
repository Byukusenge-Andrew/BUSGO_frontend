import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, User } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Ticket, TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-company-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <div class="tickets-container">
      <div class="header">
        <h1>Tickets Management</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/company/dashboard">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
        </div>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput placeholder="Search tickets..." (keyup)="applyFilter($event)">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="all">All</mat-option>
                <mat-option value="CONFIRMED">Confirmed</mat-option>
                <mat-option value="PENDING">Pending</mat-option>
                <mat-option value="CANCELLED">Cancelled</mat-option>
                <mat-option value="COMPLETED">Completed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" placeholder="Choose date" (dateChange)="filterByDate($event)">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Route</mat-label>
              <mat-select (selectionChange)="filterByRoute($event.value)">
                <mat-option value="all">All Routes</mat-option>
                <mat-option value="Kigali-Musanze Express">Kigali-Musanze Express</mat-option>
                <mat-option value="Kigali-Huye Express">Kigali-Huye Express</mat-option>
                <mat-option value="Kigali-Rubavu Special">Kigali-Rubavu Special</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="accent" (click)="resetFilters()">
              <mat-icon>filter_alt_off</mat-icon>
              Reset Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="stats-row">
        <mat-card class="stat-card">
          <div class="stat-value">{{ totalTickets }}</div>
          <div class="stat-label">Total Tickets</div>
        </mat-card>
        <mat-card class="stat-card confirmed">
          <div class="stat-value">{{ confirmedTickets }}</div>
          <div class="stat-label">Confirmed</div>
        </mat-card>
        <mat-card class="stat-card pending">
          <div class="stat-value">{{ pendingTickets }}</div>
          <div class="stat-label">Pending</div>
        </mat-card>
        <mat-card class="stat-card cancelled">
          <div class="stat-value">{{ cancelledTickets }}</div>
          <div class="stat-label">Cancelled</div>
        </mat-card>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading tickets...</p>
      </div>

      <div *ngIf="!loading && tickets.length === 0" class="no-results">
        <mat-icon>filter_list</mat-icon>
        <h3>No tickets match your search criteria</h3>
        <p>Try adjusting your filters or create a new ticket</p>
      </div>

      <div *ngIf="!loading && tickets.length > 0" class="table-container">
        <table mat-table [dataSource]="filteredTickets" matSort (matSortChange)="sortData($event)" class="mat-elevation-z8">
          <!-- Ticket ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Ticket ID</th>
            <td mat-cell *matCellDef="let ticket">{{ ticket.id }}</td>
          </ng-container>

          <!-- Route Column -->
          <ng-container matColumnDef="route">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Route</th>
            <td mat-cell *matCellDef="let ticket">
              <div class="route-cell">
                <div class="route-name">{{ ticket.routeName }}</div>
                <div class="route-path">{{ ticket.origin }} → {{ ticket.destination }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Departure Column -->
          <ng-container matColumnDef="departure">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Departure</th>
            <td mat-cell *matCellDef="let ticket">
              <div class="date-time">
                <div class="date">{{ ticket.departureDate | date:'MMM d, y' }}</div>
                <div class="time">{{ ticket.departureTime }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Passenger Column -->
          <ng-container matColumnDef="passenger">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Passenger</th>
            <td mat-cell *matCellDef="let ticket">{{ ticket.passengerName }}</td>
          </ng-container>

          <!-- Seats Column -->
          <ng-container matColumnDef="seats">
            <th mat-header-cell *matHeaderCellDef>Seats</th>
            <td mat-cell *matCellDef="let ticket">
              <div class="seats-cell">
                <mat-chip-listbox>
                  <mat-chip *ngFor="let seat of ticket.seatNumbers">{{ seat }}</mat-chip>
                </mat-chip-listbox>
              </div>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let ticket">
              <div class="status-chip" [ngClass]="ticket.status.toLowerCase()">
                {{ ticket.status }}
              </div>
            </td>
          </ng-container>

          <!-- Payment Column -->
          <ng-container matColumnDef="payment">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment</th>
            <td mat-cell *matCellDef="let ticket">
              <div class="payment-chip" [ngClass]="ticket.paymentStatus.toLowerCase()">
                {{ ticket.paymentStatus }}
              </div>
            </td>
          </ng-container>

          <!-- Check-in Column -->
          <ng-container matColumnDef="checkIn">
            <th mat-header-cell *matHeaderCellDef>Check-in</th>
            <td mat-cell *matCellDef="let ticket">
              <div class="checkin-indicator" [ngClass]="ticket.checkInStatus === 'CHECKED_IN' ? 'checked-in' : 'not-checked-in'"
                matTooltip="{{ ticket.checkInStatus === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In' }}">
                <mat-icon>{{ ticket.checkInStatus === 'CHECKED_IN' ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let ticket">
              <div class="action-buttons">
                <button mat-icon-button color="primary" [routerLink]="['/company/tickets', ticket.id]" matTooltip="View Details">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" matTooltip="Print Ticket" (click)="printTicket(ticket)">
                  <mat-icon>print</mat-icon>
                </button>
                <button mat-icon-button color="warn" *ngIf="ticket.status !== 'CANCELLED'" matTooltip="Cancel Ticket" (click)="cancelTicket(ticket)">
                  <mat-icon>cancel</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            [ngClass]="{'cancelled-row': row.status === 'CANCELLED', 'completed-row': row.status === 'COMPLETED'}"></tr>
        </table>

        <mat-paginator
          [pageSizeOptions]="[10, 25, 50]"
          [pageSize]="10"
          [length]="filteredTickets.length"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .tickets-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .filter-card {
      margin-bottom: 1.5rem;
      border-radius: 8px;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .filters .mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      padding: 1rem;
      text-align: center;
      border-radius: 8px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 500;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-card.confirmed {
      background-color: #e8f5e9;
    }

    .stat-card.pending {
      background-color: #fff8e1;
    }

    .stat-card.cancelled {
      background-color: #ffebee;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .loading-container p {
      margin-top: 1rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-results {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .no-results mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      margin-bottom: 1rem;
      color: rgba(0, 0, 0, 0.4);
    }

    .no-results h3 {
      margin: 0 0 0.5rem 0;
      color: rgba(0, 0, 0, 0.8);
    }

    .no-results p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .route-cell {
      display: flex;
      flex-direction: column;
    }

    .route-name {
      font-weight: 500;
    }

    .route-path {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .date-time {
      display: flex;
      flex-direction: column;
    }

    .time {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .seats-cell mat-chip {
      min-height: 24px;
      font-size: 0.75rem;
    }

    .status-chip, .payment-chip {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      text-align: center;
      display: inline-block;
      text-transform: uppercase;
    }

    .status-chip.confirmed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-chip.pending {
      background-color: #fff8e1;
      color: #ff8f00;
    }

    .status-chip.cancelled {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-chip.completed {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .payment-chip.paid {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .payment-chip.pending {
      background-color: #fff8e1;
      color: #ff8f00;
    }

    .payment-chip.refunded {
      background-color: #ffebee;
      color: #c62828;
    }

    .checkin-indicator {
      display: flex;
      justify-content: center;
    }

    .checkin-indicator.checked-in {
      color: #2e7d32;
    }

    .checkin-indicator.not-checked-in {
      color: rgba(0, 0, 0, 0.3);
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    tr.cancelled-row {
      background-color: rgba(255, 235, 238, 0.3);
    }

    tr.completed-row {
      background-color: rgba(227, 242, 253, 0.3);
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
      }

      .filters .mat-form-field {
        width: 100%;
      }

      .stats-row {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 576px) {
      .stats-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompanyTicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  displayedColumns: string[] = ['id', 'route', 'departure', 'passenger', 'seats', 'status', 'payment', 'checkIn', 'actions'];
  loading = true;
  error: string | null = null;

  // Stats
  totalTickets = 0;
  confirmedTickets = 0;
  pendingTickets = 0;
  cancelledTickets = 0;

  // Filtering
  filterStatus: string | null = null;
  filterDate: Date | null = null;
  filterRoute: string | null = null;
  searchTerm: string = '';

  private destroy$ = new Subject<void>();
  private companyId: string | null = null;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (!user) {
        this.error = 'User not authenticated';
        this.loading = false;
        return;
      }

      const userRole = this.authService.currentUserRole;
      if (userRole !== 'COMPANY' && userRole !== 'ADMIN') {
        this.error = 'You do not have permission to view this ticket';
        this.loading = false;
        return;
      }

      // Set company ID if user is a company
      if (userRole === 'COMPANY' && 'companyId' in user) {
        this.companyId = user.companyId;
      }

      this.loadTickets();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTickets(): void {
    this.loading = true;

    // Create filter
    const filter: any = {};
    if (this.filterStatus) filter.status = this.filterStatus;
    if (this.filterRoute) filter.routeId = this.filterRoute;
    if (this.filterDate) filter.date = this.filterDate;
    if (this.searchTerm) filter.searchTerm = this.searchTerm;

    // If admin, get all tickets, otherwise get company tickets
    const request = this.authService.isAdmin
      ? this.ticketService.getTickets(filter)
      : this.ticketService.getCompanyTickets(this.companyId as string, filter);

    request.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data: Ticket[]) => {
        this.tickets = data;
        this.filteredTickets = [...this.tickets];
        this.updateStats();
      },
      error: (err: Error) => {
        console.error(err);
        this.error = 'Failed to load tickets. Please try again.';
        this.snackBar.open('Error loading tickets', 'Dismiss', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.loadTickets();
  }

  filterByStatus(status: string): void {
    this.filterStatus = status === 'all' ? null : status;
    this.loadTickets();
  }

  filterByDate(event: any): void {
    this.filterDate = event.value;
    this.loadTickets();
  }

  filterByRoute(route: string): void {
    this.filterRoute = route === 'all' ? null : route;
    this.loadTickets();
  }

  resetFilters(): void {
    this.filterStatus = null;
    this.filterDate = null;
    this.filterRoute = null;
    this.searchTerm = '';
    this.loadTickets();
  }

  sortData(sort: Sort): void {
    const data = [...this.filteredTickets];

    if (!sort.active || sort.direction === '') {
      this.filteredTickets = data;
      return;
    }

    this.filteredTickets = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return compare(a.id, b.id, isAsc);
        case 'route': return compare(a.route, b.route, isAsc);
        case 'departure': return compareDate(a.date, b.date, isAsc);
        case 'passenger': return compare(a.customerName, b.customerName, isAsc);
        case 'status': return compare(a.status, b.status, isAsc);
        case 'payment': return compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    // In a real app, would adjust the pagination parameters and reload data
    console.log('Page changed:', event);
  }

  updateStats(): void {
    this.totalTickets = this.tickets.length;
    this.confirmedTickets = this.tickets.filter(t => t.status === 'ACTIVE').length;
    this.pendingTickets = this.tickets.filter(t => t.status === 'PENDING').length;
    this.cancelledTickets = this.tickets.filter(t => t.status === 'CANCELLED').length;
  }

  cancelTicket(ticket: Ticket): void {
    if (confirm('Are you sure you want to cancel this ticket?')) {
      this.ticketService.cancelTicket(ticket.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.snackBar.open('Ticket cancelled successfully', 'Close', { duration: 3000 });
          this.loadTickets();
        },
        error: (err: Error) => {
          console.error(err);
          this.snackBar.open('Failed to cancel ticket', 'Close', { duration: 3000 });
        }
      });
    }
  }

  printTicket(ticket: Ticket): void {
    // In real app, would generate a printable version or PDF
    this.snackBar.open('Preparing ticket for printing...', 'Close', { duration: 3000 });

    // Simulate print preparation
    setTimeout(() => {
      window.print();
    }, 500);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function compareDate(a: Date, b: Date, isAsc: boolean): number {
  return (a.getTime() < b.getTime() ? -1 : 1) * (isAsc ? 1 : -1);
}
