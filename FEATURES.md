# Features

Priority: **P0** = MVP must-have, **P1** = MVP nice / v1.1, **P2** = later.
Each feature has an ID for tracking and for referencing in prompts to Claude (e.g. "implement TXN-03").

## 1. Accounts & authentication
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| AUTH-01 | Sign up / login (phone or email OTP, Google, Apple on iPhone) | P0 | User can create account and log in; session persists |
| AUTH-02 | App lock (PIN / biometric) | P0 | App asks for PIN/biometric on open if enabled |
| AUTH-03 | Profile: name, avatar, currency, language, date of birth (for age mode) | P0 | Saved and used across app |
| AUTH-04 | Delete account and export data | P1 | User can export all data and delete account |

## 2. Money accounts (where money is held)
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| ACC-01 | Create accounts: Cash, Bank, Mobile wallet (JazzCash, Easypaisa, etc.), Card, Piggy bank | P0 | Each has name, type, currency, opening balance |
| ACC-02 | Live balance per account and total | P0 | Balance = opening + income − expense ± transfers, always reconciles |
| ACC-03 | Reconcile / adjust balance ("my cash is actually X") | P0 | Creates an adjustment transaction, not an edit of history |
| ACC-04 | Archive account | P1 | Hidden from pickers, history kept |

## 3. Transactions
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| TXN-01 | Add expense: amount, account, method, category, date, note | P0 | Saved offline instantly |
| TXN-02 | Add income: amount, account, source, category (salary, gift, Eidi, refund…), note | P0 | Same |
| TXN-03 | Transfer between accounts (e.g. bank → cash withdrawal) | P0 | Not counted as income or expense in reports |
| TXN-04 | Payment methods: cash, card, bank transfer, JazzCash, Easypaisa, other online | P0 | Method stored and reportable |
| TXN-05 | "Why" field: note + optional tags + optional person/place | P0 | Searchable |
| TXN-06 | Edit, delete (soft), undo | P0 | Undo snackbar after delete; balances update |
| TXN-07 | Attach receipt photo | P1 | Image stored and shown on detail |
| TXN-08 | Split transaction across categories | P1 | Amounts sum to total |
| TXN-09 | Search & filter (date, category, account, method, amount, text, tag) | P0 | Results under 300 ms for 50k rows |
| TXN-10 | Recurring transactions (salary, rent, subscriptions) | P0 | Auto-created on schedule, user can skip/edit |
| TXN-11 | Mark as saved / charity / spent (the "purpose type") | P0 | Drives the saved/given/spent breakdown |
| TXN-12 | Private vs family-visible flag | P0 | Private entries never appear to other members |

## 4. Fast entry (the key differentiator)
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| FAST-01 | Quick-add screen: amount keypad first; last-used account/method/category prefilled; save in ≤3 taps | P0 | Timed test: under 5 s |
| FAST-02 | Favourites: user's top repeat entries as one-tap buttons (e.g. "Chai 150", "Rickshaw 300") | P0 | Auto-suggested from history |
| FAST-03 | One-line entry in English and Roman Urdu: "chai 150", "grocery 4200 jazzcash", "eidi Ali 1000" | P0 | Parser fills amount/category/method; user confirms |
| FAST-04 | Paste or share a bank/wallet message into the app (you copy or share it yourself); parsed on-device into a prefilled entry | P0 | App never reads messages by itself; user taps Paste or Share → app; review and one-tap confirm |
| FAST-05 | Import a bank/wallet statement the user downloads and picks. **CSV is P0** (NayaPay, ABL, UBL first); **PDF templates are P1** (Easypaisa, SadaPay, MCB, Alfalah, Meezan, HBL, JazzCash). Password-protected PDFs: ask for the password, decrypt in memory, never store it | P0 (CSV) / P1 (PDF) | Parsed on device; review before saving; duplicates detected; running balance checked |
| FAST-06 | Evening nudge: "Any cash spending today?" (configurable time) | P0 | Local notification, opens quick-add |
| FAST-07 | Home-screen widget, app shortcuts (long-press icon: "Add cash expense", "Add Eidi"), Android Quick Settings tile | P0 | Quick-add reachable in 2 taps |
| FAST-08 | Voice entry | P1 | Speech → one-line parser. On-device Urdu speech is unverified: test before promising it; fall back to Roman Urdu text |
| FAST-09 | Smart category suggestion from note/merchant history | P1 | Learns from past choices |
| FAST-10 | Share-sheet target / Shortcuts: share text from any app to create a prefilled entry | P1 | Works only through an explicit share by the user |
| FAST-11 | Scan a payment-confirmation screenshot (JazzCash, Easypaisa, bank apps) with on-device OCR | P1 | Latin text only (ML Kit does not read Urdu script); amount, ID and date prefilled; do not advertise Urdu receipt scanning |
| FAST-12 | "Same as yesterday" repeat and reconciliation prompt per account ("Your cash in the app is Rs 12,400. Still right?") | P0 | Mismatch creates an adjustment after confirmation |
| FAST-13 | Personal forwarding email address for e-statements and card alerts | P2 | Raw emails deleted after parsing |
| FAST-14 | Scan a Raast/merchant QR to prefill merchant name, category and (dynamic QR) amount | P2 | Log only; no payment |
| FAST-15 | Open-banking feed through a licensed partner | P2 | Only after SBP's Open Banking Regulations are final (draft October 2026) |

