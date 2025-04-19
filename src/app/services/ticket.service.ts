import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Ticket {
  id: string;
  bookingId: string;
  routeName: string;
  origin: string;
  destination: string;
  departureDate: Date;
  departureTime: string;
  busRegistration: string;
  seatNumbers: string[];
  passengerName: string;
  passengerEmail: string;
  passengerPhone?: string;
  price: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  checkInStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN';
  checkInTime?: Date;
  notes?: string;
  createdAt: Date;
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

  // Get all tickets with optional filters
  getTickets(filter?: TicketFilter): Observable<Ticket[]> {
    // Mock data for now, would use real API later
    return of(this.generateMockTickets(25));
  }

  // Get company tickets
  getCompanyTickets(companyId: string, filter?: TicketFilter): Observable<Ticket[]> {
    // Mock data for now, would use real API later
    return of(this.generateMockTickets(20));
  }

  // Get user tickets
  getUserTickets(userId: string): Observable<Ticket[]> {
    // Mock data for now, would use real API later
    return of(this.generateMockTickets(8));
  }

  // Get ticket by ID
  getTicketById(id: string): Observable<Ticket> {
    // Mock data for now, would use real API later
    return of(this.generateMockTickets(1)[0]);
  }

  // Update ticket status
  updateTicketStatus(id: string, status: string): Observable<Ticket> {
    // Mock data for now, would use real API later
    const ticket = this.generateMockTickets(1)[0];
    ticket.status = status as any;
    return of(ticket);
  }

  // Update check-in status
  updateCheckInStatus(id: string, isCheckedIn: boolean): Observable<Ticket> {
    // Mock data for now, would use real API later
    const ticket = this.generateMockTickets(1)[0];
    ticket.checkInStatus = isCheckedIn ? 'CHECKED_IN' : 'NOT_CHECKED_IN';
    ticket.checkInTime = isCheckedIn ? new Date() : undefined;
    return of(ticket);
  }

  // Update ticket notes
  updateTicketNotes(id: string, notes: string): Observable<Ticket> {
    // Mock data for now, would use real API later
    const ticket = this.generateMockTickets(1)[0];
    ticket.notes = notes;
    return of(ticket);
  }

  // Cancel ticket
  cancelTicket(id: string, reason?: string): Observable<Ticket> {
    // Mock data for now, would use real API later
    const ticket = this.generateMockTickets(1)[0];
    ticket.status = 'CANCELLED';
    ticket.paymentStatus = 'REFUNDED';
    return of(ticket);
  }

  // Get ticket statistics for a company
  getTicketStats(companyId: string): Observable<any> {
    // Mock data for now, would use real API later
    return of({
      totalTickets: 45,
      confirmedTickets: 25,
      pendingTickets: 10,
      cancelledTickets: 5,
      completedTickets: 5
    });
  }

  // Private helper to generate mock tickets
  private generateMockTickets(count: number): Ticket[] {
    const tickets: Ticket[] = [];
    
    for (let i = 0; i < count; i++) {
      const statuses = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'];
      const paymentStatuses = ['PAID', 'PENDING', 'REFUNDED'];
      const checkInStatuses = ['CHECKED_IN', 'NOT_CHECKED_IN'];
      const routes = [
        { name: 'Kigali-Musanze Express', origin: 'Kigali', destination: 'Musanze' },
        { name: 'Kigali-Huye Express', origin: 'Kigali', destination: 'Huye' },
        { name: 'Kigali-Rubavu Special', origin: 'Kigali', destination: 'Rubavu' }
      ];
      
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      const route = routes[Math.floor(Math.random() * routes.length)];
      const seatCount = Math.floor(Math.random() * 4) + 1;
      const seats = Array(seatCount).fill(null).map(() => {
        const row = String.fromCharCode(65 + Math.floor(Math.random() * 8));
        const col = Math.floor(Math.random() * 9) + 1;
        return `${row}${col}`;
      });
      
      tickets.push({
        id: 'T' + (1000 + i),
        bookingId: 'B' + (2000 + i),
        routeName: route.name,
        origin: route.origin,
        destination: route.destination,
        departureDate: new Date(Date.now() + (Math.floor(Math.random() * 14) * 86400000)),
        departureTime: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        busRegistration: `RAB ${100 + Math.floor(Math.random() * 900)}`,
        passengerName: `Passenger ${i + 1}`,
        passengerEmail: `passenger${i + 1}@example.com`,
        passengerPhone: Math.random() > 0.3 ? `+250 78${Math.floor(Math.random() * 1000000)}` : undefined,
        seatNumbers: seats,
        price: Math.floor(Math.random() * 10000) + 5000,
        status: status,
        paymentStatus: status === 'CANCELLED' ? 'REFUNDED' : (status === 'CONFIRMED' ? 'PAID' : paymentStatuses[Math.floor(Math.random() * 2)]) as any,
        checkInStatus: status === 'COMPLETED' ? 'CHECKED_IN' : checkInStatuses[Math.floor(Math.random() * checkInStatuses.length)] as any,
        checkInTime: status === 'COMPLETED' ? new Date() : undefined,
        notes: Math.random() > 0.7 ? 'Some notes about this ticket' : undefined,
        createdAt: new Date(Date.now() - (Math.floor(Math.random() * 30) * 86400000))
      });
    }
    
    return tickets;
  }
} 