# Server-side coins and spending (Payments B)

Date: 2026-09-25
Status: implemented 2026-09-25
Depends on: Payments A (M-Pesa top-up into the server KSh wallet)

## Goal

Move SOMA Coins and material unlocks from the browser to the Flask
server, and let students spend their M-Pesa (KSh) wallet: either by
buying coins or by covering a coin shortfall when unlocking.

## Decisions

- Both balances (coins and KSh) live on the server. The app only
  displays what the server returns.
- The paywall gates the app only. Content stays bundled in the
  frontend; a technical user can still read it from the JS bundle.
  A real content paywall is a separate project.
- One price per material, in coins. `MATERIAL_PRICE_COINS = 5`,
  `KSH_PER_COIN = 1`, both overridable by environment variable.
- The server cannot verify quiz answers (they are generated and graded
  in the app), so rewards are limited instead: each attempt pays once,
  and earnings are capped at `DAILY_COIN_CAP = 200` coins per day.
- Existing students keep their local unlocks and their local coin
  balance, capped at `IMPORT_COIN_CAP = 500`. New students get the
  usual 100 starter coins.

## Data

`coin_transactions` is the coin ledger:
`student_id, soma_hub_code, amount (+/-), transaction_type, reference
UNIQUE, description, created_at`. Types: `STARTER`, `IMPORT`,
`REWARD`, `PURCHASE` (coins bought with KSh), `UNLOCK` (coins spent),
`DEV_GRANT`. The balance is the sum of `amount`.

`material_unlocks`: `student_id, soma_hub_code, material_id,
coins_spent, ksh_spent, created_at`, `UNIQUE(student_id, material_id)`.

KSh spending is recorded as `DEBIT` rows in the existing
`wallet_transactions` ledger.

## Endpoints

| Endpoint | Behaviour |
|---|---|
| `GET /api/account/<code>` | `{coins, ksh, unlocked: [...], earned_today, prices}` |
| `POST /api/account/import` | Once per student: `STARTER` 100 if no local data, else `IMPORT` min(local, 500) plus local unlocks. Later calls do nothing and return the account. |
| `POST /api/unlocks` | `{soma_hub_code, material_id, allow_ksh}`. Already unlocked → OK, nothing charged. Enough coins → spend. Otherwise, with `allow_ksh` and coins + KSh covering it → spend all coins and debit the shortfall in KSh. Otherwise `402` with `{coins, ksh, price, shortfall_coins, ksh_needed, can_pay_with_ksh}`. Runs in one `BEGIN IMMEDIATE` transaction. |
| `POST /api/coins/buy` | `{soma_hub_code, coins}` → debit `coins * KSH_PER_COIN` KSh, credit coins. `402` if KSh is short. |
| `POST /api/coins/reward` | `{soma_hub_code, attempt_id, material_id, type, percentage}`. Server computes 15 (topical) / 25 (exam), +10 at 100%, +40 when the server's own streak of reward days reaches a multiple of 7. Clipped to the daily cap. A repeated `attempt_id` pays nothing. |
| `POST /api/dev/grant-coins` | Sandbox only; replaces the local `+100 (test)` button. |

Every successful response includes the updated account so the app can
replace its copy.

## App

- New `src/lib/account.ts`: `syncAccount()` (runs the one-time import,
  then fetches the account), `unlockMaterial(id, allowKsh)`,
  `buyCoins(n)`, and `claimReward(...)`.
- Rewards go into a local outbox (`soma_reward_outbox`) and are sent in
  order; `attempt_id` makes resending safe, so offline quizzes are paid
  later. Unlocking needs a connection.
- The store's `wallet` and `purchased` become a cache of the server
  account. `addQuizResult` still computes the reward for the "+N coins"
  message, but no longer changes `wallet`; the server response does.
- Removing a material from the Library is a local hide list
  (`soma_library_hidden`). Opening it again is free.
- `openOrBuy` no longer opens materials that were not unlocked.
- Unlock prompt: "Unlock for 5 coins"; if short, "You have N coins —
  KSh X will come from your M-Pesa wallet"; if neither covers it,
  "Top up".
- Top-up modal gains a "Buy coins" section (20 / 50 / 100 coins). The
  dashboard header shows coins and KSh.
- `+100 (test)` only appears in dev builds and uses the dev endpoint.

## Testing

- pytest: ledger balance, import once and cap, all unlock paths
  (coins, KSh shortfall, insufficient, repeat), buy coins, reward rules,
  repeated attempt, daily cap, streak bonus.
- vitest: reward outbox ordering, retry and dedupe; unlock error mapping.
- Browser run: unlock with coins, unlock with KSh shortfall, buy coins,
  reward after a quiz, reload keeps balances.

## Out of scope

Direct pay-per-material and subscriptions (Payments C); serving locked
content from the server.
