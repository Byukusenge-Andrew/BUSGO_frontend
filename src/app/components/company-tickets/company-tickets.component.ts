import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

interface Ticket {
  id: string;
  bookingId: string;
  customerName: string;
  route: string;
  date: Date;
  seats: number;
  status: 'ACTIVE' | 'USED' | 'CANCELLED';
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
          <table mat-table [dataSource]="tickets" matSort>
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.id }}</td>
            </ng-container>

            <!-- Booking ID Column -->
            <ng-container matColumnDef="bookingId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Booking ID</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.bookingId }}</td>
            </ng-container>

            <!-- Customer Name Column -->
            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.customerName }}</td>
            </ng-container>

            <!-- Route Column -->
            <ng-container matColumnDef="route">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Route</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.route }}</td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.date | date:'mediumDate' }}</td>
            </ng-container>

            <!-- Seats Column -->
            <ng-container matColumnDef="seats">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Seats</th>
              <td mat-cell *matCellDef="let ticket">{{ ticket.seats }}</td>
            </ng-container>

            <!-- Status Column -->
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

            <!-- Actions Column -->
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

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of tickets"></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .tickets-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    table {
      width: 100%;
    }

    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
  `]
})
export class CompanyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  displayedColumns: string[] = ['id', 'bookingId', 'customerName', 'route', 'date', 'seats', 'status', 'actions'];

  constructor() {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    // In a real app, this would fetch from the API
    this.tickets = [
      {
        id: 'T001',
        bookingId: 'BK001',
        customerName: 'John Doe',
        route: 'Kigali - Kampala',
        date: new Date(2023, 5, 15),
        seats: 2,
        status: 'ACTIVE'
      },
      {
        id: 'T002',
        bookingId: 'BK002',
        customerName: 'Jane Smith',
        route: 'Kigali - Bujumbura',
        date: new Date(2023, 5, 16),
        seats: 1,
        status: 'USED'
      },
      {
        id: 'T003',
        bookingId: 'BK003',
        customerName: 'Robert Johnson',
        route: 'Kigali - Gisenyi',
        date: new Date(2023, 5, 14),
        seats: 3,
        status: 'CANCELLED'
      }
    ];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'USED':
        return 'accent';
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }

  viewTicket(ticket: Ticket): void {
    // In a real app, this would open a dialog to view ticket details
    console.log('View ticket:', ticket);
  }

  printTicket(ticket: Ticket): void {
    // In a real app, this would print the ticket
    console.log('Print ticket:', ticket);
  }
}
