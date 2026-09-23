/** Admin schedule board data (mirrors preview/mockup/admin-dashboard.html 1:1). */
export type BoardBooking = {
  code: string;
  customer: string;
  phone: string;
  room: string;
  window: string;
  amount: string;
  status: 'paid' | 'pending';
  /** grid position: column index 1..4 (Pagi/Siang/Sore/Malam) */
  col: number;
};

export type BoardRow = {
  room: string;
  rate: string;
  /** 4 columns: either a booking code ref or null (empty) */
  cells: (string | null)[];
};

export const BOARD_META = {
  dateLabel: 'RABU, 23 SEPTEMBER 2026',
  occupancy: '14 / 56 Jam (25%)',
  revenue: 'Rp 1.050.000',
  pending: '1 Slot',
  perPage: 50,
  totalToday: 5,
};

export const BOARD_BOOKINGS: BoardBooking[] = [
  { code: 'RG-20260923-01J8R4', customer: 'Sunset Jam Band', phone: '0813-1122-3344', room: 'Studio A', window: '14.00 – 16.00 WIB', amount: 'Rp 150.000', status: 'paid', col: 2 },
  { code: 'RG-20260923-01J8R9', customer: 'Bagas Prakoso (The Southern)', phone: '0812-9844-3210', room: 'Studio A', window: '19.00 – 21.00 WIB', amount: 'Rp 150.000', status: 'paid', col: 3 },
  { code: 'RG-20260923-01J8R5', customer: 'Reza Aditya (Solo Drum)', phone: '0856-7890-1234', room: 'Studio B', window: '10.00 – 12.00 WIB', amount: 'Rp 120.000', status: 'paid', col: 1 },
  { code: 'RG-20260923-01J8R6', customer: 'Noise Attack Project', phone: '0818-5544-3322', room: 'Studio B', window: '19.00 – 21.00 WIB', amount: 'Rp 120.000', status: 'pending', col: 3 },
  { code: 'RG-20260923-01J8R7', customer: 'Duo Akustik Kemang', phone: '0812-3322-1100', room: 'Studio C', window: '18.00 – 20.00 WIB', amount: 'Rp 90.000', status: 'paid', col: 3 },
  { code: 'RG-20260923-01J8R8', customer: 'Barasuara Tribute Session', phone: '0877-8899-0011', room: 'Studio D', window: '14.00 – 18.00 WIB', amount: 'Rp 500.000', status: 'paid', col: 2 },
];

/** Column headers exactly as the mockup. */
export const BOARD_COLUMNS = [
  '09.00 – 12.00 WIB (Pagi)',
  '13.00 – 17.00 WIB (Siang)',
  '18.00 – 20.00 WIB (Sore/Malam)',
  '20.00 – 23.00 WIB (Malam)',
];

export const BOARD_EMPTY = [
  '09.00 - 12.00 (Kosong)',
  '13.00 - 17.00 (Kosong)',
  '18.00 - 20.00 (Kosong)',
  '20.00 - 23.00 (Kosong)',
];
