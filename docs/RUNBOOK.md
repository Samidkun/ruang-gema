# Developer Runbook — Ruang Gema Studio

Arsitektur, setup lokal, kontrak, dan troubleshooting. Untuk maintainer.

---

## 1. Arsitektur

Dua lapisan terpisah (P2.5):

```
frontend/  React 19 + TypeScript + Vite   (UI, 5 layar)
   │  HTTP JSON, envelope {success, data|error, meta}
   ▼
backend/   Laravel 12 API                 (domain, DB, pembayaran mock)
   │
   ▼
PostgreSQL 18  (integer IDR, UTC; render WIB)
```

- **Auth:** session cookie (Sanctum) untuk `/admin`. Panel owner wajib login.
- **Uang:** selalu integer rupiah, tidak pernah float. Harga **selalu** dihitung
  server (AC-12) — client tidak pernah mengirim nominal.
- **Waktu:** disimpan UTC, ditampilkan Asia/Jakarta.
- **Pembayaran:** mock gateway (uji alur + idempotency + webhook, tanpa uang nyata).

## 2. Prasyarat

- PHP 8.5 + Composer
- Node 20+ (tooling OpenDesign butuh Node 24; app biasa jalan di Node terpasang)
- PostgreSQL 18
- (opsional) Docker

## 3. Setup lokal

### Database

```bash
# Postgres 18 pada port 55432, user rg, db ruang_gema
export PGPASSWORD=devpass
psql -h 127.0.0.1 -p 55432 -U rg -d ruang_gema -c 'select 1'
```

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed        # RoomSeeder: 4 ruangan + owner admin
php artisan serve --port=8001     # port 8000 sering dipakai proyek lain
```

Test:

```bash
php artisan test                  # 24 passed, 109 assertions
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # :5173, proxy /api -> :8001 (lihat vite.config.ts)
```

Test:

```bash
npm run typecheck                 # tsc
npm run e2e                       # Playwright, desktop + mobile (22 passed)
npm run build                     # produksi
```

## 4. Kontrak API (ringkas)

Envelope seragam (`docs/planning/p2-architecture-contracts.md` §2):

```jsonc
// sukses
{ "success": true,  "data": <payload>, "meta": { "page": 1, "per_page": 20, "total": 42 } }
// error
{ "success": false, "error": { "code": "SLOT_TAKEN", "message": "Slot 19.00–20.00 baru saja diambil." } }
```

> `error.fields` **opsional**, bertipe `Record<string,string[]>`.
> **Jangan** kirim `"fields": []` — array kosong ≠ objek, dan client ketat (zod)
> menolaknya, sehingga alert inline tidak pernah tampil.

| Method | Path | Auth | Body / Query | Sukses | Error |
|---|---|---|---|---|---|
| GET | `/api/rooms` | publik | — | `Room[]` | — |
| GET | `/api/rooms/:id/availability` | publik | `?date=YYYY-MM-DD` | `{date, room_id, slots[]}` | 404, 422 |
| POST | `/api/bookings` | publik | `{room_id, start_at (ISO-8601), duration_hours, name, phone}` | `Booking` 201 | **409 SLOT_TAKEN**, 422 |
| GET | `/api/bookings/:code` | publik | — | `Booking` | 404 |
| POST | `/api/bookings/:code/cancel` | publik | — | `Booking` | 404, 409 |
| POST | `/api/bookings/:code/pay` | publik | `{}` | `{payment_id, redirect_url}` | 404, 409 |
| POST | `/api/payments/webhook` | signature | `{payment_id, status, amount_idr, signature}` | `{ok:true}` | 401 |
| GET | `/api/admin/bookings` | **auth** | `?date&room_id&page&per_page` | `Booking[]` | **401/403** |

Kode error (himpunan tertutup): `VALIDATION_FAILED`, `SLOT_TAKEN`,
`ILLEGAL_TRANSITION`, `NOT_FOUND`, `UNAUTHENTICATED`, `FORBIDDEN`.

## 5. Desain sistem

Token di `frontend/src/styles/tokens.css` — **sumber kebenaran `DESIGN.md`**.
Jangan mengarang warna/font/radius di luar itu. CSS tiap layar di
`frontend/src/styles/screens/*.css`, di-scope `.screen-<nama>` (hasil transplant
1:1 dari `preview/mockup/*.html`; tiap mockup di-generate terpisah sehingga
class bersama saling berbeda — scoping menjaga nilai asli tiap layar).

## 6. Troubleshooting

| Gejala | Sebab | Fix |
|---|---|---|
| `/api/*` balas **302 ke /login** | Salah port — app lain di :8000 | Pakai `--port=8001` |
| Admin tanpa login balas **500** | Route `login` tak ada & redirect guest aktif | Sudah diperbaiki: `redirectGuestsTo(fn () => null)` di `bootstrap/app.php` |
| Alert 409 tak muncul di UI | `error.fields` dikirim `[]` | Sudah diperbaiki: kosong → dihilangkan |
| Jam booking bergeser 7 jam | Kirim `start_at` pakai `Z` (UTC) | Kirim offset `+07:00` (jam WIB) |
| Modal batal tak tampil | `.modal-backdrop` default `display:none` | Set `display:flex` saat terbuka (seperti mockup) |
| Playwright: "browser not found" | Browser belum diunduh | `npx playwright install chromium` |

## 7. Deploy (belum dilakukan)

Ini build lokal/uji (T1). Belum ada target produksi. Lihat E11 di `docs/HANDOFF.md`
untuk syarat bila akan dideploy (build aset, `APP_ENV=production`, healthcheck,
E2E terhadap build ter-deploy).
