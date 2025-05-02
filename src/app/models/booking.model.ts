export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  routeName: string;
  date: Date;
  departureTime: string;
  arrivalTime: string;
  seats: number;
  seatNumbers?: string;
  amount: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  transactionId?: string;
  companyId?: string | number;
  scheduleId?:string | number,

  // Additional properties needed for my-bookings component
  busName?: string;
  from?: string;
  to?: string;
  time?: string;
  totalAmount?: number;
}
