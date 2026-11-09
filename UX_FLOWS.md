# UX Flows

## Navigation (bottom bar)
1. **Home** — balance, month summary, budgets, upcoming bills, goals
2. **Activity** — transactions list with search/filter
3. **＋ (center button)** — Quick add
4. **Insights** — charts and reports
5. **Family** — shared goals, members, family dashboard (for kids: "My Piggy Bank")

Secondary (from Home/Profile): Accounts, Goals, Bills, Budgets, Gifts, People ledger, Settings.

## Flow 1 — Quick add (target: under 5 seconds)
1. Tap ＋ → numeric keypad is already open, cursor on amount.
2. Below: chips for **Account/Method** (last used preselected), **Category** (most likely preselected from time of day and history), **Date** (today).
3. Optional note field ("why") collapsed; tap to expand.
4. Tap **Save** → returns to previous screen, snackbar with **Undo**.
5. Toggle at top: Expense | Income | Transfer.

Rules: never block saving for missing optional fields; default category "Uncategorized" is allowed and can be fixed later.

## Flow 2 — One-line entry
Text bar on quick-add: type "chai 150" → parsed preview card (amount 150, category Food, method = last used) with one-tap Save. Edit any chip to correct. Learns from corrections.

## Flow 3 — Paste or share a bank message (user-initiated)
- The app never reads messages. You copy a bank/wallet message yourself, or use Share → Home Ledger.
- On quick-add, a **Paste** chip appears when text is on the clipboard (only read when you tap it).
- The text is parsed on the device: "Rs 2,500 debited from HBL ****1234 at DARAZ" fills amount, type, account hint and merchant.
- You review the prefilled form and tap **Save**. Nothing is saved without your confirmation.
- Unknown format: the form opens with the amount guessed if possible, and you fill the rest. The text is not uploaded.
- Optional: import a bank statement file you downloaded (CSV/PDF) and review matched/duplicate rows.

## Flow 4 — Evening nudge
Notification at user-set time (default 9 pm): "Any cash spending today?" → opens quick-add. Skippable; "No spending today" button logs a zero-day so streaks work.

## Flow 5 — Transfer / cash withdrawal
＋ → Transfer → From (Bank) To (Cash) amount → Save. Not counted as expense.

## Flow 6 — Receive Eidi (kid or adult)
Gifts → **Eidi** (or ＋ → Income → Gift) → pick Occasion → amount → From (person) → where kept (Piggy bank / Parent holds / Wallet) → Save. Occasion screen shows total and list. Confetti for kids.

## Flow 7 — Create goal and contribute
Goals → New → name, target, optional date, icon/photo → create. Goal card → **Add money** → choose source account and amount → progress ring updates, projection text shown.
Family goal: same, with **Shared** toggle; members see a contributions list.

## Flow 8 — Pay a bill
Home → Upcoming bills → tap bill → **Mark paid** → confirm amount (prefilled), account → Save. Next due date advances automatically.

## Flow 9 — Family setup
Family tab → Create family → Invite (link/phone) → pick role → or **Add child** (name, age, avatar) → child profile created under parent. Parent sets default visibility for the child's entries. To give a teen or child their own login later, open the profile and tap **Give own login**: a one-time code is generated, the child installs the app and enters it, and the existing history moves to their login.

## Flow 10 — Insights
Insights → period selector (week/month/quarter/year/custom) → cards:
- Spent vs Saved vs Given ring
- Category donut (tap to see transactions)
- Top places/notes by frequency and by amount
- Trend bars income vs expense
- By payment method
- Plain-language highlights

## Age-based UI modes
| Mode | Who | Differences |
| --- | --- | --- |
| Kid (under 13) | Managed or restricted login | Piggy bank visual, big buttons, few categories, goals prominent, no budgets/bills/loans |
| Teen (13–17) | Own login optional | Full entry, budgets simplified, parent visibility rules |
| Adult | Own login | Everything |
| Parent/Owner | Own login | Everything + family management and oversight |

## Empty states and onboarding
- Onboarding (≤5 screens): language (English / اردو) → currency → create accounts with opening balances (Cash, Bank, Wallet) → pick starting categories → optional: evening reminder.
- Each empty list shows one clear action.

## Accessibility and localization
- Min tap target 48 dp, scalable fonts, high contrast, screen-reader labels.
- English and Urdu from day one: language is chosen on the first onboarding screen and can be changed in settings; full RTL mirroring for Urdu; an Urdu font (Noto Nastaliq Urdu or Noto Naskh Arabic) tested for line height and clipping; direction-implying icons are mirrored; charts and keypads checked in RTL.
- Numbers formatted per locale (e.g. Rs 1,25,000 option).
