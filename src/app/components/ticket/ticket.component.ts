import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingService } from '../../services/bus-booking.service';
import { Booking } from '../../models/booking.model';
import { MatError } from '@angular/material/input';
import { Observable, of, delay } from 'rxjs';

// Enhanced Booking interface with additional fields
interface EnhancedBooking extends Booking {
  distance?: number;
  busNumber?: string;
  seatType?: string;
  bookingDate?: Date;
  age?: number;
  basePrice?: number;
  taxes?: number;
  paymentDate?: Date;
  qrCode?: string;
  canModify?: boolean;
  canCancel?: boolean;
  refundAmount?: number;
  refundStatus?: string;
}

// Interface for confirmation dialog data
interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatToolbarModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatError
  ]
})
export class TicketComponent implements OnInit {
  ticket: EnhancedBooking | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  isCanceling = false;
  isModifying = false;
  isRequestingRefund = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTicketData();
  }

  private loadTicketData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.handleError('Invalid booking ID');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.ticket = this.enhanceBookingData(booking);
        this.isLoading = false;
        this.showSuccessMessage('Ticket details loaded successfully');
      },
      error: (err: any) => {
        this.handleError(err.message || 'Failed to load ticket details');
      }
    });
  }

  private enhanceBookingData(booking: Booking): EnhancedBooking {
    const enhanced: EnhancedBooking = {
      ...booking,
      from: booking.from || booking.routeName?.split(' to ')[0] || 'Unknown',
      to: booking.to || booking.routeName?.split(' to ')[1] || 'Unknown',
      time: booking.time || booking.departureTime,
      totalAmount: booking.totalAmount || booking.amount,
      // Add enhanced fields with fallbacks - using optional chaining and type assertion
      distance: (booking as any).distance || this.calculateDistance(booking.from, booking.to),
      busNumber: (booking as any).busNumber || `BUS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      seatType: (booking as any).seatType || 'Standard',
      bookingDate: (booking as any).bookingDate || new Date(),
      age: (booking as any).age || 25,
      basePrice: (booking as any).basePrice || (booking.totalAmount || booking.amount || 0) * 0.85,
      taxes: (booking as any).taxes || (booking.totalAmount || booking.amount || 0) * 0.15,
      paymentDate: (booking as any).paymentDate || new Date(),
      qrCode: (booking as any).qrCode || this.generateQRCode(booking.id),
      canModify: this.canModifyBooking(booking),
      canCancel: this.canCancelBooking(booking),
      refundAmount: (booking as any).refundAmount || 0,
      refundStatus: (booking as any).refundStatus || 'N/A'
    };

    return enhanced;
  }

  private calculateDistance(from?: string, to?: string): number {
    // Mock distance calculation - in real app, this would use a mapping service
    if (!from || !to) return 0;
    return Math.floor(Math.random() * 500) + 50; // Random distance between 50-550 km
  }

  private generateQRCode(bookingId: string): string {
    // Mock QR code generation - in real app, this would generate actual QR code
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          ${bookingId}
        </text>
      </svg>
    `)}`;
  }

  // Fixed method names to match the interface usage
  private canModifyBooking(booking: Booking): boolean {
    const travelDate = new Date(booking.date);
    const now = new Date();
    const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 3600);

    return booking.status !== 'CANCELLED' &&
      booking.status !== 'COMPLETED' &&
      hoursDifference > 24; // Can modify if more than 24 hours before travel
  }

  private canCancelBooking(booking: Booking): boolean {
    const travelDate = new Date(booking.date);
    const now = new Date();
    const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 3600);

    return booking.status !== 'CANCELLED' &&
      booking.status !== 'COMPLETED' &&
      hoursDifference > 2; // Can cancel if more than 2 hours before travel
  }

  retryLoading() {
    this.loadTicketData();
  }

  cancelBooking() {
    if (!this.ticket?.id || !this.canCancel()) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Booking',
        message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
        confirmText: 'Yes, Cancel',
        cancelText: 'Keep Booking'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performCancellation();
      }
    });
  }

  private performCancellation() {
    if (!this.ticket?.id) return;

    this.isCanceling = true;
    this.bookingService.cancelBooking(this.ticket.id).subscribe({
      next: (response: any) => {
        this.ticket = {
          ...this.ticket!,
          status: 'CANCELLED',
          canModify: false,
          canCancel: false,
          refundAmount: response.refundAmount || this.ticket!.totalAmount! * 0.8
        };
        this.isCanceling = false;
        this.showSuccessMessage('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
      },
      error: (err: any) => {
        this.isCanceling = false;
        this.showErrorMessage(err.message || 'Failed to cancel booking');
      }
    });
  }

  modifyBooking() {
    if (!this.ticket?.id || !this.canModify()) return;

    this.isModifying = true;
    // Navigate to modification page or open modification dialog
    this.router.navigate(['/modify-booking', this.ticket.id]).then(() => {
      this.isModifying = false;
    }).catch(() => {
      this.isModifying = false;
      this.showErrorMessage('Unable to navigate to modification page');
    });
  }

  requestRefund() {
    if (!this.ticket?.id || this.ticket.status !== 'CANCELLED') return;

    this.isRequestingRefund = true;

    // Fixed: Now returns an Observable instead of Promise
    this.simulateRefundRequest(this.ticket.id).subscribe({
      next: (response: any) => {
        this.ticket = {
          ...this.ticket!,
          refundStatus: 'REQUESTED',
          refundAmount: response.refundAmount
        };
        this.isRequestingRefund = false;
        this.showSuccessMessage('Refund request submitted successfully. You will receive an email confirmation shortly.');
      },
      error: (err: any) => {
        this.isRequestingRefund = false;
        this.showErrorMessage(err.message || 'Failed to request refund');
      }
    });
  }

  // Fixed: Now returns an Observable instead of Promise
  private simulateRefundRequest(bookingId: string): Observable<any> {
    const mockResponse = {
      refundAmount: this.ticket?.totalAmount || 0,
      refundStatus: 'REQUESTED',
      refundId: `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estimatedProcessingDays: 5
    };

    // Return an Observable that emits after a delay to simulate API call
    return of(mockResponse).pipe(delay(1000));
  }

  canModify(): boolean {
    if (!this.ticket) return false;

    const travelDate = new Date(this.ticket.date);
    const now = new Date();
    const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 3600);

    return this.ticket.status !== 'CANCELLED' &&
      this.ticket.status !== 'COMPLETED' &&
      hoursDifference > 24; // Can modify if more than 24 hours before travel
  }

  canCancel(): boolean {
    if (!this.ticket) return false;

    const travelDate = new Date(this.ticket.date);
    const now = new Date();
    const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 3600);

    return this.ticket.status !== 'CANCELLED' &&
      this.ticket.status !== 'COMPLETED' &&
      hoursDifference > 2; // Can cancel if more than 2 hours before travel
  }

  goBack() {
    this.router.navigate(['/my-bookings']);
  }

  downloadTicket() {
    if (!this.ticket) return;

    try {
      const ticketData = this.generateTicketPDF();
      const blob = new Blob([ticketData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${this.ticket.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.showSuccessMessage('Ticket downloaded successfully');
    } catch (error) {
      this.showErrorMessage('Failed to download ticket');
    }
  }

  printTicket() {
    if (!this.ticket) return;

    const printContent = this.generatePrintContent();
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      this.showSuccessMessage('Ticket sent to printer');
    } else {
      this.showErrorMessage('Unable to open print window. Please check your popup blocker.');
    }
  }

  shareTicket() {
    if (!this.ticket) return;

    const shareData = {
      title: `Bus Ticket - Booking #${this.ticket.id}`,
      text: this.generateShareText(),
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).then(() => {
        this.showSuccessMessage('Ticket shared successfully');
      }).catch(() => {
        this.fallbackShare();
      });
    } else {
      this.fallbackShare();
    }
  }

  private fallbackShare() {
    const shareText = this.generateShareText();
    navigator.clipboard.writeText(shareText).then(() => {
      this.showSuccessMessage('Ticket details copied to clipboard');
    }).catch(() => {
      this.showErrorMessage('Failed to copy ticket details');
    });
  }

  private generateShareText(): string {
    if (!this.ticket) return '';

    return `
🎫 Bus Ticket Details
━━━━━━━━━━━━━━━━━━━━
📋 Booking ID: ${this.ticket.id}
👤 Passenger: ${this.ticket.customerName}
🗺️ Route: ${this.ticket.from} → ${this.ticket.to}
📅 Date: ${new Date(this.ticket.date).toLocaleDateString()}
🕐 Time: ${this.ticket.time || this.ticket.departureTime} - ${this.ticket.arrivalTime || 'N/A'}
🚌 Bus: ${this.ticket.busName || 'N/A'} (${this.ticket.busNumber || 'N/A'})
💺 Seats: ${this.ticket.seatNumbers || this.ticket.seats}
💰 Amount: ${this.ticket.totalAmount || this.ticket.amount}
📊 Status: ${this.ticket.status}
💳 Payment: ${this.ticket.paymentStatus || 'N/A'}
━━━━━━━━━━━━━━━━━━━━
Generated from BusGo App
    `.trim();
  }

  private generatePrintContent(): string {
    if (!this.ticket) return '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket #${this.ticket.id}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3f51b5;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #3f51b5;
              margin: 0;
              font-size: 2rem;
            }
            .header h2 {
              color: #666;
              margin: 5px 0 0 0;
              font-weight: normal;
            }
            .section {
              margin-bottom: 25px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .section h3 {
              color: #3f51b5;
              margin-top: 0;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            .label {
              font-weight: bold;
              color: #333;
            }
            .value {
              color: #666;
            }
            .status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: bold;
              color: white;
              background: ${this.getStatusColor(this.ticket.status) === 'primary' ? '#4caf50' :
      this.getStatusColor(this.ticket.status) === 'warn' ? '#f44336' : '#ff9800'};
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 0.9rem;
            }
            @media print {
              body { padding: 0; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎫 Bus Ticket</h1>
            <h2>Booking #${this.ticket.id}</h2>
          </div>

          <div class="section">
            <h3>🗺️ Journey Information</h3>
            <div class="info-row">
              <span class="label">Route:</span>
              <span class="value">${this.ticket.routeName || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">From:</span>
              <span class="value">${this.ticket.from}</span>
            </div>
            <div class="info-row">
              <span class="label">To:</span>
              <span class="value">${this.ticket.to}</span>
            </div>
            ${this.ticket.distance ? `
            <div class="info-row">
              <span class="label">Distance:</span>
              <span class="value">${this.ticket.distance} km</span>
            </div>` : ''}
          </div>

          <div class="section">
            <h3>📅 Travel Details</h3>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(this.ticket.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</span>
            </div>
            <div class="info-row">
              <span class="label">Departure:</span>
              <span class="value">${this.ticket.time || this.ticket.departureTime}</span>
            </div>
            ${this.ticket.arrivalTime ? `
            <div class="info-row">
              <span class="label">Arrival:</span>
              <span class="value">${this.ticket.arrivalTime}</span>
            </div>` : ''}
            <div class="info-row">
              <span class="label">Bus:</span>
              <span class="value">${this.ticket.busName || 'N/A'}</span>
            </div>
            ${this.ticket.busNumber ? `
            <div class="info-row">
              <span class="label">Bus Number:</span>
              <span class="value">${this.ticket.busNumber}</span>
            </div>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for choosing BusGo!</p>
            <p>For support, contact us at support@busgo.com</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateTicketPDF(): string {
    // Mock PDF generation - in real app, use libraries like jsPDF or PDFKit
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Ticket #${this.ticket?.id}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;
  }

  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return 'primary';
      case 'PENDING':
      case 'PROCESSING':
        return 'accent';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'warn';
      default:
        return '';
    }
  }

  private handleError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
    this.showErrorMessage(message);
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}

// Confirmation Dialog Component
@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
