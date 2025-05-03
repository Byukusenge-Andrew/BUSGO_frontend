
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

/**
 * Represents a user's saved or selectable payment method in the frontend
 */
export interface UserPaymentMethod {
  id: string; // Could be a DB ID or a temporary identifier
  type: PaymentMethod; // Link to the enum type
  name: string; // e.g., "Visa **** 4242" or "MTN MoMo"
  details: string; // e.g., last 4 digits, phone number mask
  isDefault: boolean;
}

/**
 * Represents the structure for a payment request originating from the UserPaymentComponent
 */
export interface UserPaymentRequest {
  bookingId: string;
  amount: number | undefined;
  currency: string;
  paymentMethodId: string; // ID of the selected UserPaymentMethod
  // Add other relevant details if needed by the backend, like paymentDetails specific to the method
}

/**
 * Represents the structure for a payment response expected by the UserPaymentComponent
 */
export interface UserPaymentResponse {
  id: string; // Payment record ID from backend
  status: PaymentStatus; // Use the enum type
  transactionId: string;
  timestamp: Date;
  amount: number | undefined;
  currency: string;
}
