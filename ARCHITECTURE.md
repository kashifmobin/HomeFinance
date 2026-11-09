# Architecture

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| App | **Flutter** (Dart), Android and iPhone from day one | One codebase for both phones, good offline support |
| State | **Riverpod** | Testable, scalable |
| Navigation | **go_router** | Declarative, deep links (invite links) |
| Local DB | **Drift** (SQLite) | Typed SQL, migrations, reactive streams; mirrors server schema |
| Backend | **Node.js + Express (TypeScript)** REST API, modular monolith | Full control over auth, authorization and audit for financial data; see BACKEND.md |
| Database | **PostgreSQL** (managed) | Transactions, constraints, relational integrity |
| Sync | Push/pull sync endpoints on our API, cursor by server sequence (see BACKEND.md) | Offline-first |
| Notifications | `flutter_local_notifications` (reminders, work offline); FCM (Android) and APNs via FCM (iPhone) for family push sent by the backend | Reminders never need the network |
| Charts | `fl_chart` | Donut, bar, line |
| Message text parser | Pure Dart, on-device | Parses text the user pastes or shares; no OS message access |
| Secure storage | `flutter_secure_storage`, `local_auth` | Tokens, PIN/biometric |
| Export | `pdf`, `csv`, `share_plus` | Reports |
| Crash/analytics | Sentry (+ privacy-respecting analytics) | Stability |

### Why SQL (not Mongo)
Financial data needs integrity and transactions: account balances, transfers touching two accounts, goal contributions, foreign keys, and reporting aggregates (GROUP BY). PostgreSQL gives constraints and transactions, and the API enforces family privacy on top. Mongo would push all of that into app code.

## Offline-first design

- The **local SQLite DB is the source of truth for the UI.** All reads and writes hit local DB; UI never waits for network.
- Every synced table has: `id` (UUID generated on device), `created_at`, `updated_at`, `deleted_at` (soft delete), `device_id`, `version`.
- A local **outbox** table records pending changes.
- **Push:** when online, send outbox rows in order (batched). Server upserts by `id`.
- **Pull:** ask the server for rows changed since the last cursor (`server_seq > cursor`), apply locally. Using a server-assigned sequence avoids client clock problems.
- **Conflict rule:** last-write-wins by `updated_at` per row for most tables. For balances, never sync a stored balance; **compute from transactions**, so conflicts can't corrupt totals.
- **Deletes:** soft delete (`deleted_at`) so deletions sync.
- Push notification (FCM) or short polling can trigger a pull so family changes appear quickly.

## Security & privacy

- Auth handled by our API (see BACKEND.md): phone/email OTP, Google and Apple sign-in, 15-minute access JWT, rotating refresh tokens stored in secure storage (Keychain / Keystore).
- **Server-side authorization** on every API request enforces: a user sees own rows; family members see rows where `visibility = 'family'` and they belong to that family and their role permits. Rules live in one backend policy module with a permission-matrix test, never only in the app. PostgreSQL RLS can be added later as a second layer.
- The app requests **no SMS, notification-listener, contacts or call-log permissions**. Pasted/shared message text is parsed on-device and never uploaded.
- App lock (PIN/biometric); screens hidden from app switcher option.
- Encrypted transport (TLS). Consider SQLCipher for local DB encryption (P1).
- Data export and deletion available (privacy requirement).
- Only store what is needed: no card numbers, no bank credentials, no passwords of other services. Store at most last 4 digits as a label.

## Money rules (apply everywhere)

- Amounts stored as **integer minor units** (paisa) in `BIGINT`. `Rs 1,250.50` = `125050`. Currency code (ISO 4217) stored per account.
- Never use float/double for money. Use a `Money` value class in Dart.
- Transfers are one record with `from_account` and `to_account`; they never count as income/expense.
- Balances are **derived** (opening + sum of movements). Optional cached balance for speed, rebuildable.
- All timestamps UTC in DB; display in user's timezone (Asia/Karachi default). Dates of transactions stored as `date` plus `occurred_at`.

## Repository layout (monorepo)

