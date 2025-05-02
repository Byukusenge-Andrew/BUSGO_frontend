
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Booking } from '../models/booking.model';
import {BusBooking} from '../types/auth.types';
import {AuthService} from './auth.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/BusBooking`;

  constructor(private http: HttpClient,
  private authService: AuthService
  ) {}
  /**
   * Converts backend BusBooking structure (any) to frontend Booking model.
   */
  private convertBooking(backendBooking: any): Booking {
    // Defensive checks for potentially null nested objects
    const userName = backendBooking.user ? `${backendBooking.user.firstName || ''} ${backendBooking.user.lastName || ''}`.trim() : 'Unknown User';
    const userEmail = backendBooking.user?.email || 'Unknown Email';
    const userPhone = backendBooking.user?.phone || 'Unknown Phone'; // Assuming 'phone' exists on backend User
    const routeName = backendBooking.schedule?.route?.name || 'Unknown Route';
    const departureTime = backendBooking.schedule?.departureTime || 'Unknown Time';
    const arrivalTime = backendBooking.schedule?.arrivalTime || 'Unknown Time';
    const companyId = backendBooking.schedule?.company?.id; // Extract companyId if available

    return {
      id: backendBooking.bookingId?.toString() || '', // Ensure ID is string
      customerName: userName,
      customerEmail: userEmail,
      customerPhone: userPhone,
      routeName: routeName,
      date: backendBooking.bookingDate ? new Date(backendBooking.bookingDate) : new Date(),
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      seats: backendBooking.numberOfSeats || 0,
      seatNumbers: backendBooking.seatNumbers || '',
      amount: backendBooking.totalFare || 0,
      status: backendBooking.status || 'UNKNOWN',
      paymentStatus: backendBooking.paymentStatus || 'UNKNOWN',
      paymentMethod: backendBooking.paymentMethod || 'UNKNOWN',
      transactionId: backendBooking.transactionId || '',
      companyId: companyId?.toString(), // Store companyId if needed
      scheduleId: backendBooking.schedule?.id?.toString(), // Store scheduleId if needed
      // Map additional fields if they exist in backendBooking and are needed in frontend Booking
      // busName: backendBooking.schedule?.bus?.registrationNumber || 'Unknown Bus', // Example
      // from: backendBooking.schedule?.route?.origin || 'Unknown', // Example
      // to: backendBooking.schedule?.route?.destination || 'Unknown', // Example
      // time: departureTime, // Example: reuse departureTime
      // totalAmount: backendBooking.totalFare || 0 // Example: reuse totalFare
    };
  }
  /**
   * Converts frontend Booking model back to the structure expected by the backend API.
   * NOTE: This is a general structure based on the backend model. Adjust fields as necessary.
   */
  private convertToBackendPayload(booking: Booking, userId: string | null): any {
    // Basic structure, assuming backend needs IDs for related entities
    // The backend needs to be able to resolve User and BusSchedule from these IDs.
    return {
      // bookingId is usually set by backend or path/param, not in body for create/update
      user: userId ? { id: Number(userId) } : null, // Send user ID object if available
      schedule: booking.scheduleId ? { id: Number(booking.scheduleId) } : null, // Send schedule ID object
      bookingDate: booking.date.toISOString(),
      status: booking.status,
      numberOfSeats: booking.seats,
      totalFare: booking.amount,
      seatNumbers: booking.seatNumbers || '',
      paymentMethod: booking.paymentMethod || 'PENDING', // Default or from booking
      paymentStatus: booking.paymentStatus || 'PENDING', // Default or from booking
      transactionId: booking.transactionId || '' // Default or from booking
    };
  }


  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }


  getCompanyBookings(companyId: string): Observable<Booking[]> {
    const parsedCompanyId = Number(companyId);
    if (isNaN(parsedCompanyId)) {
      console.error('Invalid company ID:', companyId);
      return throwError(() => new Error('Invalid company ID'));
    }
    // Using the path variable endpoint as defined in the controller
    return this.http.get<any[]>(`${this.apiUrl}/company/${parsedCompanyId}`)
      .pipe(
        map(bookings => bookings.map(booking => this.convertBooking(booking))),
        catchError(this.handleError)
      );
  }

  getBookingsByDateRange(startDate: Date, endDate: Date): Observable<Booking[]> {
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
    return this.http.get<any[]>(`${this.apiUrl}/GetBookingsByDateRange`, {
      params: { startDate: formattedStartDate, endDate: formattedEndDate }
    }).pipe(
      map(bookings => bookings.map(booking => this.convertBooking(booking))),
      catchError(this.handleError)
    );
  }

  updateBooking(id: string, booking: Booking): Observable<Booking> {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      console.error('Invalid booking ID for update:', id);
      return throwError(() => new Error('Invalid booking ID'));
    }

    // We need the user ID associated with the original booking if backend requires it.
    // This might need fetching the original booking first or having userId available.
    // For simplicity, assuming backend might not need userId for update or can derive it.
    // If backend requires userId for update payload, you need to fetch it first.
    const payload = this.convertToBackendPayload(booking, null); // Pass null for userId if not needed/available

    // Add bookingId to the payload if backend expects it *in the body* as well
    // payload.bookingId = parsedId; // Uncomment if backend needs bookingId in body

    console.log('Updating booking with payload:', payload);

    return this.http.put<any>(`${this.apiUrl}/UpdateBooking?id=${parsedId}`, payload)
      .pipe(
        map(updatedBackendBooking => this.convertBooking(updatedBackendBooking)),
        catchError(this.handleError)
      );
  }
  cancelBooking(bookingId: string): Observable<any> {
    const parsedId = Number(bookingId);
    if (isNaN(parsedId)) {
      console.error('Invalid booking ID for cancel:', bookingId);
      return throwError(() => new Error('Invalid booking ID'));
    }
    // Backend expects ID as RequestParam, body is empty for this specific endpoint
    return this.http.post<any>(`${this.apiUrl}/CancelBooking?id=${parsedId}`, {})
      .pipe(catchError(this.handleError));
  }

  deleteBooking(bookingId: string): Observable<any> {
    const parsedId = Number(bookingId);
    if (isNaN(parsedId)) {
      console.error('Invalid booking ID for delete:', bookingId);
      return throwError(() => new Error('Invalid booking ID'));
    }
    return this.http.delete<any>(`${this.apiUrl}/DeleteBusBooking?id=${parsedId}`)
      .pipe(catchError(this.handleError));
  }
  // Other methods remain the same
  getBookingById(id: string): Observable<Booking> {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      console.error('Invalid booking ID for get:', id);
      return throwError(() => new Error('Invalid booking ID'));
    }
    return this.http.get<any>(`${this.apiUrl}/GetBusBooking?id=${parsedId}`)
      .pipe(
        map(booking => this.convertBooking(booking)),
        catchError(this.handleError)
      );
  }

  getUserBookings(userId: string | null): Observable<Booking[]> {
    if (!userId) {
      console.error('User ID is null for getUserBookings');
      return throwError(() => new Error('User ID cannot be null'));
    }
    const parsedId = Number(userId);
    if (isNaN(parsedId)) {
      console.error('Invalid user ID for get bookings:', userId);
      return throwError(() => new Error('Invalid user ID'));
    }
    return this.http.get<any[]>(`${this.apiUrl}/GetBookingsByUser?userId=${parsedId}`)
      .pipe(
        map(bookings => bookings.map(booking => this.convertBooking(booking))),
        catchError(this.handleError)
      );
  }
  /**
   * Updates only the status of a booking.
   * Fetches the booking first, updates status, then calls updateBooking.
   */
  updateBookingStatus(id: string, status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'): Observable<Booking> {
    // This approach fetches the full booking, modifies it, and sends it back.
    // Consider if a dedicated backend endpoint `/UpdateBookingStatus` would be better.
    // For now, using the existing updateBooking method.
    // Note: updateBooking now returns Observable<Booking>, so the return type here is simplified.
    // return this.getBookingById(id).pipe(
    //   map(booking => {
    //     booking.status = status;
    //     // Potentially update other fields if needed based on status change
    //     return booking;
    //   }),
    //
    //   map(bookingToUpdate => this.updateBooking(id, bookingToUpdate)),
    //   catchError(this.handleError) // Add error handling
    // );
    // To fix the Observable<Observable<Booking>> issue, import switchMap and use:

    return this.getBookingById(id).pipe(
      map(booking => {
        booking.status = status;
        return booking;
      }),
      switchMap(bookingToUpdate => this.updateBooking(id, bookingToUpdate)), // Correct chaining
      catchError(this.handleError)
    );
  }


  // Add the missing bookTicket method
  /**
   * Creates a new bus booking
   * @param bookingData The booking data to be sent to the server
   * @returns An observable of the created booking
   */

  /**
   * Creates a new bus booking.
   */
  bookTicket(bookingData: {
    scheduleId: number;
    seats: number;
    amount: number; // Corresponds to totalFare
    date: Date; // Corresponds to bookingDate
    seatNumbers?: string;
  }): Observable<Booking> {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser && 'id' in currentUser ? (currentUser as any).id : null;

    if (!userId) {
      console.error("User must be logged in to book a ticket.");
      return throwError(() => new Error("User must be logged in to book a ticket."));
    }
    if (!bookingData.scheduleId) {
      console.error("Schedule ID is required to book a ticket.");
      return throwError(() => new Error("Schedule ID is required to book a ticket."));
    }

    // Construct the payload matching the backend BusBooking model structure
    // Send nested objects for user and schedule containing only their IDs.
    // The backend must be configured to handle this (e.g., fetch entities by ID).
    const payload = {
      user: { id: Number(userId) }, // Ensure ID is number if backend expects Long/int
      schedule: { id: Number(bookingData.scheduleId) }, // Ensure ID is number
      bookingDate: bookingData.date.toISOString(), // ISO 8601 format
      status: 'PENDING', // Default status
      numberOfSeats: bookingData.seats,
      totalFare: bookingData.amount,
      seatNumbers: bookingData.seatNumbers || '',
      paymentMethod: 'PENDING', // Default payment method
      paymentStatus: 'PENDING', // Default payment status
      transactionId: '' // Default or let backend generate
    };

    console.log('Booking ticket with payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/PostBusBooking`, payload)
      .pipe(
        map(createdBackendBooking => this.convertBooking(createdBackendBooking)), // Convert response
        catchError(this.handleError) // Handle potential errors
      );
  }

  // --- Utility Methods ---

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    // Customize error handling based on error structure (e.g., error.error.message)
    const errorMessage = error.message || 'Server error';
    return throwError(() => new Error(`An error occurred: ${errorMessage}`));
  }



}
