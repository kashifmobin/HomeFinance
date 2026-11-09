# Home Ledger — Planning Pack

A mobile app (Flutter) that helps individuals and families record every rupee in and out, see where money goes, save toward goals (personal and family), and track bills, gifts (Eidi), and money lent/borrowed. Built for all ages in a household.

This folder is the **plan**, not the code. Build from it in VS Code with the Claude extension.

## Repository layout (monorepo)

```
HomeFinance/
  README.md, CLAUDE.md, *.md   planning docs (CLAUDE.md must stay at the root)
  mobile/                      Flutter app (Android + iPhone)
  backend/                     Node.js + Express + Prisma API
  shared/
    openapi.yaml               API contract: single source of truth for app and API
  prototype/                   old web prototype (app/, theme/, ideas/), reference only
  .gitignore, .gitattributes
```

One repository keeps app and API changes in a single commit and lets Claude see both sides. Each folder has its own dependencies and commands.

## Read in this order

| File | Purpose |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Vision, users, principles, scope (MVP vs later) |
| [FEATURES.md](FEATURES.md) | Full feature list by module, with IDs, priority and acceptance criteria |
| [UX_FLOWS.md](UX_FLOWS.md) | Screens, navigation, and the fast-entry flows |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech stack, offline-first sync, security, project structure |
| [BACKEND.md](BACKEND.md) | Node/Express API design: auth, authorization, endpoints, sync, security, hosting |
| [DATA_MODEL.md](DATA_MODEL.md) | Database schema (PostgreSQL + local SQLite), rules for money |
| [MARKET_AND_DATA_CAPTURE.md](MARKET_AND_DATA_CAPTURE.md) | Market research, competitors, and every way to get transactions in without SMS, with sources |
| [ROADMAP.md](ROADMAP.md) | Phases, milestones, and how to reuse the existing web prototype |
| [CLAUDE.md](CLAUDE.md) | Instructions for Claude in VS Code (conventions, workflow). Keep this at the repo root |

## Key decisions (summary)

1. **Flutter** for Android **and** iPhone from day one (web later from the same code).
2. **SQL, not Mongo.** Money data is relational and needs transactions and integrity. PostgreSQL on the server, SQLite (Drift) on the phone.
3. **Offline-first.** The app works with no internet; changes sync when online. Cash entry must never wait for a network.
4. **Backend:** our own **Node.js + Express (TypeScript) API on PostgreSQL** from day one (see BACKEND.md). No Supabase. Authentication, authorization, audit and sync live in code we own and test.
5. **Money = integer minor units** (paisa) plus a currency code. Never floats.
6. **Fast entry is the core feature.** If entry takes more than ~5 seconds, people stop using the app. See UX_FLOWS.md.
7. **No SMS or notification reading, ever.** The app never touches the phone's messages, notifications or contacts. Speed comes from quick-add, favourites, one-line entry, recurring entries, voice, and user-initiated paste/share of a message or statement import.

8. **English and Urdu from day one**, including full right-to-left layout.
9. **Children:** both models are supported. Managed profiles under a parent are the default (especially under 13); teens and children can optionally get their own login, and a managed profile can be upgraded later without losing history.

## Decisions made

| Question | Decision |
| --- | --- |
| Children: own login or managed profile? | Both. Default is a managed profile; optional own login for teens (and children if the parent allows). |
| Platforms | Flutter, Android and iPhone from the start. |
| Languages | English and Urdu (RTL) from day one. |
| Backend | Own Node.js/Express API + PostgreSQL, not Supabase. |
| Message reading | None. No SMS or notification access. |

## Deferred for later

- **Deployment and hosting:** develop and run everything locally first (a local PostgreSQL + local API; Docker is optional). Pick a host later (see BACKEND.md, Hosting).
- **iPhone testing:** build on Android first. The code stays cross-platform so iPhone works later; Apple sign-in and device testing are scheduled after the Android MVP is stable.

## Still open

- Sign-in methods to launch with (phone OTP, Google, Apple, email). Apple sign-in is required on iOS if Google is offered.
- App name and branding.