## 5. Dashboard & insights
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| DASH-01 | Home: total balance, this month in/out, budget status, upcoming bills, goals progress | P0 | Loads from local DB instantly |
| DASH-02 | Spending by category (donut) | P0 | Tap to drill down |
| DASH-03 | Where money goes most often (top merchants/notes/categories by count and amount) | P0 | Ranked list |
| DASH-04 | Trend over time (daily/weekly/monthly) income vs expense | P0 | Bar/line |
| DASH-05 | Spent vs Saved vs Given (charity) split | P0 | Percentages per period |
| DASH-06 | By payment method (cash vs card vs online) | P0 | Chart |
| DASH-07 | Monthly summary and "habit" insights (e.g. "Food up 22% vs last month") | P1 | Plain-language cards |
| DASH-08 | Reports by month/quarter/year, export CSV/PDF | P0 | File shared via share sheet |

## 6. Budgets
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| BUD-01 | Monthly total budget and per-category budgets | P0 | Progress bar with under 80% / 80–100% / over states |
| BUD-02 | Warning after saving an expense that nears/exceeds budget | P0 | Non-blocking banner |
| BUD-03 | Rollover / carry-over option | P2 | Optional |
| BUD-04 | Family budget (sum of shared categories) | P1 | Visible to adults |

## 7. Savings goals
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| GOAL-01 | Personal goal: name, target amount, optional target date, icon/photo | P0 | Progress shown |
| GOAL-02 | Contribute to a goal (moves money from an account to the goal) | P0 | Goal balance increases; account decreases; counted as "saved" |
| GOAL-03 | Withdraw from goal | P0 | Reverses with record |
| GOAL-04 | Projection: "At this pace you reach it on …" and suggested monthly amount | P1 | Computed from history |
| GOAL-05 | Milestone celebrations (25/50/75/100%) | P1 | Kid-friendly animation |
| GOAL-06 | Family goal: shared target, each member contributes, per-member contribution shown | P0 | Everyone sees total and who gave what (adults can hide amounts from kids if desired) |
| GOAL-07 | Goal completion → mark purchased, record the expense | P1 | Links to a transaction |

## 8. Bills, utilities, fees
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| BILL-01 | Create bill: name, category (electricity, gas, water, internet, rent, school fee, tuition, insurance…), amount (fixed or variable), due day, repeat (1/3/6/12 months) | P0 | Shows in Upcoming |
| BILL-02 | Reminders N days before due (local notifications) | P0 | Configurable |
| BILL-03 | Mark paid → creates expense on chosen account and rolls next due date | P0 | One tap |
| BILL-04 | Bill history and average amount | P1 | Chart per bill |
| BILL-05 | Household vs personal bills | P0 | Family bills visible to adults |
| BILL-06 | School/education fee tracker per child | P1 | Fee schedule per child |

