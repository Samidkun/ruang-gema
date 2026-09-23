import { z } from 'zod';

// Runtime mirror of src/types/api.ts. A drifted field throws here, not in prod.
export const RoomSchema = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number(),
  size_label: z.string(),
  description: z.string(),
  price_idr: z.number(),
  features: z.array(z.string()),
});

export const SlotSchema = z.object({
  start_at: z.string(),
  end_at: z.string(),
  available: z.boolean(),
  price_idr: z.number(),
});

export const BookingSchema = z.object({
  id: z.number(),
  booking_code: z.string(),
  room_id: z.number(),
  room_name: z.string().nullable(),
  start_at: z.string(),
  end_at: z.string(),
  duration_hours: z.number(),
  total_idr: z.number(),
  dp_idr: z.number(),
  status: z.enum(['pending', 'paid', 'cancelled']),
  hold_expires_at: z.string().nullable(),
  customer_name: z.string(),
  customer_phone: z.string(),
  created_at: z.string(),
});

export const AvailabilitySchema = z.object({
  date: z.string(),
  room_id: z.number(),
  slots: z.array(SlotSchema),
});

export const MetaSchema = z
  .object({ page: z.number(), per_page: z.number(), total: z.number() })
  .nullable();

export const SuccessSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ success: z.literal(true), data, meta: MetaSchema });

export const FailureSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
