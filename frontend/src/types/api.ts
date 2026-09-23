// Contract types — mirror of docs/planning/p2-architecture-contracts.md §2.
// Same field names as the backend. A rename on either side must fail a test.

export type Room = {
  id: number;
  name: string;
  capacity: number;
  size_label: string;
  description: string;
  price_idr: number;
  features: string[];
};

export type Slot = {
  start_at: string;
  end_at: string;
  available: boolean;
  price_idr: number;
};

export type BookingStatus = 'pending' | 'paid' | 'cancelled';

export type Booking = {
  id: number;
  booking_code: string;
  room_id: number;
  room_name: string | null;
  start_at: string;
  end_at: string;
  duration_hours: number;
  total_idr: number;
  dp_idr: number;
  status: BookingStatus;
  hold_expires_at: string | null;
  customer_name: string;
  customer_phone: string;
  created_at: string;
};

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export type Meta = { page: number; per_page: number; total: number } | null;

export type ApiSuccess<T> = { success: true; data: T; meta: Meta };
export type ApiFailure = { success: false; error: ApiError };
