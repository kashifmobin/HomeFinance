# Home Ledger — prototype

A working prototype of the personal finance and home maintenance app from the flow diagram, built on the Minimal Light theme in `../theme`.

## Run it

From the project folder (`claudehome`), start any static server and open `http://localhost:8765/app/`:

```bash
python -m http.server 8765
```

All data is saved in the browser (localStorage key `homeledger.v1`) — this is the flow's "Local database". Use Settings → Download backup to keep a copy.

**Demo mode:** on the welcome screen, choose **Try with sample data** to load three months of realistic PKR household spending (salary, rent, groceries, utility bills, maintenance jobs), dated relative to today. It includes a bill due in two days, one category over budget and two near the limit. Settings → **Clear sample data** returns to the welcome screen.

After changing a file in `js/` or `app.css`, bump the `?v=` numbers in `index.html` so browsers load the new copy.

## What maps to the flow

| Flow step | Where |
| --- | --- |
| First launch → onboarding (currency PKR, theme, monthly budget) | Shown until finished; can also add electricity, gas, internet and rent bills |
| Bottom navigation | Home · Activity · Budget · Home care · Reports (a sidebar from 768px) |
| Dashboard: income, expenses, balance, budget bars, recent transactions | Home |
| Quick add (+) | Floating button on Home and Activity → Add expense |
| Data management: settings, backup and restore, currency and theme | Settings (top bar icon on mobile, sidebar on tablet/desktop) |
| Transactions list, filter and search, add expense, add income, edit or delete | Activity |
| Inputs valid? → inline error → retry | Every form validates and focuses the first error |
| Saved → budget status (under 80% / 80–100% / over 100%) | Message after each expense; colours on every budget bar |
| Budget planning: total and category budgets, actual vs planned, remaining | Budget |
| Home maintenance: monthly and yearly spend, add job, cost saved, optional recurring task | Home care |
| Education (added after the flow): school fees, books, tuition | Education — left menu on tablet/desktop, cap icon in the top bar on mobile; spending, budget, fee reminders, expenses |
| Recurring bills, due date, reminder, mark as paid → record expense, or stay upcoming | Bills, plus reminder banners on Home 3 days before due |
| Reports: month/quarter/year, pie and bar charts, income vs expenses, savings, CSV/PDF | Reports (PDF uses the browser's print dialog) |

## Files

- `index.html` — loads React 18, htm and the theme, then the app scripts.
- `js/store.js` — data model, local storage, budget status, bill due dates, validation.
- `js/charts.js` — donut and bar charts with hover details.
- `js/app.js` — screens and app shell.
- `app.css` — layout and screens; dark theme and chart colours.

## Prototype limits

- Reminders appear inside the app only (no phone push notifications).
- Data lives in one browser; there is no account or sync.
- Changing currency changes the symbol only; amounts are not converted.
