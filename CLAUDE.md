# CLAUDE.md — Home Ledger (Flutter app + Node/Express API)

Guidance for Claude when working in this repo. Read the planning docs before coding:
`PRODUCT.md`, `FEATURES.md`, `UX_FLOWS.md`, `ARCHITECTURE.md`, `BACKEND.md`, `DATA_MODEL.md`, `ROADMAP.md`. Background and sources: `MARKET_AND_DATA_CAPTURE.md`.

## What this is
A Flutter mobile app (Android and iPhone) with its own Node.js/Express (TypeScript) API for personal and family finance: fast entry of cash/card/online payments and receipts, accounts with balances, spending insights, goals (personal and family), bills, gifts (Eidi), and family roles including managed child profiles. Offline-first with sync to our own API on PostgreSQL (no Supabase). Default currency PKR; JazzCash and Easypaisa are first-class payment methods.

## Repository layout
- `mobile/` Flutter app · `backend/` Node/Express + Prisma API · `shared/openapi.yaml` API contract · `prototype/` old web prototype (reference only) · planning docs at the root.
- Run Flutter commands from `mobile/` and Node/Prisma commands from `backend/`.
- **API changes start in `shared/openapi.yaml`**, then the backend, then regenerate the Dart client in `mobile/lib/core/api/` (never edit generated code by hand).
- Never commit `.env` files, keys, build output or `node_modules`.

## Current scope
- **Deployment and iPhone testing are deferred.** Develop and test on Android with the API and a local PostgreSQL running on this machine (Docker is optional). Do not set up hosting, CI/CD deploys or App Store/APNs work unless asked.
- Keep all code cross-platform: no Android-only plugins or APIs without a documented iOS alternative, so iPhone support works later.

## How to work
1. Work on **one feature ID at a time** from FEATURES.md (e.g. "implement TXN-01"). Confirm which phase in ROADMAP.md we are in.
2. Before coding a feature: briefly state the plan (files to add/change, tables touched, tests to write). For anything touching the schema, sync, authorization or money math, stop and show the plan first.
3. Write tests with the code. Run `flutter analyze` and `flutter test` (in `mobile/`) and/or `npm test` (in `backend/`) before saying a task is done.
4. Keep changes small and reviewable. Do not refactor unrelated code.
5. If the docs conflict with the code or each other, point it out and propose which to update; do not silently diverge.
6. When a decision changes (schema, stack, scope), update the relevant `.md` file in the same change.

## Non-negotiable rules
- **Money is integer minor units (paisa) via the `Money` class.** Never `double` for amounts. Format only at the UI edge.
- **Balances are derived** from transactions; never store a mutable balance as the source of truth.
- **Transfers are not income or expense.** Goal contributions count as "save".
- **Local DB first.** UI reads/writes Drift; never block the UI on network. Network work happens in the sync layer.
- **Soft delete** (`deleted_at`) for synced tables; never hard-delete synced rows from the app.
- **UUIDs generated on device** for all primary keys.
- **Privacy and permissions are enforced in the backend API** (`backend/src/authz`), never only in the UI. Any new endpoint touching user data needs an authorization check and a test; list queries are filtered in SQL, not in JS.
- **Never read SMS, notifications, contacts or other apps' data.** Do not add `READ_SMS`, `RECEIVE_SMS`, notification-listener or similar permissions or plugins. Text is parsed only when the user pastes or shares it, on-device, and is never uploaded. Do not log amounts, account numbers or message text in analytics or crash reports.
- Never store card numbers, bank credentials or passwords. Account label may hold last 4 digits only.
- All user-facing strings go through localization with **both English (`app_en.arb`) and Urdu (`app_ur.arb`)** filled in for every new string; no hardcoded text. Layouts must work in RTL (use start/end, not left/right); check every screen in both languages.
- Statement files (CSV/PDF) and statement passwords are processed on the device only; never upload, store or log them. Only normalised transaction rows are synced.
- Do not promise or build Urdu-script OCR; on-device text recognition supports Latin text only.
- Child views: no ads, no third-party tracking SDKs.
- Quick-add speed is a product requirement: do not add required fields or extra taps to it without discussion.

