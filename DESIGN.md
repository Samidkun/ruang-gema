# DESIGN.md — Ruang Gema Studio

> Kontrak visual. Token di bawah ini **mengikat**: jangan mengarang warna, font,
> atau radius di luar daftar ini. (SOP P2 — Anti-Slop Design Contract.)

## 1. Subject / Audience / Job

- **Subject:** studio rehearsal musik sewa-per-jam, 4 ruangan, Jakarta Selatan.
- **Audience:** band/komunitas musik yang butuh slot cepat, dari HP, sering
  malam hari. Sekunder: pemilik studio (1 orang) yang mengelola jadwal harian.
- **Primary job (main screen):** melihat ruangan mana kosong **jam berapa**, lalu
  memesan slot itu sampai terbayar — tanpa telepon.

## 2. Voice

**2 kata sifat:** *presisi* dan *santai*. Presisi karena ini soal waktu & uang
(salah jam = band sia-sia datang). Santai karena audiensnya musisi, bukan korporat.
Konsekuensi: angka selalu monospace & rata, tapi kalimatnya pendek dan manusiawi
("Slot ini masih kosong", bukan "Availability status: TRUE").

## 3. Signature bet (satu pilihan sadar, spesifik produk ini)

**Kisi waktu adalah brand-nya.** Setiap jam dan harga diletakkan di **grid
monospace berbaris-baris** (seperti timecode / VU meter), dan layar utama
menampilkan **timeline ruangan × jam** — bukan kartu-kartu generik. Pilihan ini
akan terlihat salah di landing page kafe mana pun; itulah maksudnya.

Konsekuensi konkret:
- Tabel/timeline jadi komponen kelas satu, bukan tabel default.
- Angka pakai `--font-mono` dengan `font-variant-numeric: tabular-nums`.
- Slot kosong vs terisi dibedakan oleh **permukaan + label**, bukan warna saja
  (biar tetap kebaca kalau buta warna).

## 4. Token spine

```css
:root {
  /* — Warna: peran semantik, bukan dekoratif — */
  --bg:        oklch(0.19 0.012 265);  /* panggung gelap, bukan hitam pekat */
  --surface:   oklch(0.24 0.014 265);  /* panel */
  --surface-2: oklch(0.29 0.016 265);  /* panel terangkat (hover/terpilih) */
  --fg:        oklch(0.96 0.006 265);  /* teks utama */
  --muted:     oklch(0.70 0.012 265);  /* teks sekunder */
  --border:    oklch(0.34 0.014 265);
  --border-strong: oklch(0.46 0.016 265);

  --accent:    oklch(0.78 0.155 78);   /* amber "VU meter" — CTA & penanda aktif */
  --accent-fg: oklch(0.20 0.030 78);   /* teks di atas accent */
  --ok:        oklch(0.72 0.140 150);  /* slot tersedia */
  --warn:      oklch(0.80 0.140 85);   /* menunggu bayar */
  --danger:    oklch(0.66 0.190 25);   /* gagal / bentrok */

  /* — Tipografi: 3 keluarga, peran tegas — */
  --font-display: "Bricolage Grotesque", "Archivo", system-ui, sans-serif;
  --font-body:    "Public Sans", "IBM Plex Sans", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --text-xs:   0.75rem;   /* 12px — label kategori */
  --text-sm:   0.8125rem; /* 13px */
  --text-base: 0.9375rem; /* 15px */
  --text-lg:   1.125rem;
  --text-xl:   1.375rem;
  --text-2xl:  1.75rem;
  --text-3xl:  clamp(2rem, 4vw, 2.75rem);

  /* — Spasi: irama, bukan rata — */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;

  /* — Radius: BERVARIASI (slop tell #9) — */
  --r-sm: 4px;    /* input, chip kecil */
  --r-md: 8px;    /* tombol */
  --r-lg: 14px;   /* kartu, panel */
  --r-pill: 999px;/* badge */

  /* — Bayangan: elevasi dengan maksud — */
  --shadow-1: 0 1px 2px oklch(0.12 0.02 265 / 0.5);
  --shadow-2: 0 8px 24px oklch(0.12 0.02 265 / 0.45);

  /* — Motion — */
  --dur-fast: 120ms; --dur-base: 180ms; --ease: cubic-bezier(0.2, 0, 0, 1);
}
```

## 5. Aturan visual (mengikat)

1. **Aksen maksimal 2× per layar.** Amber = satu CTA primer + satu penanda aktif.
   Sisanya ghost/teks.
2. **Font display = Bricolage Grotesque.** Jangan Inter/Roboto/Arial untuk judul.
3. **Radius bervariasi** — kartu `--r-lg`, tombol `--r-md`, badge `--r-pill`.
   Jangan seragam.
4. **Satu CTA primer per viewport.**
5. **Kontras teks ≥ 4.5:1.** Hover mengubah *permukaan*, bukan meredupkan teks.
6. **Angka selalu tabular.** Harga & jam pakai `--font-mono` +
   `font-variant-numeric: tabular-nums`.
7. **Status tidak boleh warna-saja** — selalu warna + label/ikon teks.

## 6. Knobs

`DESIGN_VARIANCE: 5` (terstruktur, timeline punya aturan) ·
`VISUAL_DENSITY: 7` (dashboard admin padat, fit viewport) ·
`MOTION_INTENSITY: 2` (hover/focus saja; hormati `prefers-reduced-motion`).

## 7. Slop tells — aktif dijaga (P2 banned list)

| # | Tell | Dilarang di sini |
|---|------|------------------|
| 1 | gradient hero ungu→biru | hero pakai permukaan solid + timeline |
| 2 | Inter/Roboto refleks | Bricolage + Public Sans + JetBrains Mono |
| 3 | hero center + 1 CTA melayang | hero komposisi dari grid jadwal nyata |
| 4 | baris 3 kartu identik | timeline ruangan × jam |
| 9 | radius seragam | 4/8/14/999 |
| 11 | ALL-CAPS | sentence case (kecuali label 12px kategori) |
| 12 | emoji sebagai ikon fitur | SVG satu set (Lucide) |
| 13 | "semua dashboard" | 5 archetype berbeda |
| 15 | tanpa focal point | 1 CTA primer jelas/layar |
| 16 | lorem / "John Doe" | data nyata Indonesia |

## 8. Anti-Slop Test

> *"Kalau ada yang bilang 'ini bikin AI', percaya nggak?"*

**Jawaban: tidak** — karena (a) kisi waktu monospace adalah keputusan spesifik
produk, (b) 5 layar punya 5 archetype, (c) palet amber-VU bukan gradient default.
Lulus. Bila di Phase 2 satu layar jadi "kartu-kartu seragam", itu **defect**, bukan
selera.

## 9. Konten wajib (data nyata, bukan placeholder)

- **Nama studio:** Ruang Gema Studio · Jl. Kemang Selatan VIII No. 12, Jakarta Selatan
- **Telepon:** 021-7194-2260 · **Jam:** Setiap Hari · 09.00 – 23.00 WIB
- **4 ruangan & tarif/jam:**
  - `Studio A` — 6×5 m, full backline, AC · **Rp 150.000/jam**
  - `Studio B` — 5×4 m, drum + amp, AC · **Rp 120.000/jam**
  - `Studio C` — 4×3 m, akustik/jamming ringan · **Rp 90.000/jam**
  - `Studio D` — 7×6 m, **recording-ready**, ruang kontrol · **Rp 250.000/jam**
- **Durasi minimum:** 1 jam · **DP:** 50% saat pesan (mock gateway)

> Dilarang: lorem ipsum, "John Doe", "Company Name", harga bulat palsu.
