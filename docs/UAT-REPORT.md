# UAT Report — Ruang Gema Studio

**Tanggal:** 2026-09-23 · **Tier:** T1 · **Ceremony:** L
**Build:** branch `feat/booking-mvp` @ `6923d9c`
**Metode:** agent dry-run (eksekusi otomatis + bukti). **Keputusan akhir GO/NO-GO milik manusia.**

---

## 1. Verdict

**GO WITH CONDITIONS.**

Semua 12 acceptance criteria lolos dengan bukti otomatis. Tiga kondisi tercatat
(lihat §5) — tidak ada yang memblokir pemakaian internal, tetapi wajib diselesaikan
sebelum dipakai publik dengan uang nyata.

---

## 2. Bukti eksekusi (dijalankan pada build di atas)

| Gate | Perintah | Hasil |
|---|---|---|
| Backend test | `php artisan test` | **25 passed, 115 assertions** |
| Typecheck | `npx tsc -b --noEmit` | bersih |
| Lint | `npx oxlint` | bersih |
| Build | `npm run build` | OK (172ms) |
| E2E (browser) | `npx playwright test` | **26 passed** (13 spec × desktop + mobile), stabil 3 run berturut |
| Drift gate | trace AC → tes | AC-1..12 **tanpa orphan** |
| Mutation check | hapus fix → wajib RED | 4× terbukti RED (AC-2, AC-3, AC-4, AC-7) |

## 3. Matriks acceptance (dari requirement, bukan dari kode)

| AC | Skenario uji (binary) | Bukti | Hasil |
|----|----------------------|-------|-------|
| AC-1 | Buka landing → nama, alamat, jam, CTA terlihat tanpa scroll | `e2e/landing.spec.ts` (2 tes) | **PASS** |
| AC-2 | Buka daftar ruangan → 4 ruangan + harga format `Rp 150.000/jam` | `e2e/service-list.spec.ts` (2) | **PASS** |
| AC-3 | Slot terisi tampil disabled + `aria-disabled=true`; ganti tanggal memuat ulang | `e2e/booking-availability.spec.ts` (2) + `ContractTest::test_ac3_…` | **PASS** |
| AC-4 | Booking slot yang sudah diambil → alert 409 sebut jam WIB + input tetap | `e2e/booking-form.spec.ts` + `ContractTest::test_ac4_…` | **PASS** |
| AC-5 | Webhook duplikat → tepat 1 pembayaran settled | `ContractTest::test_ac5_…` | **PASS** |
| AC-6 | Konfirmasi tampil kode/ruangan/jam WIB/DP; kode bukan id numerik | `e2e/booking-success.spec.ts` (2) | **PASS** |
| AC-7 | `/api/admin/bookings` tanpa sesi → 401/403, tanpa data | `e2e/admin-dashboard.spec.ts` + `ContractTest::test_ac7_…` (2) | **PASS** |
| AC-8 | 20 booking bersamaan slot sama → 1×201, sisanya 409 | `ConcurrencyTest` | **PASS** |
| AC-9 | Batalkan booking lunas → cancelled + refund; batal kedua 409 | `e2e/admin-dashboard.spec.ts` + `ContractTest::test_ac9_…` | **PASS** |
| AC-10 | Hitung mundur hold mm:ss; TTL lewat → batal + slot bebas | `HoldExpiryTest` (3) | **PASS** |
| AC-11 | Daftar terpaginate, `per_page ≤ 50` | `e2e/admin-dashboard.spec.ts` + `ContractTest::test_ac11_…` | **PASS** |
| AC-12 | Client kirim harga dipalsukan → diabaikan; harga dari server | `e2e/booking-form.spec.ts` + `ContractTest::test_ac12_…` | **PASS** |

## 4. Defect yang ditemukan UAT/E2E (semua sudah diperbaiki)

| # | Severity | Deskripsi | Dampak bila lolos | Status |
|---|----------|-----------|-------------------|--------|
| D1 | **Critical** | Grid ketersediaan dibangun di UTC → slot terisi tak pernah tampil | Double-booking tampak "aman" | Fixed `999b15a` |
| D2 | **Critical** | Jam WIB dikirim sebagai UTC → semua booking bergeser 7 jam | Band datang di jam salah | Fixed `23d3bd5` |
| D3 | **High** | `error.fields: []` langgar kontrak → alert bentrok tak pernah render | User mengira pemesanan gagal | Fixed `f97eb52` |
| D4 | **High** | Admin tanpa sesi balas 500 (bukan 401) pada navigasi browser | Info bocor sebagai error 500; monitoring buta | Fixed `f97eb52` |
| D5 | Medium | Pesan bentrok sebut jam UTC ("Slot 12.00" untuk 19.00 WIB) | Pesan membingungkan | Fixed `f97eb52` |
| D6 | Medium | Kotak bayar render sebelum data → "Bayar DP Rp 0" | User menekan nominal palsu | Fixed `23d3bd5` |
| D7 | Medium | Modal batal admin tak pernah tampil (`display:none` mockup) | Owner tak bisa membatalkan | Fixed `23d3bd5` |

Semua diperbaiki **sebelum ship**, masing-masing dengan tes regresi yang dibuktikan
bisa gagal (mutation check).

## 5. Kondisi (wajib sebelum publik/uang nyata)

1. **Pembayaran masih mock gateway** (`MOCK_GATEWAY_SECRET`). Belum ada gateway nyata,
   belum ada verifikasi tanda tangan produksi. → Integrasikan gateway asli + uji webhook
   dari sumber nyata sebelum menerima uang.
2. **Belum ada deploy/produksi.** Build lokal/uji. → Jalankan E11 (build produksi,
   `APP_ENV=production`, healthcheck, E2E terhadap build ter-deploy).
3. **Review independen (E4) belum dijalankan.** E2E menemukan 7 cacat nyata, tapi E2E
   hanya menguji perilaku yang sudah ada tesnya. → Minta review adversarial pada diff
   sebelum publik.

## 6. Yang belum diuji (eksklusi eksplisit, bukan lupa)

- Rate limiting / bot defence (E11).
- Notifikasi WhatsApp nyata (UI menyebut "notifikasi dikirim" — masih simulasi).
- Aksesibilitas: keyboard pass sudah (tombol bayar diaktifkan via Enter), screen-reader
  pass manual belum.
- Load/stress di luar AC-8 (20 request paralel).

## 7. Keputusan

- **Agent dry-run:** semua gate hijau, 0 defect terbuka → **GO WITH CONDITIONS**.
- **Sign-off manusia:** ☐ GO  ☐ GO WITH CONDITIONS  ☐ NO-GO  — *belum ditandatangani*
  (proyek uji SOP, tanpa stakeholder eksternal).
