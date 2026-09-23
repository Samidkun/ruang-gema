# P2.6 — Diagrams as Code (Mermaid)

Generated from the source of truth (schema / contract / layer map), not hand-drawn.
Same-commit rule applies: a schema or contract change moves the matching diagram.

## 1. ERD — from the migration (source: `backend/database/migrations`)

```mermaid
erDiagram
    ROOMS ||--o{ BOOKINGS : "is booked in"
    BOOKINGS ||--o| PAYMENTS : "is paid by"

    ROOMS {
        bigint   id PK
        text     name            "Studio A..D"
        int      capacity
        text     size_label      "6x5 m"
        text     description
        int      price_idr       "per hour, integer IDR"
        jsonb    features
        timestamptz created_at
    }

    BOOKINGS {
        bigint      id PK
        text        booking_code UK "ULID, public id (R2)"
        bigint      room_id FK
        timestamptz start_at      "UTC (A4)"
        timestamptz end_at        "UTC"
        int         duration_hours
        int         total_idr     "server-derived (A3)"
        int         dp_idr        "50 percent"
        text        status        "pending|paid|cancelled"
        timestamptz hold_expires_at "R6: 15 min"
        text        customer_name
        text        customer_phone
        timestamptz cancelled_at
        timestamptz created_at
    }

    PAYMENTS {
        bigint      id PK
        bigint      booking_id FK
        text        idempotency_key UK "A2: replay-safe"
        text        status        "initiated|settled|failed"
        int         amount_idr
        text        provider_ref
        timestamptz settled_at
        timestamptz created_at
    }
```

**The constraint that carries A1** (not expressible in Mermaid, stated here):

```sql
-- prevents double-booking the same room at the same instant
CREATE UNIQUE INDEX bookings_room_start_unique
  ON bookings (room_id, start_at)
  WHERE status <> 'cancelled';
```
A partial unique index so a **cancelled** booking does not block re-booking.

## 2. User flow — from the UX floor (P2.4)

```mermaid
flowchart TD
    A[Landing /] --> B[Pilih ruangan /ruangan]
    B --> C[Jadwal + data diri /booking]
    C -->|submit| D{Slot masih kosong?}
    D -->|tidak| C2[409: slot diambil<br/>refresh grid, input tetap] --> C
    D -->|ya| E[Slot ditahan 15 menit<br/>status: pending]
    E --> F[Bayar DP 50 persen]
    F -->|gagal| F2[payment-failed<br/>retry CTA] --> F
    F -->|sukses| G[Konfirmasi + kode booking]
    G --> H[Email kode]
    G --> I[Status by kode /booking/:code]
    J[Owner /admin] --> K{Login + role}
    K -->|bukan owner| L[403]
    K -->|owner| M[Dashboard jadwal harian]
    M --> N[Batalkan booking + alasan]
```

## 3. Sequence — from the interface contract (P2.5): create booking + pay

```mermaid
sequenceDiagram
    autonumber
    participant U as User (React)
    participant API as Laravel API
    participant SVC as BookingService
    participant DB as PostgreSQL
    participant GW as Mock Gateway

    U->>API: POST /api/bookings {room_id, start_at, duration, name, phone}
    API->>API: FormRequest validation (422 on fail)
    API->>SVC: createBooking(...)
    SVC->>DB: BEGIN
    SVC->>DB: INSERT bookings (status=pending, hold_expires_at=+15m)
    alt unique index violation (A1)
        DB-->>SVC: 23505
        SVC-->>API: SLOT_TAKEN
        API-->>U: 409 {code: SLOT_TAKEN}
    else ok
        DB-->>SVC: row
        SVC->>DB: COMMIT
        API-->>U: 201 {booking_code, hold_expires_at}
    end

    U->>API: POST /api/bookings/:code/pay  (no amount — A3/A8)
    API->>SVC: initiatePayment(booking)
    SVC->>DB: INSERT payments (idempotency_key, status=initiated)
    SVC->>GW: createCharge(amount = booking.dp_idr)
    GW-->>SVC: {provider_ref, redirect_url}
    API-->>U: 200 {redirect_url}

    GW->>API: POST /api/payments/webhook {payment_id, status, amount, signature}
    API->>API: verify signature (401 on bad)
    API->>SVC: settlePayment(...)
    SVC->>DB: UPDATE payments SET settled WHERE idempotency_key (A2: no-op if settled)
    SVC->>DB: UPDATE bookings SET status=paid
    API-->>GW: 200 {ok: true}
```

## 4. Architecture / layer map — from P2.5

```mermaid
flowchart LR
    subgraph Client["frontend/ (React 19 + Vite + TS)"]
        R[react-router] --> Q[TanStack Query]
        Q --> APIc[api/ client + zod contract guard]
    end
    subgraph Server["backend/ (Laravel 11)"]
        RT[Route] --> CTRL[Controller]
        CTRL --> FR[FormRequest validation]
        CTRL --> SVC[Service: transactions + rules]
        SVC --> REPO[Repository / Eloquent]
        SVC --> JOB[Queue: hold-expiry job]
    end
    subgraph Data
        PG[(PostgreSQL 16)]
    end
    APIc -->|HTTP JSON /api| RT
    REPO --> PG
    SVC -->|signed webhook| GWm[Mock Payment Gateway]
    GWm -->|webhook| RT
```

## 5. State machine — booking

```mermaid
stateDiagram-v2
    [*] --> pending: POST /bookings
    pending --> paid: webhook settled
    pending --> cancelled: user cancel OR hold TTL expires
    paid --> cancelled: cancel (+ refund recorded)
    cancelled --> [*]
    paid --> [*]
```
