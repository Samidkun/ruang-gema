import { z } from 'zod';
import type { ApiError, Booking, Room } from '../types/api';
import { AvailabilitySchema, BookingSchema, FailureSchema, RoomSchema, SuccessSchema } from './schemas';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

/** An API error carrying the contract's error code + field messages. */
export class ApiClientError extends Error {
  readonly apiError: ApiError;
  readonly status: number;

  constructor(apiError: ApiError, status: number) {
    super(apiError.message);
    this.apiError = apiError;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<{ data: T; meta: { page: number; per_page: number; total: number } | null }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include', // Sanctum session cookie for /admin
    ...init,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const parsed = FailureSchema.safeParse(body);
    const err: ApiError = parsed.success
      ? parsed.data.error
      : { code: 'ERROR', message: 'Terjadi kesalahan. Coba lagi.' };
    throw new ApiClientError(err, res.status);
  }

  // The zod guard: a backend field rename fails HERE, loudly.
  const parsed = SuccessSchema(schema).safeParse(body);
  if (!parsed.success) {
    throw new ApiClientError(
      { code: 'CONTRACT_DRIFT', message: 'Bentuk respons API tidak sesuai kontrak.' },
      500,
    );
  }
  return { data: parsed.data.data, meta: parsed.data.meta };
}

export const api = {
  rooms: () => request('/rooms', z.array(RoomSchema)),

  availability: (roomId: number, date: string) =>
    request(`/rooms/${roomId}/availability?date=${date}`, AvailabilitySchema),

  createBooking: (input: {
    room_id: number;
    start_at: string;
    duration_hours: number;
    name: string;
    phone: string;
  }) => request('/bookings', BookingSchema, { method: 'POST', body: JSON.stringify(input) }),

  booking: (code: string) => request(`/bookings/${code}`, BookingSchema),

  cancelBooking: (code: string) =>
    request(`/bookings/${code}/cancel`, BookingSchema, { method: 'POST' }),

  pay: (code: string) =>
    request(`/bookings/${code}/pay`, z.object({ payment_id: z.number(), redirect_url: z.string() }), {
      method: 'POST',
    }),

  adminBookings: (params: { date?: string; per_page?: number } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null) as [string, string][],
    ).toString();
    return request(`/admin/bookings${qs ? `?${qs}` : ''}`, z.array(BookingSchema));
  },
};

export type { Booking, Room };
