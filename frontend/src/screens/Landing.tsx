import { Link } from 'react-router-dom';
import { STUDIO } from '../data/studio';

/**
 * Layar 1 — Landing. Transplanted 1:1 from preview/mockup/landing.html.
 * Zero redesign: same DOM order + classes; only static values became props.
 * CSS lives in src/styles/screens/landing.css, scoped under .screen-landing.
 */
export default function Landing() {
  return (
    <div className="screen-landing">
      <header data-od-id="landing-header">
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="brand" data-od-id="brand-logo">
              <div className="brand-mark">RG</div>
              <span className="brand-title">Ruang Gema</span>
            </Link>
            <nav className="nav-links" data-od-id="nav-links">
              <Link to="/ruangan" className="nav-link" data-od-id="nav-ruangan">
                Daftar ruangan
              </Link>
              <Link to="/booking" className="nav-link" data-od-id="nav-jadwal">
                Cek jadwal
              </Link>
              <Link to="/admin" className="nav-link" data-od-id="nav-admin" title="Panel Pemilik">
                Akses admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* HERO: AC-1 — nama, alamat, jam operasional, CTA dalam 390px */}
        <section className="hero" data-od-id="hero-section">
          <div className="container">
            <div className="hero-layout">
              <div className="hero-content">
                <div className="kicker" data-od-id="status-kicker">
                  <span className="kicker-dot"></span>
                  <span>4 ruangan aktif · Jadwal real-time</span>
                </div>

                <h1 className="hero-title" data-od-id="hero-heading">
                  Sewa studio rehearsal musik tanpa repot telepon.
                </h1>

                <p className="hero-desc">
                  Pilih slot ruangan kosong, tahan jadwal selama 15 menit, dan amankan latihan
                  band lu dengan DP 50%.
                </p>

                {/* AC-1 studio metadata */}
                <div className="studio-meta" data-od-id="studio-meta-card">
                  <div className="meta-item">
                    <span className="meta-label">Lokasi Studio</span>
                    <span className="meta-val">{STUDIO.address}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Jam Operasional</span>
                    <span className="meta-val-mono">{STUDIO.hours}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Kontak Studio</span>
                    <span className="meta-val-mono">{STUDIO.phone}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Sistem Booking</span>
                    <span className="meta-val">Tahan slot online + DP 50%</span>
                  </div>
                </div>

                <div className="cta-row" data-od-id="hero-cta-group">
                  <Link to="/ruangan" className="btn-primary" data-od-id="cta-primary-rooms">
                    <span>Lihat ruangan &amp; tarif</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
                  </Link>
                  <Link to="/booking" className="btn-ghost" data-od-id="cta-ghost-grid">
                    Pilih slot jam langsung
                  </Link>
                </div>
              </div>

              {/* Signature bet: kisi waktu monospace ruangan × jam */}
              <div className="preview-board" data-od-id="live-timeline-preview">
                <div className="board-header">
                  <div className="board-title">
                    <span>KISI JADWAL HARI INI</span>
                  </div>
                  <span className="board-badge">LIVE · 23 SEP</span>
                </div>

                <table className="timeline-table">
                  <thead>
                    <tr>
                      <th>Ruangan</th>
                      <th>Tarif / Jam</th>
                      <th style={{ textAlign: 'right' }}>Status Slot Sore/Malam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STUDIO.rooms.map((r) => (
                      <tr key={r.id}>
                        <td className="room-name-cell">{r.name}</td>
                        <td className="room-price-cell">
                          Rp {r.price_idr.toLocaleString('id-ID')}
                        </td>
                        <td className="status-cell">
                          <span className={`slot-pill ${r.status}`}>
                            {r.status === 'booked' ? '✕' : '●'} {r.slotNote}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="board-footer">
                  <span>Durasi minimal 1 jam</span>
                  <Link to="/booking" style={{ color: 'var(--fg)', textDecoration: 'underline' }}>
                    Buka grid lengkap
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 ruangan summary */}
        <section className="rooms-summary" data-od-id="rooms-overview">
          <div className="container">
            <div className="section-kicker">Pilihan Ruangan Rehearsal</div>
            <h2 className="section-title">Spesifikasi audio dan ukuran ruang</h2>
            <p className="section-sub">
              Semua ruangan sudah dilengkapi AC, akustik terisolasi, dan backline standar
              pertunjukan.
            </p>

            <div className="rooms-grid">
              {STUDIO.rooms.map((r) => (
                <article className="room-card" data-od-id={`card-studio-${r.code}`} key={r.id}>
                  <div className="room-card-head">
                    <div className="room-dim">{r.size_label}</div>
                    <h3 className="room-name">{r.name}</h3>
                    <p className="room-specs">{r.specs}</p>
                  </div>
                  <div className="room-card-foot">
                    <div className="rate-amount">Rp {r.price_idr.toLocaleString('id-ID')}</div>
                    <div className="rate-unit">/ jam</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ (P2.4 heuristic #10 + info AC-10) */}
        <section className="faq-section" data-od-id="faq-section">
          <div className="container">
            <div className="section-kicker">Informasi Penting</div>
            <h2 className="section-title">Pertanyaan seputar booking</h2>

            <div className="faq-grid">
              {STUDIO.faq.map((f) => (
                <div className="faq-card" key={f.q}>
                  <h3 className="faq-q">{f.q}</h3>
                  <p className="faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer data-od-id="landing-footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <strong>{STUDIO.name}</strong> — {STUDIO.address} ({STUDIO.phone})
            </div>
            <div>Buka Setiap Hari 09.00 – 23.00 WIB</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
