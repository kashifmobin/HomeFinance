# Roadmap

Time estimates assume one developer working with Claude in VS Code; adjust freely.

## Phase 0 — Foundations (2–3 weeks)
- **Repo:** monorepo layout (`mobile/`, `backend/`, `shared/openapi.yaml`), `.gitignore`, `.gitattributes`, CI per folder (see ARCHITECTURE.md).
- **Backend:** Node/Express + TypeScript skeleton, config, Postgres + migrations, local Postgres setup (Docker optional), CI, health checks (BACKEND.md). Deployment is deferred.
- **Auth:** OTP, Google sign-in, refresh-token rotation, profiles, audit log. (Apple sign-in is added with iPhone testing.)
- **Flutter:** project set up for Android and iPhone (cross-platform code), tested on Android first; flavors (dev/staging/prod), lint rules, CI.
- Drift DB mirroring the schema; `Money` class; theme (reuse "Minimal Light" tokens: colors, spacing, Inter font).
- **Localization from day one:** `app_en.arb` + `app_ur.arb`, RTL layout, Urdu font, language picker in onboarding.
- Auth screens, app lock skeleton.
**Done when:** a user can sign up and log in on Android against the local API, switch between English and Urdu (RTL), and see an empty Home offline.

## Phase 1 — Personal ledger MVP (3–4 weeks)
- Accounts with balances (ACC-01..03)
- Transactions: add/edit/delete/undo, categories, methods, notes (TXN-01..06, 09, 11)
- **Quick add + favourites + one-line entry** (FAST-01..03)
- Evening nudge (FAST-06), "same as yesterday" and reconciliation prompt (FAST-12)
- Home-screen widget, app shortcuts, Android Quick Settings tile (FAST-07)
- Dashboard + core charts (DASH-01..06)
- Budgets (BUD-01..02)
- CSV export (DASH-08 partial), local backup
**Done when:** you can use it daily for your own money, fully offline; adding a cash expense takes under 5 s.

## Phase 2 — Goals, bills, gifts (2–3 weeks)
- Personal goals + contributions (GOAL-01..03)
- Bills, reminders, mark paid (BILL-01..03, 05)
- Recurring transactions (TXN-10)
- Gifts/Eidi occasions and summaries (GIFT-01..03)
- PDF reports (DASH-08)
**Done when:** a month of real bills, a goal, and Eidi entries work end to end.

## Phase 3 — Sync and family (3–4 weeks)
- Sync endpoints on the API plus the app's outbox (push/pull by `server_seq`, soft deletes, conflict rule)
- Family creation, invites, roles (FAM-01..03, 05, 06)
- Managed child profiles and held-by-parent balances (GIFT-05)
- Upgrade a managed profile to its own login with a one-time code (FAM-04)
- Push notifications for family events (FCM / APNs)
- Family goals (GOAL-06)
- Family bills (BILL-05)
- Authorization permission-matrix tests for every role and resource
**Done when:** two phones in one family see the right shared data, and children's/private data stays hidden as designed.

## Phase 4 — Faster entry, no message reading (2 weeks)
- Paste/share a bank or wallet message to prefill an entry; parser registry for major Pakistani banks and wallets (FAST-04)
- Share-sheet target (FAST-10)
- CSV statement import with duplicate detection and balance check (FAST-05, NayaPay, ABL, UBL first)
- Voice entry (FAST-08), after testing Urdu speech recognition
**Done when:** a digital transaction can be entered with Paste/Share plus one tap, and nothing in the app reads the phone's messages.

## Phase 5 — Polish and beta (2–3 weeks)
- Kid mode (FAM-09), teen mode, onboarding polish
- Insights cards (DASH-07), goal projections and milestones (GOAL-04..05)
- Accessibility pass, Urdu proofreading by native speakers, RTL polish, security review, load test, backup restore drill, performance pass
- Closed beta with 5–10 real families for about 8 weeks; measure 7-day and 30-day logging retention and the share of entries made through fast paths; fix top friction points
- Child data safeguards review (SET-07)

## Deferred (schedule after the Android MVP is stable)
- Deployment: choose host and region, staging and production environments, backups and monitoring in place.
- iPhone: device testing, Apple sign-in, APNs push, App Store setup.

## Phase 6 — Later
PDF statement templates and screenshot scanning (FAST-05 PDF, FAST-11), forwarding email (FAST-13), Raast QR (FAST-14), open-banking partner once SBP rules are final (FAST-15), bank/wallet partnership for teen products.
Lend/borrow (LOAN-*), committee/BC, Zakat helper, allowance automation (FAM-07), approvals (FAM-08), receipt OCR, web app, SQLCipher.

---

## Reusing the existing web prototype (Home Ledger)

The prototype is plain HTML/JS/React with localStorage. It can't be wrapped directly into the production app, but it is valuable as a **spec and reference**:

| Prototype piece | Reuse in the Flutter app |
| --- | --- |
| Flow diagrams in `prototype/ideas/` | Source of screen flows; compare against UX_FLOWS.md and merge differences |
| `prototype/app/js/store.js` logic (budget status thresholds 80/100%, bill due dates, validation rules) | Port to Dart domain code with unit tests; keep the same thresholds |
| Onboarding (currency, theme, monthly budget, optional bills) | Same flow, plus accounts and categories |
| Demo mode with relative-dated sample data | Port as a "Try with sample data" seed for development and demos |
| Screens: Home, Activity, Budget, Bills, Reports, Settings | Map to Home, Activity, Budgets, Bills, Insights, Settings |
| Home care (maintenance jobs, cost saved), Education (fees) | Model as categories + bills (`for_profile_id`) and a "Home care" tag/section; revisit in Phase 5 |
| `prototype/theme/tokens.json` / Minimal Light | Convert to Flutter `ThemeData` and a tokens file |
| Hand-built donut/bar charts | Replace with `fl_chart`, keeping the same hover/tap details |
| JSON backup format | Define an import so prototype data can be migrated into the new app |

Not in the prototype and new in this plan: accounts/balances, transfers, quick entry/paste-and-share, goals (personal and family), family/roles/kids, gifts/Eidi, people ledger, real backend and sync.

## Risks and mitigations
| Risk | Mitigation |
| --- | --- |
| Users stop logging | Fast entry, favourites, one-line/voice entry, recurring entries, paste/share, evening nudge; measure time-to-add |
| Sync bugs corrupt data | Derive balances, soft deletes, integration tests, export/backup always available |
| Statement layouts change | Updatable parser templates per institution; "report a bad import" option |
| Regulation (open-banking licensing, data-protection bill) | Follow SBP's final rules; partner rather than become a licensed provider; prefer hosting in Pakistan or with an SBP-compliant cloud |
| Pasted message formats vary and change | Parser registry with tests; always show an editable prefilled form, never auto-save |
| Family privacy mistakes | Authorization enforced in the API with a permission-matrix test; clear visibility indicators in UI |
| We run the backend (security, uptime, patches) | Managed Postgres with tested backups, secrets manager, rate limiting, dependency scanning, monitoring, security review before beta; keep it one modular monolith |
| Urdu/RTL quality | Localize from day one, native-speaker review, test every screen in both directions |
| Scope creep | Hold the MVP list in FEATURES.md; everything else is Phase 6 |

## Definition of done (every feature)
Works offline · has unit/widget tests · handles empty/error states · strings in English and Urdu, RTL checked · accessible · reviewed against its acceptance criteria in FEATURES.md.
