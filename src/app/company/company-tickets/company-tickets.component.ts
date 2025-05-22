  import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
  import {TicketService} from '../../services/ticket.service';
  import {AuthService} from '../../services/auth.service';
  import {MatPaginator} from '@angular/material/paginator';
  import {ViewChild} from '@angular/core';

  export interface Ticket {
    id: string;
    bookingId: string;
    customerName: string;
    route: string;
    date: Date;
    seats: number;
    status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'PENDING';
    price?: number; // Optional, for stats
  }


@Component({
  selector: 'app-company-tickets',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="tickets-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Company Tickets</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="stats" class="stats-chart">
            <canvas id="ticketStatsChart"></canvas>
          </div>
          <div *ngIf="loading" class="loading">Loading tickets...</div>
          <div *ngIf="error" class="error">{{ error }}</div>
          <table mat-table [dataSource]="tickets" matSort *ngIf="!loading && !error && tickets.length > 0">
            <!-- Columns unchanged -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.id }}</td>
            </ng-container>
            <ng-container matColumnDef="bookingId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Booking ID</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.bookingId }}</td>
            </ng-container>
            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.customerName }}</td>
            </ng-container>
            <ng-container matColumnDef="route">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Route</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.route }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.date | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="seats">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Seats</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.seats }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let ticket">
                <mat-chip-listbox>
                  <mat-chip [color]="getStatusColor(ticket.status)" selected>
                    {{ ticket.status }}
                  </mat-chip>
                </mat-chip-listbox>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let ticket">
                <button mat-icon-button color="primary" (click)="viewTicket(ticket)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="printTicket(ticket)">
                  <mat-icon>print</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="!loading && !error && tickets.length === 0" class="no-data">No tickets found.</div>
          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of tickets" *ngIf="!loading && !error && tickets.length > 0"></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './company-tickets.component.scss'
})
export class CompanyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  displayedColumns: string[] = ['id', 'bookingId', 'customerName', 'route', 'date', 'seats', 'status', 'actions'];
  loading: boolean = false;
  error: string | null = null;
  stats: { active: number; used: number; cancelled: number; pending: number } | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadStats();
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadTickets());
  }

  loadTickets() {
    this.loading = true;
    this.error = null;
    const companyId = this.authService.getCurrentUserId();
    if (!companyId) {
      this.loading = false;
      this.error = 'No company ID found. Please log in.';
      this.tickets = [];
      return;
    }
    const page = this.paginator?.pageIndex || 0;
    const size = this.paginator?.pageSize || 10;
    this.ticketService.getCompanyTickets(companyId, page, size).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load tickets. Please try again.';
        this.tickets = [];
        this.loading = false;
        console.error('Failed to load tickets:', error);
      }
    });
  }

  loadStats() {
    const companyId = this.authService.getCurrentUserId();
    if (!companyId) {
      return;
    }
    this.ticketService.getTicketStats(Number(companyId)).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Failed to load stats:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'USED': return 'accent';
      case 'CANCELLED': return 'warn';
      case 'PENDING': return 'default';
      default: return '';
    }
  }

  viewTicket(ticket: Ticket): void {
    console.log('View ticket:', ticket);
  }

  printTicket(ticket: Ticket): void {
    console.log('Print ticket:', ticket);
  }
}
