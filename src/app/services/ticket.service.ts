import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export interface TicketFilter {
  status?: string;
  routeId?: string;
  date?: Date;
  searchTerm?: string;
  companyId?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  // Helper method to convert backend ticket to frontend format
  private convertTicket(ticket: any): Ticket {
    return {
      ...ticket,
      id: ticket.id.toString(), // Convert Long to string
      departureDate: ticket.departureDate ? new Date(ticket.departureDate) : null,
      checkInTime: ticket.checkInTime ? new Date(ticket.checkInTime) : null,
      createdAt: ticket.createdAt ? new Date(ticket.createdAt) : null,
      price: Number(ticket.price),
      status: ticket.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED',
      paymentStatus: ticket.paymentStatus as 'PAID' | 'PENDING' | 'REFUNDED',
      checkInStatus: ticket.checkInStatus as 'NOT_CHECKED_IN' | 'CHECKED_IN'
    };
  }

  // Helper method to handle errors
  private handleError(message: string, error: HttpErrorResponse): Observable<never> {
    console.error(`${message}:`, error);
    let errorMessage = message;
    if (error.error?.message) {
      errorMessage += `: ${error.error.message}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
    return throwError(() => error);
  }

  // Get all tickets with optional filters
  getTickets(filter?: TicketFilter): Observable<Ticket[]> {
    let params = new HttpParams();
    if (filter) {
      (Object.keys(filter) as Array<keyof TicketFilter>).forEach(key => {
        if (filter[key] !== undefined && filter[key] !== null) {
          params = params.set(key, filter[key].toString());
        }
      });
    }

    return this.http.get<any[]>(`${this.apiUrl}`, { params })
      .pipe(
        map(tickets => tickets.map(ticket => this.convertTicket(ticket))),
        catchError(error => {
          this.handleError('Failed to fetch tickets', error);
          return of([]);
        })
      );
  }





  // Get company tickets
  getCompanyTickets(companyId:string, page: number = 0, size: number = 10): Observable<Ticket[]> {
    return this.http.get<any[]>(`/api/tickets/company/${companyId}`)
      .pipe(
        map(tickets => tickets.map(ticket => this.convertTicket(ticket))),
        catchError(error => {
          this.handleError(`Failed to fetch tickets for company ${companyId}`, error);
          return of([]);
        })
      );
  }

  // Get user tickets
  getUserTickets(userId: string): Observable<Ticket[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map(tickets => tickets.map(ticket => this.convertTicket(ticket))),
        catchError(error => {
          this.handleError(`Failed to fetch tickets for user ${userId}`, error);
          return of([]);
        })
      );
  }

  // Get ticket by ID
  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(ticket => this.convertTicket(ticket)),
        catchError(error => {
          this.handleError(`Failed to fetch ticket ${id}`, error);
          return throwError(() => error);
        })
      );
  }

  // Update ticket status
  updateTicketStatus(id: string, status: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        map(ticket => this.convertTicket(ticket)),
        tap(() => {
          this.snackBar.open(`Ticket status updated to ${status}`, 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError(`Failed to update ticket status`, error);
          return throwError(() => error);
        })
      );
  }

  // Update check-in status
  updateCheckInStatus(id: string, isCheckedIn: boolean): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/check-in`, { isCheckedIn })
      .pipe(
        map(ticket => this.convertTicket(ticket)),
        tap(() => {
          const message = isCheckedIn ? 'Passenger checked in successfully' : 'Check-in status updated';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError(`Failed to update check-in status`, error);
          return throwError(() => error);
        })
      );
  }

  // Update ticket notes
  updateTicketNotes(id: string, notes: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/notes`, { notes })
      .pipe(
        map(ticket => this.convertTicket(ticket)),
        tap(() => {
          this.snackBar.open('Ticket notes updated successfully', 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError(`Failed to update ticket notes`, error);
          return throwError(() => error);
        })
      );
  }

  // Cancel ticket
  cancelTicket(id: string, reason?: string): Observable<Ticket> {
    const payload = { reason: reason || 'Cancelled by user' };
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancel`, payload)
      .pipe(
        map(ticket => this.convertTicket(ticket)),
        tap(() => {
          this.snackBar.open('Ticket cancelled successfully', 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError(`Failed to cancel ticket`, error);
          return throwError(() => error);
        })
      );
  }

  // Resend ticket
  resendTicket(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/resend`, {})
      .pipe(
        tap(() => {
          this.snackBar.open('Ticket resent successfully', 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError(`Failed to resend ticket`, error);
          return throwError(() => error);
        })
      );
  }

  // Get ticket statistics for a company
  getTicketStats(companyId: number): Observable<{ active: number; used: number; cancelled: number; pending: number }> {
    return this.http.get<{ active: number; used: number; cancelled: number; pending: number }>(`/api/tickets/company/${companyId}/stats`)
      .pipe(
        catchError(error => {
          this.handleError(`Failed to fetch ticket stats for company ${companyId}`, error);
          return of({ active: 0, used: 0, cancelled: 0, pending: 0 });
        })
      );
  }

  // Create a new ticket
  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<any>(`${this.apiUrl}`, ticket)
      .pipe(
        map(ticket => this.convertTicket(ticket)),
        tap(() => {
          this.snackBar.open('Ticket created successfully', 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError(`Failed to create ticket`, error);
          return throwError(() => error);
        })
      );
  }

  // Delete a ticket
  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.snackBar.open('Ticket deleted successfully', 'Close', { duration: 3000 });
        }),
        catchError(error => {
          this.handleError(`Failed to delete ticket`, error);
          return throwError(() => error);
        })
      );
  }
}
