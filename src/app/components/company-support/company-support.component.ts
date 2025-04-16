import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-company-support',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
    MatIconModule
  ],
  template: `
    <div class="support-container">
      <div class="support-header">
        <h2>Support Center</h2>
        <button mat-raised-button color="primary" (click)="openNewTicketForm()">
          <mat-icon>add</mat-icon> New Support Ticket
        </button>
      </div>

      <div class="support-content">
        <mat-card *ngIf="showNewTicketForm">
          <mat-card-header>
            <mat-card-title>Create New Support Ticket</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>Subject</mat-label>
                <input matInput formControlName="subject" required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority" required>
                  <mat-option value="LOW">Low</mat-option>
                  <mat-option value="MEDIUM">Medium</mat-option>
                  <mat-option value="HIGH">High</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="5" required></textarea>
              </mat-form-field>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancelNewTicket()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="!ticketForm.valid">
                  Submit Ticket
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Your Support Tickets</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="tickets-list">
              <div *ngFor="let ticket of tickets" class="ticket-item">
                <div class="ticket-header">
                  <h3>{{ ticket.subject }}</h3>
                  <div class="ticket-meta">
                    <span class="ticket-id">#{{ ticket.id }}</span>
                    <span class="ticket-date">{{ ticket.createdAt | date:'mediumDate' }}</span>
                  </div>
                </div>
                <div class="ticket-priority" [ngClass]="ticket.priority.toLowerCase()">
                  {{ ticket.priority }}
                </div>
                <div class="ticket-status" [ngClass]="ticket.status.toLowerCase()">
                  {{ ticket.status }}
                </div>
                <p class="ticket-description">{{ ticket.description }}</p>
                <mat-divider></mat-divider>
                <div class="ticket-actions">
                  <button mat-button color="primary" (click)="viewTicketDetails(ticket)">
                    <mat-icon>visibility</mat-icon> View Details
                  </button>
                  <button mat-button color="accent" (click)="updateTicketStatus(ticket)">
                    <mat-icon>update</mat-icon> Update Status
                  </button>
                </div>
              </div>
              <div *ngIf="tickets.length === 0" class="no-tickets">
                <p>You don't have any support tickets yet.</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .support-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .support-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .support-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    mat-card {
      margin-bottom: 1rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .tickets-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ticket-item {
      padding: 1rem;
      border-radius: 4px;
      background-color: #f5f5f5;
      position: relative;
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .ticket-header h3 {
      margin: 0;
    }

    .ticket-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.8rem;
      color: #666;
    }

    .ticket-priority,
    .ticket-status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-right: 0.5rem;
    }

    .ticket-priority.low {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .ticket-priority.medium {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .ticket-priority.high {
      background-color: #ffebee;
      color: #c62828;
    }

    .ticket-status.open {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .ticket-status.in_progress {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .ticket-status.resolved {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .ticket-description {
      margin: 1rem 0;
      white-space: pre-line;
    }

    .ticket-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .no-tickets {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class CompanySupportComponent implements OnInit {
  tickets: SupportTicket[] = [];
  ticketForm: FormGroup;
  showNewTicketForm = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.ticketForm = this.fb.group({
      subject: ['', Validators.required],
      priority: ['MEDIUM', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    // In a real app, this would fetch from the API
    this.tickets = [
      {
        id: 'ST001',
        subject: 'Payment processing issue',
        description: 'Customers are unable to complete payments using mobile money.',
        status: 'OPEN',
        priority: 'HIGH',
        createdAt: new Date(2023, 5, 10),
        updatedAt: new Date(2023, 5, 10)
      },
      {
        id: 'ST002',
        subject: 'Route scheduling problem',
        description: 'Need to update the schedule for the Kigali-Kampala route.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        createdAt: new Date(2023, 5, 8),
        updatedAt: new Date(2023, 5, 9)
      },
      {
        id: 'ST003',
        subject: 'Website loading slowly',
        description: 'The company dashboard is loading very slowly on mobile devices.',
        status: 'RESOLVED',
        priority: 'LOW',
        createdAt: new Date(2023, 5, 5),
        updatedAt: new Date(2023, 5, 7)
      }
    ];
  }

  openNewTicketForm(): void {
    this.showNewTicketForm = true;
  }

  cancelNewTicket(): void {
    this.showNewTicketForm = false;
    this.ticketForm.reset({
      subject: '',
      priority: 'MEDIUM',
      description: ''
    });
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      // In a real app, this would submit to the API
      const newTicket: SupportTicket = {
        id: 'ST' + (this.tickets.length + 1).toString().padStart(3, '0'),
        subject: this.ticketForm.value.subject,
        description: this.ticketForm.value.description,
        status: 'OPEN',
        priority: this.ticketForm.value.priority,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.tickets.unshift(newTicket);
      this.snackBar.open('Support ticket created successfully', 'Close', { duration: 3000 });
      this.cancelNewTicket();
    }
  }

  viewTicketDetails(ticket: SupportTicket): void {
    // In a real app, this would open a dialog with ticket details
    console.log('View ticket details:', ticket);
  }

  updateTicketStatus(ticket: SupportTicket): void {
    // In a real app, this would open a dialog to update status
    console.log('Update ticket status:', ticket);
  }
}
