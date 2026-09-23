/** Formatting helpers. Money is integer IDR; time renders Asia/Jakarta. */

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function formatRate(amount: number): string {
  return `${formatRupiah(amount)}/jam`;
}

/** Store is UTC; render in Asia/Jakarta (Constitution §1.4). */
export function formatWIB(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function formatWIBDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/** mm:ss for the hold countdown (AC-10). */
export function countdown(expiresAt: string, now = Date.now()): string {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}
