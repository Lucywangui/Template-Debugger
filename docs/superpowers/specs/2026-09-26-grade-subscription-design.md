# Grade subscription and one-step M-Pesa (Payments C)

Date: 2026-09-26
Status: implemented 2026-09-26
Depends on: Payments A (M-Pesa top-up), Payments B (server coins and unlocks)

## Goal

Let a student pay KSh 100 for 30 days of every material in their grade,
and let them pay with M-Pesa in one step when their balances are short,
either to open a single material or to subscribe.

## Decisions

- One plan: all materials in the student's grade for 30 days, KSh 100.
  `SUBSCRIPTION_PRICE_KSH` and `SUBSCRIPTION_DAYS` are server settings.
- The grade is the student's registered grade (`students.grade`) when
  they pay. Browsing another grade does not change it.
- Renewing while active extends from the current end date.
- A material is covered when its ID starts with `<grade_key>-`. All
  4,590 current materials follow this, and no grade key is a prefix of
  another.
- Covered materials open without a permanent unlock, so they lock again
  when the subscription ends. Materials bought with coins stay open.
- M-Pesa cannot auto-renew over STK Push. Renewal is an in-app banner
  plus one tap. No SMS.
- "Pay per material" is a one-step STK Push for the shortfall that
  unlocks and opens the material when payment completes. There is no
  separate KSh price per material.

## Data

`subscriptions`: `student_id, soma_hub_code, grade_key, starts_at,
expires_at, ksh_paid, reference UNIQUE, created_at`.

`payment_sessions` gains `purpose` (`subscribe` or
`unlock:<material_id>`, NULL for plain top-ups) and `purpose_result`
(`done`, or `failed: <reason>`). Both are added to existing databases
by `init_database()`.

## Server

| Endpoint | Behaviour |
|---|---|
| `POST /api/subscriptions` | `{soma_hub_code, request_id}`. Debits the price from the KSh wallet and starts (or extends) the subscription. `402` with `{ksh, ksh_needed}` if short. Idempotent per `request_id`. |
| `POST /api/unlocks` | As in B, plus: an active subscription covering the material's grade returns success with `via_subscription: true`, charging nothing and recording no unlock. |
| `GET /api/account/<code>` | Adds `subscription: {grade_key, expires_at, active, price_ksh, days}` (null if the student has never subscribed). |
| `POST /api/mpesa/payment-session` | Accepts optional `purpose`. |
| `GET /api/mpesa/payment-status/<id>` | Returns `purpose` and `purpose_result`. |

After a successful M-Pesa callback credits the wallet (and after the
sandbox simulate route), the server carries out the session's purpose
in a separate transaction: unlock with `allow_ksh`, or subscribe. The
outcome is saved in `purpose_result`. If it fails, the money stays in
the wallet.

## App

- The M-Pesa steps (form, waiting, result) move into a shared
  `MpesaPayFlow` component, used by the top-up modal and the new flows.
- Unlock dialog, when coins plus KSh don't cover the price: "Pay KSh X
  with M-Pesa & open" and "Subscribe: KSh 100/month for all <grade>".
- Wallet modal: a subscription card (status, end date, Subscribe or
  Renew).
- Covered materials show OPEN without a coin price.
- Dashboard banner from 3 days before the end until 7 days after it.

## Testing

- pytest: subscribe from wallet, 402 when short, idempotent request,
  renewal extends, covered unlock is free and records nothing, other
  grade not covered, expired not covered, callback and simulate carry
  out `subscribe` and `unlock:` purposes, a purpose that fails leaves
  the money in the wallet, invalid purpose rejected, migration adds
  columns to an old table.
- vitest: account mapping with subscription, coverage rule.
- Browser run: subscribe from wallet, subscribe when short via
  simulated STK, pay and open a single material via STK, covered cards
  show OPEN, banner shows near expiry.

## Out of scope

Automatic renewal (Ratiba standing orders), SMS reminders, multiple
plans, serving locked content from the server.