```
HomeFinance/
  CLAUDE.md, README.md, *.md   planning docs
  mobile/                      Flutter app
  backend/                     Node/Express + Prisma API (see BACKEND.md)
  shared/openapi.yaml          API contract
  prototype/                   old web prototype, reference only
```

### API contract
- `shared/openapi.yaml` describes every endpoint, request and response. **Change the contract first**, then the backend and the app.
- Backend: request/response zod schemas are checked against the contract in tests (or generated from it).
- App: the Dart API client in `mobile/lib/core/api/` is generated from the contract (e.g. `openapi-generator` with the `dart-dio` generator) and never edited by hand.
- CI fails if the backend's routes and the contract disagree.

### CI per folder
- Changes under `mobile/` run `flutter analyze` and `flutter test`; changes under `backend/` run lint, typecheck, tests and the Prisma migration check; changes to `shared/openapi.yaml` run both.

## Project structure (Flutter, feature-first, in `mobile/`)

```
mobile/
  pubspec.yaml
  lib/
    main.dart
    app/                 # router, theme, localization, DI
    core/
      api/               # generated client from shared/openapi.yaml (do not edit)
      money/             # Money class, formatters
      db/                # Drift database, DAOs, migrations
      sync/              # outbox, pull/push, conflict
      notifications/
      text_parser/       # parsers for pasted/shared bank & wallet messages
      import/            # CSV/PDF statement parsers (on device)
      utils/
    features/
      auth/
      accounts/
      transactions/      # list, detail, quick add, parser
      fast_entry/        # one-line parser, favourites, paste/share prefill
      dashboard/
      insights/
      budgets/
      goals/             # personal + family
      bills/
      gifts/             # occasions, Eidi
      family/            # members, roles, invites, child profiles
      people_ledger/     # lend/borrow
      settings/
    l10n/                # app_en.arb, app_ur.arb
  test/
  integration_test/
```
Each feature: `data/` (repository, DAO), `domain/` (models, use cases), `presentation/` (screens, widgets, providers).

## Pasted/shared message parser design
- Input only comes from the user: clipboard text after tapping **Paste**, text shared via the share sheet, or a statement file the user picks. No background access to messages.
- Parser registry: one parser class per sender style (HBL, Meezan, UBL, JazzCash, Easypaisa, SadaPay, NayaPay, etc.), each with regexes and tests using sample messages.
- Output: `ParsedTransaction{amount, type (debit/credit), accountHint, merchant, reference, balanceAfter?, timestamp}` used only to **prefill** the entry form.
- Dedup by `(amount, reference|timestamp window, account)`.
- Unknown format → generic amount guess, user fills the rest. Nothing is uploaded or logged.
- No special Play Store permission declarations are needed, since no sensitive permissions are used.

## Localization (English + Urdu from day one)
- `l10n/app_en.arb` and `l10n/app_ur.arb`, generated with Flutter's `gen-l10n`. A feature is not done until both files are complete.
- `Directionality` follows the locale; use start/end (not left/right) in layouts and mirror direction-implying icons.
- Urdu font bundled (Noto Nastaliq Urdu or Noto Naskh Arabic) and checked for line height and clipping.
- Dates, numbers and currency formatted with `intl` per locale; Rs grouping (1,25,000) supported.
- Server sends error and notification **codes**; the app maps them to localized text.
- Tests: golden or widget tests for key screens in both languages and both directions.

## Testing strategy
- Unit tests: Money, parser, budget status, bill due-date logic, sync conflict logic.
- DAO tests with in-memory SQLite.
- Widget tests for quick add and key screens.
- Integration tests for offline → online sync.
- Backend authorization and API integration tests (family visibility, role limits, sync conflicts) against a real Postgres.

## Environments & CI
- `dev`, `staging`, `prod` API deployments with separate databases and secrets. Flutter flavors per environment.
- GitHub Actions: analyze, test, build APK/AAB on PR.
- Migrations reviewed and applied by the backend migration tool in CI/CD.

## Performance targets
- Cold start to Home under 2 s on a mid-range Android.
- Quick add open under 300 ms.
- Lists paginated; indexes on `(owner, occurred_on)`, `(account_id)`, `(category_id)`.
