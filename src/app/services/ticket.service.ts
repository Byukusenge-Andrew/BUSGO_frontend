import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

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
      .pipe(map(tickets => tickets.map(ticket => this.convertTicket(ticket))));
  }





  // Get company tickets
  getCompanyTickets(companyId:string, page: number = 0, size: number = 10): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`/api/tickets/company/${companyId}`);
  }

  // Get user tickets
  getUserTickets(userId: string): Observable<Ticket[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(tickets => tickets.map(ticket => this.convertTicket(ticket))));
  }

  // Get ticket by ID
  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(ticket => this.convertTicket(ticket)));
  }

  // Update ticket status
  updateTicketStatus(id: string, status: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map(ticket => this.convertTicket(ticket)));
  }

  // Update check-in status
  updateCheckInStatus(id: string, isCheckedIn: boolean): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/check-in`, { isCheckedIn })
      .pipe(map(ticket => this.convertTicket(ticket)));
  }

  // Update ticket notes
  updateTicketNotes(id: string, notes: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/notes`, { notes })
      .pipe(map(ticket => this.convertTicket(ticket)));
  }

  // Cancel ticket
  cancelTicket(id: string, reason?: string): Observable<Ticket> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancel`, { reason })
      .pipe(map(ticket => this.convertTicket(ticket)));
  }

  // Get ticket statistics for a company
  getTicketStats(companyId: number): Observable<{ active: number; used: number; cancelled: number; pending: number }> {
    return this.http.get<{ active: number; used: number; cancelled: number; pending: number }>(`/api/tickets/company/${companyId}/stats`);
  }
  // Create a new ticket
  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<any>(`${this.apiUrl}`, ticket)
      .pipe(map(ticket => this.convertTicket(ticket)));
  }

  // Delete a ticket
  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
