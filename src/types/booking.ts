export type BookingStatus =
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "pending";

export type BookingPaymentStatus =
  | "paid"
  | "unpaid"
  | "deposit_paid"
  | "refund_pending"
  | "refunded"
  | "pending";
export type BookingSource = "storefront" | "staff";

export interface Booking {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  durationMinutes: number;
  staffName: string;
  startsAt: string;
  amount: number;
  amountPaid?: number;
  balanceDue?: number;
  refundableAmount?: number;
  reference?: string;
  notes?: string | null;
  paymentStatus: BookingPaymentStatus;
  status: BookingStatus;
  source: BookingSource;
  serviceId?: string;
  staffId?: string | null;
}

export interface BookingService {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  amount: number;
  staffName: string;
  isActive: boolean;
}

export interface BookingDayAvailability {
  day: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export interface BookingAvailability {
  schedule: BookingDayAvailability[];
  slotIntervalMinutes: number;
  minimumNoticeHours: number;
  maxAdvanceDays: number;
  cancellationNoticeHours: number;
  paymentOption: "full" | "deposit" | "in_person";
}

export interface BlockedTime {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  note?: string;
}

export interface CreateBookingInput {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  staffName: string;
  startsAt: string;
  amount: number;
}
