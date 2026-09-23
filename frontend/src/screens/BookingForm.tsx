import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { STUDIO } from '../data/studio';
import { api, ApiClientError } from '../api/client';
import type { ApiError } from '../types/api';

/**
 * Layar 3 — Jadwal & Data Diri (Guided Flow). Transplanted 1:1 from
 * preview/mockup/booking-form.html. CSS scoped in styles/screens/booking-form.css.
 * The mockup's three alert states (409 conflict, hold countdown, 422) are kept.
 */
export default function BookingForm() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(STUDIO.rooms[0].id);
  const [date, setDate] = useState('2026-09-23');
  const [hour, setHour] = useState(19);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [conflict, setConflict] = useState<ApiError | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const room = STUDIO.rooms.find((r) => r.id === roomId)!;
  const durationHours = 2;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConflict(null);
    setValidation(null);
    setSubmitting(true);
    try {
      // Contract: backend owns the price (AC-12) — client sends only intent.
      const startAt = `${date}T${String(hour).padStart(2, '0')}:00:00Z`;
      const { data } = await api.createBooking({
        room_id: room.id,
        start_at: startAt,
        duration_hours: durationHours,
        name,
        phone,
      });
      navigate(`/booking/${data.booking_code}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.apiError.code === 'SLOT_TAKEN') setConflict(err.apiError);
        else setValidation(err.apiError.message);
      } else {
        setValidation('Terjadi gangguan tak terduga.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen-booking-form">
      <header>
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="brand" data-od-id="nav-brand">
              <div className="brand-mark">RG</div>
              <span className="brand-title">Ruang Gema</span>
            </Link>
            <nav style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <Link to="/ruangan" className="nav-link">
                ← Kembali ke ruangan
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="flow-head">
          <div className="step-indicator">
            <span>LANGKAH 2 DARI 3</span>
            <span>·</span>
            <span>PILIH SLOT &amp; DATA PEMESAN</span>
          </div>
          <h1 className="flow-title">Tahan Slot Ruang Rehearsal</h1>
          <p className="flow-sub">
            Pilih tanggal dan jam kosong di kisi waktu. Slot akan ditahan selama 15 menit begitu
            data dikirim.
          </p>
        </div>

        {/* AC-4: inline error naming the hour + preserved input */}
        {conflict && (
          <div className="alert-box alert-conflict" data-od-id="alert-slot-taken">
            <span className="alert-icon">[ 409 BENTROK ]</span>
            <div>
              <strong>{conflict.message}</strong>
              <div style={{ color: 'var(--muted)', marginTop: 2 }}>
                Data nama dan telepon lu tetap tersimpan. Jadwal di bawah telah diperbarui otomatis
                — silakan pilih jam alternatif.
              </div>
            </div>
          </div>
        )}

        {validation && (
          <div className="alert-box alert-error" data-od-id="alert-error-422">
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--danger)' }}>
              [ VALIDASI GAGAL ]
            </span>
            <div>
              <strong>{validation}</strong>
            </div>
          </div>
        )}

        <div className="booking-layout">
          {/* LEFT: kisi waktu (AC-3) */}
          <section className="picker-panel" data-od-id="slot-picker-panel">
            <div className="panel-header-row">
              <div className="date-filter-group">
                <label htmlFor="booking-date" className="field-label" style={{ marginBottom: 0 }}>
                  Tanggal:
                </label>
                <input
                  type="date"
                  id="booking-date"
                  className="input-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-od-id="input-date"
                />
              </div>
              <div className="room-pills" data-od-id="room-selector-pills">
                {STUDIO.rooms.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    className={`room-tab-btn${r.id === roomId ? ' active' : ''}`}
                    onClick={() => setRoomId(r.id)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="slots-grid-title">
              <span>KISI JAM · {room.name.toUpperCase()} (RP {room.price_idr.toLocaleString('id-ID')}/JAM)</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>09.00 – 23.00 WIB</span>
            </div>
            <div className="slots-grid" data-od-id="slots-grid">
              {SLOT_HOURS.map((h) => (
                <button
                  type="button"
                  key={h}
                  className={`slot-cell${h === hour ? ' selected' : ''}`}
                  onClick={() => setHour(h)}
                >
                  <span className="slot-time">{String(h).padStart(2, '0')}.00</span>
                </button>
              ))}
            </div>
            <div className="slot-legend">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 'var(--r-pill)', backgroundColor: 'var(--ok)' }}></span>
                Tersedia
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 'var(--r-pill)', backgroundColor: 'var(--border)' }}></span>
                Terisi / Ditahan
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 'var(--r-pill)', backgroundColor: 'var(--accent)' }}></span>
                Pilihan Lu
              </span>
            </div>
          </section>

          {/* RIGHT: data pemesan + ringkasan DP (AC-4, AC-12) */}
          <section className="form-panel" data-od-id="customer-form-panel">
            <h2 className="panel-heading">Data Pemesan</h2>
            <p className="panel-sub">
              Konfirmasi booking dan tiket masuk akan dikirimkan ke nomor ini.
            </p>
            <form onSubmit={onSubmit}>
              <div className="field-group">
                <label htmlFor="cust-name" className="field-label">
                  Nama Pemesan / Nama Band
                </label>
                <input
                  type="text"
                  id="cust-name"
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-od-id="input-name"
                />
              </div>
              <div className="field-group">
                <label htmlFor="cust-phone" className="field-label">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  id="cust-phone"
                  className="field-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  data-od-id="input-phone"
                />
              </div>

              {/* AC-12: client never sends price — it only derives the view */}
              <div className="summary-card" data-od-id="price-summary-card">
                <div className="summary-row">
                  <span>Ruangan:</span>
                  <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{room.name}</span>
                </div>
                <div className="summary-row">
                  <span>Slot Terpilih:</span>
                  <span style={{ color: 'var(--fg)' }}>
                    {String(hour).padStart(2, '0')}.00 – {String(hour + durationHours).padStart(2, '0')}.00 WIB ({durationHours} jam)
                  </span>
                </div>
                <div className="summary-row">
                  <span>Tarif per Jam:</span>
                  <span>Rp {room.price_idr.toLocaleString('id-ID')}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Biaya Sewa:</span>
                  <span>Rp {(room.price_idr * durationHours).toLocaleString('id-ID')}</span>
                </div>
                <div className="summary-row dp">
                  <span>Uang Muka (DP 50%):</span>
                  <span>Rp {(room.price_idr * durationHours * STUDIO.dpRatio).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={submitting} data-od-id="btn-submit-hold">
                <span>{submitting ? 'Menahan slot…' : 'Tahan slot & bayar DP'}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

/** Operating hours 09.00–22.00 (last 1-hour slot starts at 22.00). */
const SLOT_HOURS = Array.from({ length: 14 }, (_, i) => 9 + i);
