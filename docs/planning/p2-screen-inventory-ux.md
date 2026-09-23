# P2.0 — Screen Inventory & User Flow · P2.4 UX Floor

**Tier:** T1 · **Ceremony:** L

## P2.0 §1 — User flow + information architecture

**Entry points**
- `GET /` — landing (direct / SEO / share link)
- `GET /ruangan` — deep link to the room list (shared in band group chats)
- `GET /booking/:code` — booking status by code (from the confirmation email)
- `GET /admin` — owner only, not linked from the public nav

**Primary goal:** a band books a room for a specific hour, pays the DP, and gets
a confirmed slot — without a phone call.

**Steps to the goal**
1. Visitor lands → understands *what* and *where* and *how much* (AC-1).
2. Visitor picks a room → sees that room's hourly rate (AC-2).
3. Visitor picks a date + start hour, sees which slots are free (AC-3).
4. Visitor submits name/phone + accepts the DP → slot is **held** (AC-4).
5. Visitor pays the 50% DP via the mock gateway → slot becomes **paid** (AC-5).
6. Visitor receives a booking code + sees confirmation (AC-6).
7. Owner opens `/admin` → sees today's schedule per room, can cancel (AC-7).

**Failure points (what the user sees)**
| Step | Failure | User sees |
|---|---|---|
| 3 | Slot taken between view and submit | Inline error naming the slot + a refreshed grid (AC-4) |
| 4 | Server rejects (validation / slot gone) | Inline error, **input preserved** (AC-4) |
| 5 | Payment fails / is cancelled | Booking stays `pending`, retry CTA, slot held until TTL (AC-5) |
| 5 | Webhook fires twice | No double-charge; page still shows paid (AC-5) |
| 6 | Code unknown | 404 page with a link back to the rooms list |
| 7 | Non-owner hits `/admin` | 403 page; no admin data in the response (AC-7) |

## P2.0 §2 — Screen Inventory (authoritative)

| # | Screen id | Screen | Archetype | Primary job | Entry from | States | AC |
|---|-----------|--------|-----------|-------------|------------|--------|-----|
| 1 | `landing` | Landing | Guided Flow | Convince a band to check availability | direct / SEO | — | AC-1 |
| 2 | `service-list` | Pilih ruangan | List-Detail | Compare rooms + hourly rates | `landing` | empty, loading, error | AC-2 |
| 3 | `booking-form` | Jadwal + data diri | Guided Flow | Pick a free slot and hold it | `service-list` | loading, error, slot-taken, pending | AC-3, AC-4 |
| 4 | `booking-success` | Konfirmasi & bayar | Guided Flow | Pay the DP and get the code | `booking-form` | unpaid, paying, paid, payment-failed | AC-5, AC-6 |
| 5 | `admin-dashboard` | Jadwal harian (owner) | Executive Dashboard | See + manage the day's bookings | `/admin` (direct) | empty, loading, error, cancelled | AC-7 |

**Archetype check — five different archetypes**, not "everything is a dashboard"
(slop tell #13). The admin screen is the only true dashboard; the booking path is
Guided Flow; the room list is List-Detail.

## P2.0 §3 — Screen-count sanity check

- **Every flow step covered?** Steps 1–7 map to screens 1–5. ✓
- **Every screen reachable?** All five have an entry point. ✓
- **Any screen doing two jobs?** No — `booking-success` handles pay + confirm,
  but they are one continuous job (pay → confirmed); the state machine makes it
  one screen with four states rather than two screens. Recorded as a Ruling.
- **States copied wholesale?** No — `landing` has no empty/loading state (it is
  static); `admin-dashboard` has no "slot-taken" state. Each was chosen.

**Deliberately excluded screens** (stated, not silent):
- Login/signup for customers — **excluded**: booking is guest-checkout by phone
  number + code. Only the owner logs in.
- Owner login screen — **included as a modal on `/admin`**, not a separate
  inventory row (it is a gate, not a destination). Ruling R3.
- Payment gateway hosted page — **excluded**: the mock gateway is an internal
  route, no external redirect.

## P2.4 — UX Floor

**Flow applied:** walked above; entry points and failure points match the screens.

**Nielsen's 10 — applied; the WEAK ones named honestly:**

| # | Heuristic | Verdict |
|---|-----------|---------|
| 1 | Visibility of system status | **WEAK — must be built.** The slot is *held* between step 4 and payment; the UI must show a countdown ("Slot ditahan 14:59") or the user thinks it is already booked. |
| 2 | Match to the real world | Strong — "jam 19.00", "Rp 150.000/jam", not "slot_id 42". |
| 3 | User control & freedom | **WEAK — must be built.** A held slot needs an explicit "Batalkan" so a mistyped hour does not lock the room for the TTL. |
| 4 | Consistency & standards | Strong — one button vocabulary across all screens. |
| 5 | Error prevention | Strong — hour picker only offers free slots; past dates disabled; the amount is never client-entered (A3). |
| 6 | Recognition over recall | Strong — the grid shows availability; the code is emailed and shown. |
| 7 | Flexibility & efficiency | Medium — quick "jam terdekat" shortcut on the room list. |
| 8 | Aesthetic & minimalist | Strong — one primary action per screen. |
| 9 | Error recovery | **WEAK — must be built.** "Slot baru saja diambil" must name the hour and refresh, never a bare 409. |
| 10 | Help & documentation | Medium — a short FAQ block on landing (cara bayar DP, kebijakan batal). |

**Microcopy rules (binding for Phase 2):**
- Errors say **what happened + the fix**: "Slot 19.00–20.00 baru saja diambil.
  Pilih jam lain di bawah." Never "Error 409".
- Empty state **teaches**: "Belum ada booking hari ini. Jadwal muncul di sini
  begitu ada yang memesan."
- CTAs are specific: "Tahan slot & bayar DP", "Lihat jadwal", "Batalkan slot".
  Never "Submit" / "Kirim".
- Sentence case. No ALL-CAPS shouting (except 12px category labels).

**Cognitive load:** one primary action per screen; the DP amount is shown before
the button, not after; advanced filters live behind "Filter" on the admin screen.

**UX coverage walked:**
- Onboarding / first-run — **excluded** (guest checkout, nothing to onboard).
- Settings — **excluded for customers**; owner has a minimal settings panel (Ruling R4).
- Delete / destructive — **included**: cancel booking (customer, own, unpaid/paid)
  and cancel by owner, both with a confirmation dialog.
- Invite / share — **included**: the confirmation screen offers "Salin kode booking".
- Pricing — **included**: rates are on the room list (that IS the pricing page).
- Docs / help — **included**: FAQ block on landing.
- Recovery — **included**: retry payment, re-enter code, refreshed grid on conflict.