## 9. Gifts & occasions (Eidi etc.)
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| GIFT-01 | Occasion entries: Eid-ul-Fitr, Eid-ul-Adha, Birthday, Wedding, Graduation, Custom | P0 | Date and name |
| GIFT-02 | Record gift received: amount, from whom, occasion, account (cash/piggy bank/…) | P0 | Appears as income of type "gift" |
| GIFT-03 | Per-occasion summary ("Eid 2026: Rs 12,500 from 7 people") | P0 | Totals and list |
| GIFT-04 | Year-over-year occasion comparison | P1 | Chart |
| GIFT-05 | Parent-held balance for a child ("Held by Abu/Ammi") — kid sees it as theirs | P0 | Child ledger without a bank account |
| GIFT-06 | Gift given tracking (shagun, salami you give) | P1 | Outgoing gift category |

## 10. Family
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| FAM-01 | Create family; invite by link/phone/email | P0 | Invite accepted joins family |
| FAM-02 | Roles: Owner/Parent, Adult, Teen, Child | P0 | Permissions per role (see DATA_MODEL) |
| FAM-03 | Managed child profile (no login), managed from parent's phone | P0 | Parent can add entries on behalf of child |
| FAM-04 | Own login for a teen or child (optional); a managed profile can be upgraded to its own login without losing history | P0 | Parent generates a one-time code; role limits apply |
| FAM-05 | Family dashboard: combined income/expense, family bills, shared goals | P0 | Only family-visible data |
| FAM-06 | Per-entry visibility (private / family) with parent-controlled defaults for kids | P0 | Enforced by the backend authorization layer |
| FAM-07 | Pocket money / allowance: recurring parent → child transfer | P1 | Creates income on child, expense on parent |
| FAM-08 | Request/approve (child asks for money for a goal) | P2 | Parent sees request |
| FAM-09 | Kid mode UI: big icons, simple words, piggy bank visual, learning tips | P1 | Auto for age under 13 |

## 11. People ledger (udhaar) and committees
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| LOAN-01 | Money lent / borrowed with person, amount, date, due date, notes | P1 | Outstanding balance per person |
| LOAN-02 | Part repayments | P1 | Balance updates |
| LOAN-03 | Reminders for due loans | P1 | Local notification |
| BC-01 | Committee (BC): members, monthly amount, payout order, my turn, paid/received tracking | P2 | Schedule and status |

## 12. Settings, data & safety
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| SET-01 | Currency (PKR default), language (English and Urdu with RTL), theme (light/dark) | P0 | Language chosen at onboarding and switchable in settings; every screen works in both |
| SET-02 | Categories manager (add/rename/icon/color/archive) | P0 | Defaults for Pakistani household provided |
| SET-03 | Backup/restore (cloud sync + manual JSON/CSV) | P0 | Restore recreates all data |
| SET-04 | Notifications settings | P0 | Per type |
| SET-07 | Child data safeguards: parent-created child profiles without a child's email; no ads or third-party tracking in child views; follow Google Play Families and Apple Kids rules | P0 | Reviewed before beta |
| SET-05 | Privacy: no SMS/notification/contacts access, on-device parsing of pasted text, data export/delete | P0 | Clear copy in onboarding and settings |
| SET-06 | Zakat / charity helper | P2 | Nisab-based estimate, clearly labelled as guidance |

## 13. Localization (day one)
| ID | Feature | Pri | Acceptance |
| --- | --- | --- | --- |
| LOC-01 | English and Urdu strings for every screen, message and notification | P0 | No hardcoded text; both `.arb` files complete before a feature is done |
| LOC-02 | Full RTL layout for Urdu (mirrored navigation, icons, charts, forms) | P0 | Every screen checked in both directions |
| LOC-03 | Urdu-friendly typography (Nastaliq or Naskh font), correct line height, no clipping | P0 | Reviewed on small phones |
| LOC-04 | Number and date formatting per language (Latin or Urdu digits option, Rs 1,25,000 grouping) | P1 | Setting in preferences |
| LOC-05 | Server messages and push notifications localized by the user's language | P0 | Backend sends codes; app renders text |

## Default categories (editable)
**Expense:** Food & groceries, Eating out, Transport/fuel, Utilities (electricity, gas, water, internet, mobile), Rent, Education (fees, books, tuition), Health, Home maintenance, Clothing, Entertainment, Family & gifts, Charity/Sadaqah/Zakat, Savings (system), Debt repayment, Other.
**Income:** Salary, Business, Pocket money/allowance, Gift/Eidi, Refund, Loan received, Other.
