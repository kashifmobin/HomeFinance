/* Home Ledger — data model, local database (localStorage) and pure helpers. */
(function () {
  var KEY = 'homeledger.v1';

  var CATEGORIES = ['Groceries', 'Food & dining', 'Utilities', 'Rent', 'Transport', 'Maintenance', 'Health', 'Education', 'Other'];
  var METHODS = ['Cash', 'Debit card', 'Credit card', 'Bank transfer', 'JazzCash', 'Easypaisa'];
  var CURRENCIES = [['PKR', 'Pakistani rupee'], ['USD', 'US dollar'], ['EUR', 'Euro'], ['GBP', 'British pound'], ['AED', 'UAE dirham'], ['SAR', 'Saudi riyal'], ['INR', 'Indian rupee']];
  var EVERY = [[1, 'Every month'], [3, 'Every 3 months'], [6, 'Every 6 months'], [12, 'Every year']];
  var BILL_PRESETS = [
    { name: 'Electricity', category: 'Utilities' },
    { name: 'Gas', category: 'Utilities' },
    { name: 'Internet', category: 'Utilities' },
    { name: 'Rent', category: 'Rent' }
  ];

  function empty() {
    return {
      version: 1,
      settings: { onboarded: false, currency: 'PKR', theme: 'light' },
      budgets: { total: 0, categories: {} },
      transactions: [],
      jobs: [],
      recurring: []
    };
  }

  function normalize(raw) {
    var base = empty();
    var d = Object.assign(base, raw || {});
    d.settings = Object.assign(empty().settings, d.settings);
    d.budgets = Object.assign(empty().budgets, d.budgets);
    d.budgets.categories = d.budgets.categories || {};
    ['transactions', 'jobs', 'recurring'].forEach(function (k) { if (!Array.isArray(d[k])) d[k] = []; });
    return d;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* private mode or corrupt data: start fresh */ }
    return empty();
  }

  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }

  function isBackup(obj) {
    return obj && typeof obj === 'object' && obj.settings && Array.isArray(obj.transactions);
  }

  // ---- ids, dates and months ------------------------------------------------

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDate(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2] || 1); }
  function monthKey(dateStr) { return dateStr.slice(0, 7); }
  function addMonths(key, n) {
    var p = key.split('-').map(Number);
    var d = new Date(p[0], p[1] - 1 + n, 1);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }
  function monthDiff(a, b) {
    var pa = a.split('-').map(Number), pb = b.split('-').map(Number);
    return (pb[0] - pa[0]) * 12 + (pb[1] - pa[1]);
  }
  function daysInMonth(key) { var p = key.split('-').map(Number); return new Date(p[0], p[1], 0).getDate(); }
  function daysBetween(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }

  function monthLabel(key, short) {
    return new Intl.DateTimeFormat('en', short ? { month: 'short' } : { month: 'long', year: 'numeric' }).format(parseDate(key));
  }
  function dateLabel(dateStr) {
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(parseDate(dateStr));
  }

  // ---- money ----------------------------------------------------------------

  var fmtCache = {};
  function money(amount, currency) {
    var f = fmtCache[currency] || (fmtCache[currency] = new Intl.NumberFormat('en-PK', { style: 'currency', currency: currency, maximumFractionDigits: 0 }));
    return f.format(Math.round(amount || 0));
  }
  var compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  function compact(n) { return compactFmt.format(n); }

  // ---- totals and budgets ---------------------------------------------------

  function txMonth(t) { return t.type === 'income' ? t.month : monthKey(t.date); }

  function inMonths(db, months) {
    var set = {};
    months.forEach(function (m) { set[m] = true; });
    return db.transactions.filter(function (t) { return set[txMonth(t)]; });
  }

  function totals(db, months) {
    var income = 0, expense = 0;
    inMonths(db, months).forEach(function (t) { if (t.type === 'income') income += t.amount; else expense += t.amount; });
    return { income: income, expense: expense, savings: income - expense };
  }

  function spentByCategory(db, months) {
    var out = {};
    inMonths(db, months).forEach(function (t) {
      if (t.type === 'expense') out[t.category] = (out[t.category] || 0) + t.amount;
    });
    return out;
  }

  // ok below 80%, near from 80% to 100%, over above 100%.
  function budgetStatus(spent, planned) {
    if (!planned || planned <= 0) return null;
    var pct = spent / planned;
    return { pct: pct, level: pct > 1 ? 'over' : pct >= 0.8 ? 'near' : 'ok' };
  }

  // Checks the category and the monthly total after an expense is saved; reports the worse one.
  function budgetMessage(db, month, category, currency) {
    var spent = spentByCategory(db, [month]);
    var checks = [];
    var cat = budgetStatus(spent[category] || 0, db.budgets.categories[category]);
    if (cat) checks.push({ s: cat, name: category, planned: db.budgets.categories[category], spent: spent[category] || 0 });
    var total = totals(db, [month]).expense;
    var tot = budgetStatus(total, db.budgets.total);
    if (tot) checks.push({ s: tot, name: 'This month’s spending', planned: db.budgets.total, spent: total });
    var rank = { ok: 0, near: 1, over: 2 };
    checks.sort(function (a, b) { return rank[b.s.level] - rank[a.s.level] || b.s.pct - a.s.pct; });
    var c = checks[0];
    if (!c || c.s.level === 'ok') return null;
    var pct = Math.round(c.s.pct * 100);
    if (c.s.level === 'over') return { tone: 'danger', text: c.name + ' is over budget by ' + money(c.spent - c.planned, currency) + ' (' + pct + '%).' };
    return { tone: 'warning', text: c.name + ' is at ' + pct + '% of its budget.' };
  }

  // ---- recurring bills and reminders ----------------------------------------

  // Unpaid occurrences for last month, this month, and the next two weeks.
  function occurrences(db, todayStr) {
    var cur = monthKey(todayStr);
    var out = [];
    db.recurring.forEach(function (r) {
      [addMonths(cur, -1), cur, addMonths(cur, 1)].forEach(function (mk) {
        var diff = monthDiff(r.startMonth, mk);
        if (diff < 0 || diff % r.every !== 0) return;
        if (r.paid.indexOf(mk) !== -1) return;
        var due = mk + '-' + pad(Math.min(r.dueDay, daysInMonth(mk)));
        var daysLeft = daysBetween(todayStr, due);
        if (daysLeft > 14) return;
        out.push({ item: r, month: mk, due: due, daysLeft: daysLeft, status: daysLeft < 0 ? 'overdue' : daysLeft <= 3 ? 'soon' : 'upcoming' });
      });
    });
    return out.sort(function (a, b) { return a.due < b.due ? -1 : 1; });
  }

  function nextDue(r, todayStr) {
    var cur = monthKey(todayStr);
    for (var i = -1; i < 24; i++) {
      var mk = addMonths(cur, i);
      var diff = monthDiff(r.startMonth, mk);
      if (diff < 0 || diff % r.every !== 0 || r.paid.indexOf(mk) !== -1) continue;
      return mk + '-' + pad(Math.min(r.dueDay, daysInMonth(mk)));
    }
    return null;
  }

  function dueText(o) {
    if (o.daysLeft < 0) return 'Overdue by ' + -o.daysLeft + (o.daysLeft === -1 ? ' day' : ' days');
    if (o.daysLeft === 0) return 'Due today';
    if (o.daysLeft === 1) return 'Due tomorrow';
    return 'Due in ' + o.daysLeft + ' days';
  }

  // ---- report periods ---------------------------------------------------------

  function periodMonths(kind, anchor) {
    var p = anchor.split('-').map(Number);
    if (kind === 'month') return [anchor];
    var start = kind === 'quarter' ? p[0] + '-' + pad(Math.floor((p[1] - 1) / 3) * 3 + 1) : p[0] + '-01';
    var n = kind === 'quarter' ? 3 : 12;
    var out = [];
    for (var i = 0; i < n; i++) out.push(addMonths(start, i));
    return out;
  }
  function shiftPeriod(kind, anchor, dir) { return addMonths(anchor, dir * (kind === 'month' ? 1 : kind === 'quarter' ? 3 : 12)); }
  function periodLabel(kind, anchor) {
    var p = anchor.split('-').map(Number);
    if (kind === 'month') return monthLabel(anchor);
    if (kind === 'quarter') return 'Q' + (Math.floor((p[1] - 1) / 3) + 1) + ' ' + p[0];
    return String(p[0]);
  }

  // ---- validation (the "Inputs valid?" step) -----------------------------------

  function validAmount(v, allowZero) {
    var n = Number(v);
    if (v === '' || v === null || isNaN(n)) return 'Enter an amount.';
    if (allowZero ? n < 0 : n <= 0) return allowZero ? 'Amount can’t be negative.' : 'Enter an amount above 0.';
    if (n > 1e10) return 'That amount looks too large.';
    return null;
  }
  function collect(map) {
    var out = {};
    Object.keys(map).forEach(function (k) { if (map[k]) out[k] = map[k]; });
    return out;
  }
  function validateExpense(v) {
    return collect({
      amount: validAmount(v.amount),
      category: v.category ? null : 'Choose a category.',
      date: v.date ? null : 'Pick a date.',
      method: v.method ? null : 'Choose a payment method.'
    });
  }
  function validateIncome(v) {
    return collect({
      source: v.source && v.source.trim() ? null : 'Enter where the money came from.',
      amount: validAmount(v.amount),
      month: v.month ? null : 'Pick a month.'
    });
  }

  // ---- sample data for demos ----------------------------------------------------

  // Three months of realistic PKR household spending, ending today, so every screen has something to show.
  function sampleData(todayStr, theme) {
    var db = empty();
    var cur = monthKey(todayStr), day = Number(todayStr.slice(8, 10));
    var months = [addMonths(cur, -2), addMonths(cur, -1), cur];
    var created = Date.now() - 1e8;
    db.settings = { onboarded: true, currency: 'PKR', theme: theme || 'light', sample: true };
    // Mixed on purpose: most categories on track, a couple near the limit, dining over budget.
    db.budgets = { total: 160000, categories: { 'Groceries': 35000, 'Food & dining': 6000, 'Utilities': 32000, 'Rent': 65000, 'Transport': 15000, 'Maintenance': 8000, 'Health': 5000, 'Education': 15000 } };

    function tx(o) { created += 1000; db.transactions.push(Object.assign({ id: uid(), createdAt: created, notes: '' }, o)); }
    var electricity = [18500, 14200, 16800];
    var template = [
      [1, 55000, 'Rent', 'Bank transfer', 'House rent', 'Rent'],
      [3, 14500, 'Groceries', 'Debit card', 'Monthly stock'],
      [5, 10000, 'Education', 'Bank transfer', 'School fee', 'School fee'],
      [7, 3200, 'Transport', 'JazzCash', 'Ride-hailing'],
      [9, 2800, 'Food & dining', 'Credit card', 'Dinner out'],
      [10, null, 'Utilities', 'Bank transfer', 'Electricity', 'Electricity'],
      [12, 3400, 'Utilities', 'Easypaisa', 'Gas', 'Gas'],
      [14, 4500, 'Utilities', 'Debit card', 'Internet', 'Internet'],
      [16, 6000, 'Transport', 'Cash', 'Fuel'],
      [18, 9800, 'Groceries', 'Cash', 'Vegetables and fruit'],
      [21, 2500, 'Health', 'Cash', 'Pharmacy'],
      [24, 4200, 'Food & dining', 'JazzCash', 'Food delivery'],
      [26, 7600, 'Groceries', 'Debit card', 'Weekly groceries'],
      [28, 1800, 'Other', 'Easypaisa', 'Mobile top-up']
    ];
    var paid = { Rent: [], Electricity: [], Gas: [], Internet: [], 'School fee': [] };

    months.forEach(function (mk, mi) {
      var isCur = mk === cur;
      tx({ type: 'income', source: 'Salary', amount: 185000, month: mk });
      if (mi === 1) tx({ type: 'income', source: 'Freelance project', amount: 25000, month: mk });
      if (mi === 0) tx({ type: 'expense', amount: 6500, category: 'Education', date: mk + '-08', method: 'Cash', notes: 'Books and uniform' });
      template.forEach(function (r) {
        var d = Math.min(r[0], daysInMonth(mk));
        if (isCur && d > day) return;
        var notes = r[5] ? r[4] + ' · ' + monthLabel(mk) : r[4];
        tx({ type: 'expense', amount: r[1] == null ? electricity[mi] : r[1], category: r[2], date: mk + '-' + pad(d), method: r[3], notes: notes });
        if (r[5]) paid[r[5]].push(mk);
      });
    });

    function job(mk, d, title, provider, cost, notes) {
      var date = mk + '-' + pad(Math.min(d, daysInMonth(mk)));
      var txId = uid();
      created += 1000;
      db.transactions.push({ id: txId, createdAt: created, type: 'expense', amount: cost, category: 'Maintenance', date: date, method: 'Cash', notes: title + ' · ' + provider });
      db.jobs.push({ id: uid(), title: title, provider: provider, cost: cost, date: date, notes: notes || '', txId: txId });
      return date;
    }
    var ac = job(months[0], 15, 'AC service', 'Cool Breeze Services', 6500, 'Two split units, gas top-up');
    job(months[1], 20, 'Kitchen tap leak', 'Ustad Akram (plumber)', 3500);
    if (day >= 2) job(cur, 2, 'Water tank cleaning', 'CleanTank', 2500);

    [['Rent', 'Rent', 1, 55000], ['School fee', 'Education', 5, 10000], ['Electricity', 'Utilities', 10, 0], ['Gas', 'Utilities', 12, 3400], ['Internet', 'Utilities', 14, 4500]].forEach(function (b) {
      db.recurring.push({ id: uid(), name: b[0], category: b[1], amount: b[3], dueDay: b[2], every: 1, startMonth: months[0], paid: paid[b[0]], source: 'bill' });
    });
    // One bill due in two days, so the reminder and "Mark as paid?" step can be shown.
    db.recurring.push({ id: uid(), name: 'Water', category: 'Utilities', amount: 1200, dueDay: Math.min(day + 2, 28), every: 1, startMonth: cur, paid: [], source: 'bill' });
    db.recurring.push({ id: uid(), name: 'AC service', category: 'Maintenance', amount: 6500, dueDay: Number(ac.slice(8, 10)), every: 6, startMonth: addMonths(months[0], 6), paid: [], source: 'maintenance' });
    return db;
  }

  // ---- CSV export -------------------------------------------------------------

  function toCSV(rows) {
    return rows.map(function (r) {
      return r.map(function (c) {
        var s = String(c == null ? '' : c);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\n');
  }

  window.HL = window.HL || {};
  window.HL.store = {
    CATEGORIES: CATEGORIES, METHODS: METHODS, CURRENCIES: CURRENCIES, EVERY: EVERY, BILL_PRESETS: BILL_PRESETS,
    empty: empty, normalize: normalize, load: load, save: save, isBackup: isBackup,
    uid: uid, pad: pad, today: today, parseDate: parseDate, monthKey: monthKey, addMonths: addMonths, monthDiff: monthDiff,
    daysInMonth: daysInMonth, monthLabel: monthLabel, dateLabel: dateLabel,
    money: money, compact: compact, txMonth: txMonth, inMonths: inMonths, totals: totals, spentByCategory: spentByCategory,
    budgetStatus: budgetStatus, budgetMessage: budgetMessage,
    occurrences: occurrences, nextDue: nextDue, dueText: dueText,
    periodMonths: periodMonths, shiftPeriod: shiftPeriod, periodLabel: periodLabel,
    validateExpense: validateExpense, validateIncome: validateIncome, validAmount: validAmount, toCSV: toCSV, sampleData: sampleData
  };
})();
