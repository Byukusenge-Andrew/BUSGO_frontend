export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Company {
  companyId: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  licenseNumber: string;
}
export interface BusBooking{
  /**
   *  public BusBooking(User user, BusSchedule schedule, Date bookingDate, String status,
                     Integer numberOfSeats, Double totalFare, String seatNumbers,
                     String paymentMethod, String paymentStatus, String transactionId) {
        this.user = user;
        this.schedule = schedule;
        this.bookingDate = bookingDate;
        this.status = status;
        this.numberOfSeats = numberOfSeats;
        this.totalFare = totalFare;
        this.seatNumbers = seatNumbers;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.transactionId = transactionId;
    }
   */
  id?: string;
  userId?: string;
  busId?: string;
  bookingDate?: Date;
  status?: string; // 'active', 'completed', etc.
  scheduleId?: string; // ID of the bus schedule
  busSchedule?: string; // e.g., 'Kigali to Musanze'
  numberOfSeats?: number;
  totalFare?: number;
  seatNumbers?: string; // Comma-separated string of seat numbers
  paymentMethod?: string; // e.g., 'credit_card', 'paypal'
  paymentStatus?: string; // e.g., 'paid', 'pending'
  transactionId?: string; // Unique identifier for the transaction

}