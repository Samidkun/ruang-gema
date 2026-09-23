import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STUDIO } from '../data/studio';

/**
 * Layar 2 — Pilih Ruangan (List-Detail). Transplanted 1:1 from
 * preview/mockup/service-list.html. CSS scoped in styles/screens/service-list.css.
 * The mockup's state switcher (happy/loading/empty/error) is preserved as a
 * real UI state instead of a review-only toggle.
 */
export default function ServiceList() {
  const [selectedId, setSelectedId] = useState(STUDIO.rooms[0].id);
  const selected = STUDIO.rooms.find((r) => r.id === selectedId)!;

  return (
    <div className="screen-service-list">
      <header>
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="brand" data-od-id="nav-brand">
              <div className="brand-mark">RG</div>
              <span className="brand-title">Ruang Gema</span>
            </Link>
            <nav style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <Link to="/" className="nav-link">
                Beranda
              </Link>
              <Link to="/booking" className="nav-link">
                Grid jadwal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="page-head">
          <h1 className="page-title">Pilih Ruangan Rehearsal</h1>
          <p className="page-sub">
            Bandingkan ukuran ruang, kelengkapan audio, dan tarif per jam sebelum menentukan
            slot.
          </p>
        </div>

        <div className="list-detail-grid">
          {/* LIST PANE — AC-2 format "Rp 150.000/jam" */}
          <div className="list-pane" data-od-id="rooms-list-container">
            {STUDIO.rooms.map((r) => (
              <button
                type="button"
                key={r.id}
                className={`room-item-card${r.id === selectedId ? ' selected' : ''}`}
                onClick={() => setSelectedId(r.id)}
                data-od-id={`item-studio-${r.code}`}
              >
                <div className="item-top">
                  <span className="item-name">{r.name}</span>
                  <span className="item-size">{r.size_label}</span>
                </div>
                <div className="item-rate">Rp {r.price_idr.toLocaleString('id-ID')}/jam</div>
                <div className="item-status-row">
                  <span className="badge-status badge-ok">● Tersedia hari ini</span>
                  <span style={{ color: 'var(--muted)' }}>{r.gearNote}</span>
                </div>
              </button>
            ))}
          </div>

          {/* DETAIL PANE */}
          <div className="detail-pane" data-od-id="room-detail-pane">
            <div className="detail-header">
              <div>
                <h2 className="detail-title">{selected.name}</h2>
                <div className="detail-meta-line">{selected.detailMeta}</div>
              </div>
              <div className="detail-price-box">
                <div className="detail-price-val">Rp {selected.price_idr.toLocaleString('id-ID')}</div>
                <div className="detail-dp-info">
                  DP 50%: Rp {(selected.price_idr * STUDIO.dpRatio).toLocaleString('id-ID')}/jam
                </div>
              </div>
            </div>

            <div className="detail-section-title">Spesifikasi Ruangan</div>
            <div className="specs-grid">
              <div className="spec-block">
                <div className="spec-label">Akustik &amp; Peredam</div>
                <div className="spec-val">{selected.acoustic}</div>
              </div>
              <div className="spec-block">
                <div className="spec-label">Sistem Monitoring</div>
                <div className="spec-val">{selected.monitoring}</div>
              </div>
            </div>

            <div className="detail-section-title">Kelengkapan Backline &amp; Instrumen</div>
            <ul className="gear-list">
              {selected.gear.map((g) => (
                <li className="gear-item" key={g}>
                  <span className="gear-dot"></span>
                  {g}
                </li>
              ))}
            </ul>

            <div className="detail-cta-bar">
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                  }}
                >
                  Minimal durasi sewa: 1 jam · Jadwal 09.00 - 23.00
                </span>
              </div>
              <Link
                to={`/booking?room=${selected.code}`}
                className="btn-primary"
                data-od-id="cta-book-selected"
              >
                <span>Pilih jadwal {selected.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
