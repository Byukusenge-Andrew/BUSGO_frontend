
/**
 * Represents a payment in the system
 */
export interface Payment {
  paymentId: number;
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  paymentDate: Date;
  paymentDetails?: string;
}

/**
 * Possible payment methods
 */
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'MOBILE_MONEY' | 'BANK_TRANSFER';

/**
 * Possible payment statuses
 */
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

/**
 * Payment statistics for dashboard
 */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  paymentsByMethod: {
    [key in PaymentMethod]?: number;
  };
}

/**
 * Data required to create a new payment
 */
export interface CreatePaymentDto {
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDetails?: string;
}

/**
 * Data for updating an existing payment
 */
export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
  paymentDetails?: string;
}