## Conventions
- Dart: null-safe, `flutter_lints` + stricter analysis options; prefer immutable models (`freezed`/`json_serializable` or plain classes), `const` where possible.
- State: Riverpod (providers per feature). No business logic in widgets.
- Navigation: go_router. Deep link for family invites.
- Structure: feature-first (`mobile/lib/features/<feature>/{data,domain,presentation}`), shared code in `mobile/lib/core`.
- Naming: files `snake_case.dart`, classes `PascalCase`, providers `somethingProvider`.
- DB: tables/columns `snake_case` matching DATA_MODEL.md. Every schema change = Drift migration + backend Prisma migration + migration test.
- Commits: small, imperative, reference the feature ID (e.g. `TXN-01: add expense form`).
- Branches: `feature/<ID>-short-name`.

## Backend (Node/Express, in `backend/`)
- TypeScript strict; Express 5; zod validation on every input; Prisma for DB access; pino logging with redaction; pg-boss for jobs. See BACKEND.md.
- Layering: `routes` (HTTP only) → `service` (rules, DB transactions) → `repo` (queries). No business logic in routes.
- Amounts are integer minor units end to end; multi-row money operations run in one DB transaction.
- Money columns are `BigInt` in Prisma; convert to JSON numbers in one shared serializer, never pass a BigInt to `JSON.stringify` directly.
- All permission logic lives in `src/authz`; a test must fail if any route lacks an authorization check.
- Never log tokens, OTPs, note text, message text or amounts tied to an identity. Secrets only via environment/secrets manager.
- Migrations are Prisma migrations (custom SQL added by hand where Prisma can't express it), never edited once applied, and stay backward compatible for one release.
- Sync uses server-assigned `server_seq` cursors; client-generated UUIDs make requests idempotent.
- Keep it a modular monolith: no microservices, GraphQL, Redis or message brokers unless a documented need appears.

## Testing expectations
- Unit tests: `Money`, one-line entry parser, pasted-message parsers (with sample messages), budget status (under 80%, 80–100%, over), bill due-date rollover, sync conflict rules, derived balance queries.
- DAO tests on in-memory SQLite.
- Widget tests: quick add, transaction list, goal progress.
- Integration test: create offline → go online → verify synced.
- Backend tests (Vitest + supertest + real Postgres): permission matrix for private vs family visibility and owner/parent/adult/teen/child roles, sync conflicts, auth token rotation and reuse detection.
- Widget/golden tests for key screens in English (LTR) and Urdu (RTL).

## Design
- Visual language: "Minimal Light" (clean, Inter font, tokens in `mobile/lib/app/theme/tokens`, ported from `prototype/theme/tokens.json`), light and dark themes.
- Kid mode (under 13): big icons, simple words, piggy-bank visuals, no budgets/bills/loans.
- Min tap target 48dp, supports text scaling, screen-reader labels.

## Useful commands
```
cd mobile && flutter pub get
cd mobile && flutter analyze
cd mobile && flutter test
cd mobile && flutter run --flavor dev
cd mobile && dart run build_runner build --delete-conflicting-outputs   # drift/freezed codegen
cd backend && npx prisma migrate dev     # apply migrations to local Postgres
cd backend && npm run dev                # API with hot reload
cd backend && npm test                   # backend tests
```

## Definition of done
Matches acceptance criteria in FEATURES.md · works offline · tests pass · analyze clean · strings in English and Urdu (RTL checked) · accessible · docs updated if behaviour or schema changed.

## Prototype reference
The earlier web prototype (plain HTML/JS/React + localStorage, now in `prototype/app/`, `prototype/theme/` and `prototype/ideas/`) is a **reference only**: port logic (budget thresholds, bill due dates, validation) and sample data; do not copy its architecture. See "Reusing the existing web prototype" in ROADMAP.md.
