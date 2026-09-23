import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { STUDIO } from '../data/studio';
import type { Room } from '../types/api';

/** Detail-pane extras (acoustic/monitoring/gear) are mockup static copy — the
 *  API contract (P2.5) carries only name/size/price/features. Keyed by name. */
function extras(room: Room) {
  const s = STUDIO.rooms.find((r) => r.name === room.name);
  return {
    code: s?.code ?? 'a',
    gearNote: s?.gearNote ?? room.features[0] ?? '',
    detailMeta: s?.detailMeta ?? `Kapasitas ${room.capacity} Personil · ${room.size_label}`,
    acoustic: s?.acoustic ?? room.description,
    monitoring: s?.monitoring ?? '—',
    gear: s?.gear ?? room.features,
  };
}

/**
 * Layar 2 — Pilih Ruangan (List-Detail). Transplanted 1:1 from
 * preview/mockup/service-list.html. CSS scoped in styles/screens/service-list.css.
 * The mockup's state switcher (happy/loading/empty/error) is preserved as real
 * UI state fed by the live API (AC-2).
 */
export default function ServiceList() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: rooms, isLoading, isError, refetch } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await api.rooms()).data,
  });

  const selected = rooms?.find((r) => r.id === selectedId) ?? rooms?.[0] ?? null;

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

        {/* STATE: LOADING (skeleton) */}
        {isLoading && (
          <div className="view-state active" data-od-id="view-loading">
            <div className="list-detail-grid">
              <div className="skeleton-pane">
                {[0, 1, 2].map((i) => (
                  <div className="skeleton-card" key={i}>
                    <div className="skeleton-box" style={{ width: '50%', height: 20 }} />
                    <div className="skeleton-box" style={{ width: '70%', height: 16 }} />
                    <div className="skeleton-box" style={{ width: '40%', height: 14 }} />
                  </div>
                ))}
              </div>
              <div className="detail-pane">
                <div className="skeleton-box" style={{ width: '60%', height: 32, marginBottom: 'var(--sp-4)' }} />
                <div className="skeleton-box" style={{ width: '100%', height: 80, marginBottom: 'var(--sp-4)' }} />
                <div className="skeleton-box" style={{ width: '100%', height: 120, marginBottom: 'var(--sp-4)' }} />
                <div className="skeleton-box" style={{ width: '40%', height: 48 }} />
              </div>
            </div>
          </div>
        )}

        {/* STATE: ERROR */}
        {isError && (
          <div className="view-state active" data-od-id="view-error">
            <div className="state-card-error" style={{ borderColor: 'var(--danger)' }}>
              <div className="state-icon" style={{ color: 'var(--danger)' }}>
                [ KONEKSI TERPUTUS ]
              </div>
              <h2 className="state-title">Gagal memuat daftar ruangan</h2>
              <p className="state-desc">
                Terjadi gangguan saat mengambil data tarif dan spesifikasi dari server. Silakan
                muat ulang halaman atau periksa sambungan internet lu.
              </p>
              <button type="button" className="btn-retry" onClick={() => refetch()}>
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* STATE: EMPTY */}
        {!isLoading && !isError && rooms && rooms.length === 0 && (
          <div className="view-state active" data-od-id="view-empty">
            <div className="state-card-empty">
              <div className="state-icon">[ 0 RUANGAN ]</div>
              <h2 className="state-title">Belum ada ruangan yang tersedia</h2>
              <p className="state-desc">
                Semua ruangan sedang dalam pemeliharaan berkala atau pembaruan backline. Jadwal
                ruangan akan kembali muncul di sini begitu sesi siap dipesan.
              </p>
              <button type="button" className="btn-retry" onClick={() => refetch()}>
                Periksa ulang ketersediaan
              </button>
            </div>
          </div>
        )}

        {/* STATE: HAPPY (list-detail) */}
        {!isLoading && !isError && selected && (
          <div className="view-state active" data-od-id="view-happy">
            <div className="list-detail-grid">
              {/* LIST PANE — AC-2 format "Rp 150.000/jam" */}
              <div className="list-pane" data-od-id="rooms-list-container">
                {rooms!.map((r) => {
                  const ex = extras(r);
                  return (
                    <button
                      type="button"
                      key={r.id}
                      className={`room-item-card${r.id === selected.id ? ' selected' : ''}`}
                      onClick={() => setSelectedId(r.id)}
                      data-od-id={`item-studio-${ex.code}`}
                    >
                      <div className="item-top">
                        <span className="item-name">{r.name}</span>
                        <span className="item-size">{r.size_label}</span>
                      </div>
                      <div className="item-rate">Rp {r.price_idr.toLocaleString('id-ID')}/jam</div>
                      <div className="item-status-row">
                        <span className="badge-status badge-ok">● Tersedia hari ini</span>
                        <span style={{ color: 'var(--muted)' }}>{ex.gearNote}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* DETAIL PANE */}
              <div className="detail-pane" data-od-id="room-detail-pane">
                <div className="detail-header">
                  <div>
                    <h2 className="detail-title">{selected.name}</h2>
                    <div className="detail-meta-line">{extras(selected).detailMeta}</div>
                  </div>
                  <div className="detail-price-box">
                    <div className="detail-price-val">
                      Rp {selected.price_idr.toLocaleString('id-ID')}
                    </div>
                    <div className="detail-dp-info">
                      DP 50%: Rp {(selected.price_idr * STUDIO.dpRatio).toLocaleString('id-ID')}/jam
                    </div>
                  </div>
                </div>

                <div className="detail-section-title">Spesifikasi Ruangan</div>
                <div className="specs-grid">
                  <div className="spec-block">
                    <div className="spec-label">Akustik &amp; Peredam</div>
                    <div className="spec-val">{extras(selected).acoustic}</div>
                  </div>
                  <div className="spec-block">
                    <div className="spec-label">Sistem Monitoring</div>
                    <div className="spec-val">{extras(selected).monitoring}</div>
                  </div>
                </div>

                <div className="detail-section-title">Kelengkapan Backline &amp; Instrumen</div>
                <ul className="gear-list">
                  {extras(selected).gear.map((g) => (
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
                    to={`/booking?room=${extras(selected).code}`}
                    className="btn-primary"
                    data-od-id="cta-book-selected"
                  >
                    <span>Pilih jadwal {selected.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
