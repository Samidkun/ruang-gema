import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STUDIO } from '../data/studio';
import {
  BOARD_BOOKINGS,
  BOARD_COLUMNS,
  BOARD_EMPTY,
  BOARD_META,
  type BoardBooking,
} from '../data/adminBoard';

/**
 * Layar 5 — Jadwal Harian Owner (Executive Dashboard). Transplanted 1:1 from
 * preview/mockup/admin-dashboard.html. CSS scoped in styles/screens/admin-dashboard.css.
 * The cancel modal preserves AC-9 (owner cancels paid booking + refund note).
 */
export default function AdminDashboard() {
  const [cancelTarget, setCancelTarget] = useState<BoardBooking | null>(null);
  const [reason, setReason] = useState('');

  function bookingAt(room: string, col: number): BoardBooking | undefined {
    return BOARD_BOOKINGS.find((b) => b.room === room && b.col === col);
  }

  return (
    <div className="screen-admin-dashboard">
      <header className="dash-header">
        <div className="dash-nav">
          <div className="brand-group">
            <div className="brand-mark">RG</div>
            <span className="brand-title">Ruang Gema</span>
            <span className="owner-tag">PANEL OWNER</span>
          </div>
          <div className="nav-actions">
            <Link to="/" className="btn-public-site">
              Lihat web publik ↗
            </Link>
          </div>
        </div>
        <h1
          className="dash-title"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginTop: 'var(--sp-4)' }}
        >
          Jadwal Harian Studio
        </h1>
      </header>

      <div className="dash-toolbar" data-od-id="admin-toolbar">
        <div className="date-control">
          <button type="button" className="date-nav-btn">
            ← Kemarin
          </button>
          <div className="current-date-badge">{BOARD_META.dateLabel}</div>
          <button type="button" className="date-nav-btn">
            Besok →
          </button>
        </div>

        <div className="metrics-strip">
          <div className="metric-item">
            <span style={{ color: 'var(--muted)' }}>Okupansi Hari Ini:</span>
            <span className="metric-val">{BOARD_META.occupancy}</span>
          </div>
          <div className="metric-item">
            <span style={{ color: 'var(--muted)' }}>Total DP Terkumpul:</span>
            <span className="metric-val income">{BOARD_META.revenue}</span>
          </div>
          <div className="metric-item">
            <span style={{ color: 'var(--muted)' }}>Menunggu Bayar:</span>
            <span className="metric-val" style={{ color: 'var(--warn)' }}>
              {BOARD_META.pending}
            </span>
          </div>
        </div>
      </div>

      <main>
        <div className="timeline-view-container" data-od-id="view-happy">
          <table className="timeline-table-board" data-od-id="schedule-matrix">
            <thead>
              <tr>
                <th className="col-room">Ruangan</th>
                {BOARD_COLUMNS.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STUDIO.rooms.map((room) => (
                <tr key={room.id}>
                  <td className="col-room room-header-cell">
                    <div className="room-cell-title">{room.name}</div>
                    <div className="room-cell-rate">
                      {room.size_label.replace(' METER', 'm')} · Rp {Math.round(room.price_idr / 1000)}k/jam
                    </div>
                  </td>
                  {[1, 2, 3, 4].map((col) => {
                    const b = bookingAt(room.name, col);
                    if (!b) {
                      return (
                        <td className="time-slot-cell" key={col}>
                          <div className="slot-empty-label">{BOARD_EMPTY[col - 1]}</div>
                        </td>
                      );
                    }
                    return (
                      <td className="time-slot-cell" key={col}>
                        <div
                          className={`booking-block${b.status === 'pending' ? ' pending' : ''}`}
                          onClick={() => {
                            setCancelTarget(b);
                            setReason('');
                          }}
                        >
                          <div className="b-customer">{b.customer}</div>
                          <div className="b-phone">
                            {b.phone} ({b.window.replace(' WIB', '')})
                          </div>
                          <div className="b-foot">
                            <span className="b-code">{b.code.slice(3)}</span>
                            <span className={b.status === 'pending' ? 'badge-pending-tiny' : 'badge-paid-tiny'}>
                              {b.status === 'pending' ? '▲ Hold' : '● DP Lunas'}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-bar">
            <span>
              Menampilkan {BOARD_META.totalToday} reservasi hari ini · Batas per halaman:{' '}
              {BOARD_META.perPage} item (AC-11)
            </span>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <button type="button" className="date-nav-btn" disabled>
                Sebelumnya
              </button>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 var(--sp-2)' }}>
                Hal 1 dari 1
              </span>
              <button type="button" className="date-nav-btn" disabled>
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel modal — AC-9: owner cancels paid booking with reason + refund */}
      {cancelTarget && (
        <div className="modal-backdrop" data-od-id="cancel-modal">
          <div className="modal-dialog">
            <h3 className="modal-title">Batalkan Reservasi Pelanggan</h3>
            <p className="modal-desc">
              Pembatalan reservasi yang sudah lunas DP akan otomatis mencatat pengembalian dana
              (refund) di sistem.
            </p>
            <div className="form-group">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                KODE BOOKING
              </label>
              <input type="text" className="modal-input" value={cancelTarget.code} readOnly />
            </div>
            <div className="form-group">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg)', fontWeight: 600 }}>
                ALASAN PEMBATALAN (WAJIB)
              </label>
              <input
                type="text"
                className="modal-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel-action" onClick={() => setCancelTarget(null)}>
                Tutup
              </button>
              <button
                type="button"
                className="btn-confirm-danger"
                disabled={reason.trim().length === 0}
                onClick={() => setCancelTarget(null)}
              >
                Batalkan &amp; Catat Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
