# Product Plan

## Problem

People struggle to remember what they spent, what they received and why, and how much they actually have. Existing apps are either too complex, too individual-focused, or ignore how South Asian households really handle money: cash-heavy, mobile wallets (JazzCash, Easypaisa), gifts on occasions (Eidi), lending to relatives (udhaar), and committees (BC).

## Positioning

A **family money habits** app, not just an expense tracker: parent-held child balances, Eidi by occasion, shared family goals, a teen mode that fits SBP's April 2026 teen accounts ("supervised independence"), Urdu and Roman Urdu, and **no SMS or notification reading**. See MARKET_AND_DATA_CAPTURE.md for competitors and sources.

## Vision

One simple app where every member of a household, from a school child to a parent, can see their own money clearly, and the family can see and work toward shared goals together.

## Principles

1. **Entry in seconds.** Fewer taps beats more features.
2. **Works offline.** Cash is offline; the app must be too.
3. **Private by design.** The app never reads your SMS, notifications or other apps. Entry is fast and always started by you; paste or share a bank message only if you choose.
4. **Private by default, shared by choice.** Adults control what the family sees.
5. **Age-appropriate.** Kids get a simple, encouraging view; parents get oversight; nobody sees clutter they don't need.
6. **Your numbers, always explainable.** Every balance can be traced to transactions.

## Users (personas)

| Persona | Needs |
| --- | --- |
| **Child (8–13)** | Gets Eidi/pocket money. Wants to see "my money", save for a toy/bicycle. No bank account. Simple UI, big buttons, few words. |
| **Teen / student (14–24)** | Allowance, tuition, small spending, online payments. Wants to save for a phone, track where money goes. |
| **Working adult, few responsibilities** | Salary, rent, bills, savings, charity, wallet and bank spending. Wants habits and trends. |
| **Parent / household head** | Household budget, school fees, utilities, family goals, sees family total, manages kids' profiles, lends/borrows. |

## Scope

### MVP (v1)
- Sign up/login, personal workspace
- Accounts (Cash, Bank, Wallet) with balances
- Record expense / income / transfer; cash, card, online (bank, JazzCash, Easypaisa, etc.)
- Categories, notes, tags, date, "why" (purpose/note)
- Quick-add (home screen), one-line text entry, favourites, recurring entries
- Dashboard + spending charts (by category, by method, trend, saved/spent/given split)
- Savings goals (personal)
- Bills and reminders
- Budgets (monthly, per category)
- Gifts/Eidi (occasion income)
- Family group: invite members, roles, shared goals, family dashboard, managed child profiles, optional own logins for teens and children
- Export (CSV/PDF), backup, offline-first sync with our own backend
- English and Urdu (RTL) from day one, on Android and iPhone
- Paste/share a bank or wallet message to prefill an entry (on-device, user-initiated)
- Home-screen widget, app shortcuts and Android Quick Settings tile for 2-tap entry
- CSV statement import with duplicate detection (NayaPay, ABL, UBL first)
- Reconciliation prompt ("Your cash in the app is Rs 12,400. Still right?")

### v1.1+
- Lend/borrow ledger (udhaar)
- Committee/BC tracking
- Zakat/charity helper
- Receipt photo attach and OCR
- Voice entry
- iOS Shortcuts / Siri
- Screenshot scanning of payment confirmations (English/Latin text only; Urdu OCR is not supported on-device)
- PDF statement import templates, personal forwarding email address
- Open-banking feed through a licensed partner, once SBP's rules are final (2027 or later)
- Web app
- Parent-approved child "wish list" and allowance automation

### Non-goals (for now)
- Reading SMS, notifications, contacts or any other app's data (explicitly excluded)
- Real bank/payment integration (moving real money)
- Investment tracking
- Multi-currency conversion (store currency per account; no live conversion in v1)
- Tax filing

## Success measures
- Median time to add a cash expense under 5 seconds
- Weekly active users who log 4+ days a week
- Percent of entries made through fast paths (favourites, one-line, paste/share, recurring)
- Families with 2+ active members and at least 1 shared goal
