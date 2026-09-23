import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiClientError } from '../api/client';
import type { Booking } from '../types/api';
import { formatWIB, formatWIBDate } from '../lib/format';

type ViewState = 'unpaid' | 'paying' | 'paid' | 'payment-failed';

/**
 * Layar 4 — Konfirmasi & Bayar (Guided Flow). Transplanted 1:1 from
 * preview/mockup/booking-success.html. CSS scoped in styles/screens/booking-success.css.
 * The mockup's four payment states are preserved.
 */
export default function BookingSuccess() {
  const { code = '' } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [state, setState] = useState<ViewState>('unpaid');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .booking(code)
      .then(({ data }) => {
        setBooking(data);
        setState(data.status === 'paid' ? 'paid' : 'unpaid');
      })
      .catch((e) => setError(e instanceof ApiClientError ? e.apiError.message : 'Gagal memuat booking.'));
  }, [code]);

  async function payNow() {
    setState('paying');
    try {
      await api.pay(code);
      setState('paid');
    } catch {
      setState('payment-failed');
    }
  }

  if (error) {
    return (
      <div className="screen-booking-success">
        <main className="container flow-wrapper">
          <div className="ticket-card">
            <div className="state-title">Booking tidak ditemukan</div>
            <p className="state-desc">{error}</p>
            <Link to="/ruangan" className="btn-action-ghost">
              Pilih ruangan lain
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="screen-booking-success">
      <header>
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="brand" data-od-id="nav-brand">
              <div className="brand-mark">RG</div>
              <span className="brand-title">Ruang Gema</span>
            </Link>
            <nav style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <Link to="/booking" className="nav-link">
                ← Pilih jadwal lain
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container flow-wrapper">
        <div className="step-pill">
          <span>LANGKAH 3 DARI 3</span>
          <span>·</span>
          <span>BUKTI RESERVASI RESMI</span>
        </div>

        {/* Ticket card — AC-6: booking_code, room, WIB time, DP amount */}
        <div className="ticket-card" data-od-id="confirmation-ticket">
          <div className="ticket-status-row">
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
                {state === 'paid' ? 'Slot Latihan Terkonfirmasi' : 'Slot Latihan Ditahan'}
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 2 }}>
                {state === 'paid'
                  ? 'DP 50% telah diterima. Jadwal lu sudah terkunci di sistem studio.'
                  : 'Slot ditahan sementara. Lunasi DP 50% sebelum waktu habis.'}
              </p>
            </div>
            <div>
              <span className={`badge-status ${state === 'paid' ? 'status-paid' : state === 'payment-failed' ? 'status-failed' : 'status-unpaid'}`}>
                <span>●</span>
                <span>
                  {state === 'paid'
                    ? 'STATUS: LUNAS DP (PAID)'
                    : state === 'payment-failed'
                      ? 'STATUS: PEMBAYARAN GAGAL'
                      : 'STATUS: MENUNGGU BAYAR (UNPAID)'}
                </span>
              </span>
            </div>
          </div>

          <div className="booking-code-box" data-od-id="booking-code-card">
            <div>
              <div className="code-label">KODE BOOKING (TUNJUKKAN KE OPERATOR STUDIO)</div>
              <div className="code-val">{booking?.booking_code ?? code}</div>
            </div>
            <button
              type="button"
              className="btn-copy-code"
              onClick={() => navigator.clipboard?.writeText(booking?.booking_code ?? code)}
              data-od-id="btn-copy-code"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
              </svg>
              <span>Salin kode</span>
            </button>
          </div>

          <table className="details-table" data-od-id="booking-details-table">
            <tbody>
              <tr>
                <th>Ruangan Rehearsal</th>
                <td>{booking ? `${booking.room_name ?? 'Ruangan'} (Full Backline)` : '—'}</td>
              </tr>
              <tr>
                <th>Waktu &amp; Tanggal (WIB)</th>
                <td className="val-mono">
                  {booking
                    ? `${formatWIBDate(booking.start_at)} · ${formatWIB(booking.start_at)} – ${formatWIB(booking.end_at)} WIB (${booking.duration_hours} jam)`
                    : '—'}
                </td>
              </tr>
              <tr>
                <th>Nama Pemesan / Band</th>
                <td>{booking?.customer_name ?? '—'}</td>
              </tr>
              <tr>
                <th>Nomor WhatsApp</th>
                <td className="val-mono">{booking?.customer_phone ?? '—'}</td>
              </tr>
              <tr>
                <th>Total Biaya Sewa</th>
                <td className="val-mono">Rp {(booking?.total_idr ?? 0).toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <th>Uang Muka (DP 50%)</th>
                <td className="val-mono" style={{ color: 'var(--ok)', fontWeight: 700 }}>
                  Rp {(booking?.dp_idr ?? 0).toLocaleString('id-ID')}
                  {state === 'paid' ? ' (LUNAS via QRIS)' : ''}
                </td>
              </tr>
              <tr>
                <th>Sisa Pelunasan di Lokasi</th>
                <td className="val-mono">
                  Rp {((booking?.total_idr ?? 0) - (booking?.dp_idr ?? 0)).toLocaleString('id-ID')} (saat check-in di studio)
                </td>
              </tr>
            </tbody>
          </table>

          {state === 'unpaid' && (
            <div className="payment-action-box" data-od-id="payment-action-box">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                Selesaikan Pembayaran DP 50%
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
                Slot ditahan selama 15 menit. Klik tombol simulasi bayar di bawah (mock gateway):
              </div>
              <div className="mock-qris">
                <div style={{ fontSize: 10, marginBottom: 4 }}>QRIS RUANG GEMA</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.15, letterSpacing: 1, textAlign: 'center' }}>
                  ▛▀▀▜<br />▌▘▐<br />▙▄▟
                </div>
                <div style={{ fontSize: 9, marginTop: 6 }}>
                  NOMINAL: RP {(booking?.dp_idr ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <button type="button" className="btn-pay-now" onClick={payNow} data-od-id="btn-simulate-pay">
                Bayar DP Rp {(booking?.dp_idr ?? 0).toLocaleString('id-ID')} Sekarang
              </button>
            </div>
          )}

          {state === 'paying' && (
            <div className="payment-action-box" data-od-id="payment-processing-box">
              <div className="spinner"></div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                Menghubungi Payment Gateway...
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 'var(--sp-1)' }}>
                Memverifikasi tanda tangan webhook dan penyelesaian mutasi (AC-5 Idempotent Guard).
              </div>
            </div>
          )}

          {state === 'payment-failed' && (
            <div className="payment-action-box" style={{ borderColor: 'var(--danger)' }} data-od-id="payment-failed-box">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--danger)' }}>
                Pembayaran Tidak Berhasil
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 'var(--sp-1)', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                Gateway melaporkan sesi pembayaran kedaluwarsa atau dibatalkan. Slot lu masih dalam batas waktu penahanan — silakan coba bayar kembali.
              </div>
              <button
                type="button"
                className="btn-pay-now"
                onClick={() => setState('unpaid')}
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border-strong)' }}
              >
                Ulangi Pembayaran DP
              </button>
            </div>
          )}

          {state === 'paid' && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✓</span> Notifikasi WhatsApp dan tanda terima telah dikirim ke {booking?.customer_phone}.
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
                Harap hadir 10 menit sebelum jam latihan dimulai untuk soundcheck dan persiapan instrumen. Operator kami siap di front desk.
              </div>
              <div style={{ marginTop: 'var(--sp-2)' }}>
                <Link to="/" className="btn-action-ghost">
                  Selesai &amp; Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
