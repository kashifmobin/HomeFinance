/* Home Ledger — screens and app shell. */
(function () {
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo;
  var html = htm.bind(React.createElement);
  var M = window.MinimalLight;
  var S = window.HL.store;
  var Ch = window.HL.charts;

  // ---- icons ------------------------------------------------------------------

  var ICONS = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    wallet: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14.5h.01',
    wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
    sliders: 'M4 6h9m4 0h3M4 12h3m4 0h9M4 18h11m4 0h1M15 4v4M9 10v4M17 16v4',
    plus: 'M12 5v14M5 12h14',
    left: 'M15 6l-6 6 6 6',
    right: 'M9 6l6 6-6 6',
    download: 'M12 4v12m0 0-5-5m5 5 5-5M4 20h16',
    upload: 'M12 16V4m0 0L7 9m5-5 5 5M4 20h16',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3',
    alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    check: 'M20 6 9 17l-5-5',
    cap: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5M22 10v6'
  };
  function Icon(p) {
    return html`<svg width=${p.size || 20} height=${p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d=${ICONS[p.name]} /></svg>`;
  }

  var TABS = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'transactions', label: 'Transactions', icon: 'list' },
    { id: 'budget', label: 'Budget', icon: 'wallet' },
    { id: 'maintenance', label: 'Maintenance', icon: 'wrench' },
    { id: 'reports', label: 'Reports', icon: 'chart' }
  ];
  var MORE = [{ id: 'education', label: 'Education', icon: 'cap' }, { id: 'bills', label: 'Bills', icon: 'bell' }, { id: 'settings', label: 'Settings', icon: 'sliders' }];
  var TITLES = { home: 'Home', transactions: 'Transactions', budget: 'Budget', maintenance: 'Home maintenance', reports: 'Reports', education: 'Education', bills: 'Bills and reminders', settings: 'Settings' };

  function useRoute() {
    function parse() { var r = location.hash.replace(/^#\/?/, ''); return TITLES[r] ? r : 'home'; }
    var st = useState(parse);
    useEffect(function () {
      function on() { st[1](parse()); window.scrollTo(0, 0); }
      window.addEventListener('hashchange', on);
      return function () { window.removeEventListener('hashchange', on); };
    }, []);
    return st[0];
  }

  // ---- form fields ------------------------------------------------------------

  function Field(p) {
    return html`<div className=${'ml-field' + (p.error ? ' ml-field-error' : '')}>
      <label className="ml-label" htmlFor=${p.id}>${p.label}</label>
      ${p.children}
      ${(p.error || p.hint) && html`<p className="ml-hint" id=${p.id + '-hint'}>${p.error || p.hint}</p>`}
    </div>`;
  }
  function Select(p) {
    return html`<${Field} id=${p.id} label=${p.label} error=${p.error} hint=${p.hint}>
      <select id=${p.id} className="ml-input" value=${p.value} aria-invalid=${p.error ? true : undefined}
        aria-describedby=${p.error || p.hint ? p.id + '-hint' : undefined}
        onChange=${function (e) { p.onChange(e.target.value); }}>
        ${p.placeholder && html`<option value="" disabled>${p.placeholder}</option>`}
        ${p.options.map(function (o) {
          var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
          return html`<option key=${v} value=${v}>${l}</option>`;
        })}
      </select>
    <//>`;
  }
  function TextArea(p) {
    return html`<${Field} id=${p.id} label=${p.label} hint=${p.hint}>
      <textarea id=${p.id} className="ml-input textarea" rows="3" value=${p.value} placeholder=${p.placeholder}
        onChange=${function (e) { p.onChange(e.target.value); }}></textarea>
    <//>`;
  }
  function Segmented(p) {
    return html`<div className="segmented" role="radiogroup" aria-label=${p.label}>
      ${p.options.map(function (o) {
        return html`<button key=${o[0]} type="button" role="radio" aria-checked=${p.value === o[0]}
          className=${'segment' + (p.value === o[0] ? ' is-on' : '')} onClick=${function () { p.onChange(o[0]); }}>${o[1]}</button>`;
      })}
    </div>`;
  }
  function useForm(initial) {
    var st = useState(initial), errs = useState({});
    function set(k) { return function (val) { st[1](function (prev) { var n = Object.assign({}, prev); n[k] = val; return n; }); }; }
    function bind(k) { return { value: st[0][k], onChange: function (e) { set(k)(e.target.value); }, error: errs[0][k] }; }
    return { v: st[0], set: set, bind: bind, errors: errs[0], setErrors: errs[1] };
  }
  // Moves focus to the first invalid field so the inline error is read out (the "Retry" path).
  function focusFirstError(formEl) {
    setTimeout(function () { var el = formEl && formEl.querySelector('[aria-invalid="true"]'); if (el) el.focus(); }, 0);
  }

  // ---- small pieces -----------------------------------------------------------

  function Amount(p) {
    var income = p.type === 'income';
    return html`<span className=${'amount' + (income ? ' is-income' : '')}>${(income ? '+' : '−') + S.money(p.value, p.currency)}</span>`;
  }

  function TxRow(p) {
    var t = p.tx;
    // titleFromNotes: on a single-category page the category is redundant, so the note leads.
    var useNotes = p.titleFromNotes && t.notes;
    var title = useNotes ? t.notes : t.type === 'income' ? t.source : t.category;
    var meta = t.type === 'income' ? 'Income · ' + S.monthLabel(t.month) : S.dateLabel(t.date) + ' · ' + t.method;
    if (useNotes) return html`<li>
      <button type="button" className="row" onClick=${function () { p.onOpen(t); }}>
        <span className="row-dot" style=${{ background: Ch.categoryColor(t.category) }}></span>
        <span className="row-main"><span className="row-title">${title}</span><span className="row-meta">${meta}</span></span>
        <${Amount} type=${t.type} value=${t.amount} currency=${p.currency} />
      </button>
    </li>`;
    return html`<li>
      <button type="button" className="row" onClick=${function () { p.onOpen(t); }}>
        <span className="row-dot" style=${{ background: t.type === 'income' ? 'var(--success)' : Ch.categoryColor(t.category) }}></span>
        <span className="row-main">
          <span className="row-title">${title}</span>
          <span className="row-meta">${meta}${t.notes ? ' · ' + t.notes : ''}</span>
        </span>
        <${Amount} type=${t.type} value=${t.amount} currency=${p.currency} />
      </button>
    </li>`;
  }

  function BudgetBar(p) {
    var st = S.budgetStatus(p.spent, p.planned);
    var pct = st ? Math.min(st.pct, 1) * 100 : 0;
    var note = !st ? 'No budget set'
      : st.level === 'over' ? 'Over by ' + S.money(p.spent - p.planned, p.currency)
      : S.money(p.planned - p.spent, p.currency) + ' left';
    return html`<div className="budget-bar">
      <div className="budget-bar-head">
        <span className="label">${p.label}</span>
        <span className="small muted">${S.money(p.spent, p.currency)}${st ? ' of ' + S.money(p.planned, p.currency) : ''}</span>
      </div>
      <div className="track" role="meter" aria-label=${p.label} aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(pct)}>
        <div className=${'fill is-' + (st ? st.level : 'ok')} style=${{ width: pct + '%' }}></div>
      </div>
      <div className="budget-bar-foot small">
        ${st && st.level !== 'ok' && html`<span className=${'status is-' + st.level}><${Icon} name="alert" size=${14} />${st.level === 'over' ? 'Over budget' : 'Near limit'}</span>`}
        <span className="muted">${note}</span>
        ${st && html`<span className="muted push">${Math.round(st.pct * 100)}%</span>`}
      </div>
    </div>`;
  }

  function Section(p) {
    return html`<section className="section">
      <div className="section-head">
        <h2 className="h3">${p.title}</h2>
        ${p.action}
      </div>
      ${p.children}
    </section>`;
  }

  function Empty(p) { return html`<p className="empty">${p.children}</p>`; }

  function MonthSwitcher(p) {
    return html`<div className="switcher">
      <button type="button" className="icon-btn" aria-label="Previous" onClick=${function () { p.onChange(-1); }}><${Icon} name="left" /></button>
      <span className="switcher-label">${p.label}</span>
      <button type="button" className="icon-btn" aria-label="Next" onClick=${function () { p.onChange(1); }}><${Icon} name="right" /></button>
    </div>`;
  }

  function Confirm(p) {
    return html`<${M.Dialog} open=${!!p.open} onClose=${p.onCancel} title=${p.title}
      actions=${html`<${M.Button} variant="secondary" onClick=${p.onCancel}>${p.cancelLabel || 'Cancel'}<//>
        <${M.Button} variant=${p.danger ? 'danger' : 'primary'} onClick=${p.onConfirm}>${p.confirmLabel}<//>`}>
      <p>${p.body}</p>
    <//>`;
  }

  // ---- onboarding ---------------------------------------------------------------

  function Onboarding(p) {
    var f = useForm({ currency: 'PKR', theme: 'light', budget: '', bills: true });
    var formRef = useRef(null);
    function submit(e) {
      e.preventDefault();
      var err = S.validAmount(f.v.budget);
      f.setErrors(err ? { budget: err } : {});
      if (err) return focusFirstError(formRef.current);
      p.onDone(f.v);
    }
    return html`<div className="onboarding">
      <form className="onboarding-card" ref=${formRef} onSubmit=${submit} noValidate>
        <div className="brand-mark" aria-hidden="true"><${Icon} name="home" size=${24} /></div>
        <h1 className="h1">Welcome to Home Ledger</h1>
        <p className="body muted">Track spending, budgets, bills and home repairs in one place. Everything stays on this device.</p>
        <${Select} id="ob-currency" label="Currency" value=${f.v.currency} onChange=${f.set('currency')}
          options=${S.CURRENCIES.map(function (c) { return [c[0], c[0] + ' — ' + c[1]]; })} />
        <div className="ml-field">
          <span className="ml-label">Theme</span>
          <${Segmented} label="Theme" value=${f.v.theme} onChange=${function (v) { f.set('theme')(v); p.onPreviewTheme(v); }}
            options=${[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']]} />
        </div>
        <${M.Input} label=${'Monthly budget (' + f.v.currency + ')'} type="number" inputMode="decimal" min="0" step="any"
          placeholder="e.g. 80000" hint="You can split it by category later." ...${f.bind('budget')} />
        <label className="check">
          <input type="checkbox" checked=${f.v.bills} onChange=${function (e) { f.set('bills')(e.target.checked); }} />
          <span>Add common bills: electricity, gas, internet and rent</span>
        </label>
        <${M.Button} type="submit" block=${true}>Get started<//>
        <div className="divider small muted"><span>or</span></div>
        <${M.Button} variant="secondary" block=${true} onClick=${function () { p.onSample(f.v.theme); }}>Try with sample data<//>
        <p className="small muted center">Three months of example household spending in PKR. You can clear it any time in Settings.</p>
      </form>
    </div>`;
  }

  // ---- transaction editor (add / edit / delete expense and income) -----------------

  function ExpenseForm(p) {
    var t = p.tx || p.defaults || {};
    var f = useForm({ amount: t.amount != null ? String(t.amount) : '', category: t.category || '', date: t.date || S.today(), method: t.method || 'Cash', notes: t.notes || '' });
    var formRef = useRef(null);
    function submit(e) {
      e.preventDefault();
      var errs = S.validateExpense(f.v);
      f.setErrors(errs);
      if (Object.keys(errs).length) return focusFirstError(formRef.current);
      p.onSave({ amount: Number(f.v.amount), category: f.v.category, date: f.v.date, method: f.v.method, notes: f.v.notes.trim() });
    }
    return html`<form id=${p.formId} ref=${formRef} className="form" onSubmit=${submit} noValidate>
      <${M.Input} label=${'Amount (' + p.currency + ')'} type="number" inputMode="decimal" min="0" step="any" autoFocus=${!p.tx} ...${f.bind('amount')} />
      <${Select} id="ex-category" label="Category" placeholder="Choose a category" value=${f.v.category} onChange=${f.set('category')} options=${S.CATEGORIES} error=${f.errors.category} />
      <div className="form-row">
        <${M.Input} label="Date" type="date" ...${f.bind('date')} />
        <${Select} id="ex-method" label="Payment method" value=${f.v.method} onChange=${f.set('method')} options=${S.METHODS} error=${f.errors.method} />
      </div>
      <${TextArea} id="ex-notes" label="Notes" placeholder="Optional" value=${f.v.notes} onChange=${f.set('notes')} />
    </form>`;
  }

  function IncomeForm(p) {
    var t = p.tx || {};
    var f = useForm({ source: t.source || '', amount: t.amount != null ? String(t.amount) : '', month: t.month || S.monthKey(S.today()), notes: t.notes || '' });
    var formRef = useRef(null);
    function submit(e) {
      e.preventDefault();
      var errs = S.validateIncome(f.v);
      f.setErrors(errs);
      if (Object.keys(errs).length) return focusFirstError(formRef.current);
      p.onSave({ source: f.v.source.trim(), amount: Number(f.v.amount), month: f.v.month, notes: f.v.notes.trim() });
    }
    return html`<form id=${p.formId} ref=${formRef} className="form" onSubmit=${submit} noValidate>
      <${M.Input} label="Source" placeholder="e.g. Salary, Freelance, Rent received" autoFocus=${!p.tx} ...${f.bind('source')} />
      <div className="form-row">
        <${M.Input} label=${'Amount (' + p.currency + ')'} type="number" inputMode="decimal" min="0" step="any" ...${f.bind('amount')} />
        <${M.Input} label="Month" type="month" ...${f.bind('month')} />
      </div>
      <${TextArea} id="in-notes" label="Notes" placeholder="Optional" value=${f.v.notes} onChange=${f.set('notes')} />
    </form>`;
  }

  function TxEditor(p) {
    var ed = p.editor;
    var confirm = useState(false);
    if (!ed) return null;
    var isIncome = ed.kind === 'income';
    var editing = !!ed.tx;
    var formId = 'tx-form';
    var title = (editing ? 'Edit ' : 'Add ') + (isIncome ? 'income' : 'expense');
    var actions = html`
      ${editing && html`<${M.Button} variant="ghost" className="danger-text" onClick=${function () { confirm[1](true); }}>Delete<//>`}
      <${M.Button} variant="secondary" onClick=${p.onClose}>Cancel<//>
      <${M.Button} type="submit" form=${formId}>${editing ? 'Save changes' : 'Save'}<//>`;
    var Form = isIncome ? IncomeForm : ExpenseForm;
    return html`
      <${M.Dialog} open=${!confirm[0]} onClose=${p.onClose} title=${title} actions=${actions}>
        <${Form} key=${ed.tx ? ed.tx.id : ed.kind} formId=${formId} tx=${ed.tx} defaults=${ed.defaults} currency=${p.currency}
          onSave=${function (values) { p.onSave(ed.kind, values, ed.tx); }} />
      <//>
      <${Confirm} open=${confirm[0]} title="Delete this record?" danger=${true} confirmLabel="Delete"
        body="It will be removed from your totals and reports. You can’t undo this."
        onCancel=${function () { confirm[1](false); }}
        onConfirm=${function () { confirm[1](false); p.onDelete(ed.tx); }} />`;
  }

  // ---- mark bill as paid ----------------------------------------------------------

  function PayDialog(p) {
    var o = p.occ;
    var f = useForm({ amount: o && o.item.amount ? String(o.item.amount) : '', method: 'Bank transfer', date: S.today() });
    var formRef = useRef(null);
    if (!o) return null;
    function submit(e) {
      e.preventDefault();
      var errs = S.validateExpense({ amount: f.v.amount, category: o.item.category, date: f.v.date, method: f.v.method });
      f.setErrors(errs);
      if (Object.keys(errs).length) return focusFirstError(formRef.current);
      p.onPaid(o, { amount: Number(f.v.amount), method: f.v.method, date: f.v.date });
    }
    return html`<${M.Dialog} open=${true} onClose=${p.onClose} title=${'Mark ' + o.item.name + ' as paid?'}
      actions=${html`<${M.Button} variant="secondary" onClick=${p.onClose}>Not yet<//><${M.Button} type="submit" form="pay-form">Yes, record expense<//>`}>
      <p className="small muted">${o.item.name} for ${S.monthLabel(o.month)} · ${S.dueText(o)} (${S.dateLabel(o.due)}). If you choose “Not yet”, it stays in upcoming bills.</p>
      <form id="pay-form" ref=${formRef} className="form" onSubmit=${submit} noValidate>
        <${M.Input} label=${'Amount paid (' + p.currency + ')'} type="number" inputMode="decimal" min="0" step="any" autoFocus=${true} ...${f.bind('amount')} />
        <div className="form-row">
          <${M.Input} label="Date paid" type="date" ...${f.bind('date')} />
          <${Select} id="pay-method" label="Payment method" value=${f.v.method} onChange=${f.set('method')} options=${S.METHODS} />
        </div>
      </form>
    <//>`;
  }

  // ---- Home (dashboard) ---------------------------------------------------------------

  function BillRow(p) {
    var o = p.occ;
    return html`<li className="bill-row">
      <span className=${'bill-icon is-' + o.status}><${Icon} name=${o.status === 'upcoming' ? 'bell' : 'alert'} size=${18} /></span>
      <span className="row-main">
        <span className="row-title">${o.item.name}</span>
        <span className=${'row-meta' + (o.status === 'overdue' ? ' danger-text' : '')}>${S.dueText(o)} · ${S.dateLabel(o.due)}${o.item.amount ? ' · about ' + S.money(o.item.amount, p.currency) : ''}</span>
      </span>
      <${M.Button} variant="secondary" onClick=${function () { p.onPay(o); }}>Mark paid<//>
    </li>`;
  }

  function Home(p) {
    var db = p.db, cur = p.currency;
    var month = S.monthKey(S.today());
    var t = S.totals(db, [month]);
    var spent = S.spentByCategory(db, [month]);
    var occ = S.occurrences(db, S.today());
    var dismissed = useState({});
    var reminders = occ.filter(function (o) { return o.status !== 'upcoming' && !dismissed[0][o.item.id + o.month]; });
    var recent = db.transactions.slice().sort(sortTx).slice(0, 5);
    var catRows = S.CATEGORIES.filter(function (c) { return db.budgets.categories[c] > 0; })
      .map(function (c) { return { c: c, s: spent[c] || 0, b: db.budgets.categories[c] }; })
      .sort(function (a, b) { return b.s / b.b - a.s / a.b; }).slice(0, 4);

    return html`<div className="stack">
      ${reminders.length > 1 && html`<div className=${'reminder is-' + (reminders.some(function (o) { return o.status === 'overdue'; }) ? 'overdue' : 'soon')} role="status">
        <${Icon} name="bell" />
        <div className="reminder-text">
          <strong>${reminders.length} bills need attention</strong>
          <span className="small">${reminders.map(function (o) { return o.item.name + ' (' + S.dueText(o).toLowerCase() + ')'; }).join(', ')}</span>
        </div>
        <div className="reminder-actions"><${M.Button} href="#/bills">Review bills<//></div>
      </div>`}
      ${reminders.length === 1 && reminders.map(function (o) {
        return html`<div key=${o.item.id + o.month} className=${'reminder is-' + o.status} role="status">
          <${Icon} name="bell" />
          <div className="reminder-text">
            <strong>${o.item.name} ${o.status === 'overdue' ? 'is overdue' : 'is due soon'}</strong>
            <span className="small">${S.dueText(o)} · ${S.dateLabel(o.due)}. Mark as paid?</span>
          </div>
          <div className="reminder-actions">
            <${M.Button} variant="ghost" onClick=${function () { var d = Object.assign({}, dismissed[0]); d[o.item.id + o.month] = true; dismissed[1](d); }}>Later<//>
            <${M.Button} onClick=${function () { p.onPay(o); }}>Mark paid<//>
          </div>
        </div>`;
      })}

      <div>
        <p className="caption muted">${S.monthLabel(month)}</p>
        <div className="stats">
          <div className="stat"><span className="small muted">Income</span><strong className="stat-value">${S.money(t.income, cur)}</strong></div>
          <div className="stat"><span className="small muted">Expenses</span><strong className="stat-value">${S.money(t.expense, cur)}</strong></div>
          <div className="stat stat-wide"><span className="small muted">Balance</span>
            <strong className=${'stat-value' + (t.savings < 0 ? ' danger-text' : '')}>${S.money(t.savings, cur)}</strong></div>
        </div>
      </div>

      <div className="home-grid">
        <div className="stack">
          <${Section} title="Budget this month" action=${html`<a className="link" href="#/budget">Edit</a>`}>
            <div className="panel">
              <${BudgetBar} label="Total" spent=${t.expense} planned=${db.budgets.total} currency=${cur} />
              ${catRows.map(function (r) { return html`<${BudgetBar} key=${r.c} label=${r.c} spent=${r.s} planned=${r.b} currency=${cur} />`; })}
              ${!catRows.length && html`<p className="small muted">Set category budgets to see how each one is doing.</p>`}
            </div>
          <//>
          <${Section} title="Upcoming bills" action=${html`<a className="link" href="#/bills">All bills</a>`}>
            ${occ.length ? html`<ul className="panel list">${occ.slice(0, 4).map(function (o) {
              return html`<${BillRow} key=${o.item.id + o.month} occ=${o} currency=${cur} onPay=${p.onPay} />`;
            })}</ul>` : html`<${Empty}>No bills due in the next two weeks.<//>`}
          <//>
        </div>
        <${Section} title="Recent transactions" action=${html`<a className="link" href="#/transactions">See all</a>`}>
          ${recent.length ? html`<ul className="panel list">${recent.map(function (tx) {
            return html`<${TxRow} key=${tx.id} tx=${tx} currency=${cur} onOpen=${p.onOpenTx} />`;
          })}</ul>` : html`<${Empty}>No transactions yet. Tap + to add your first expense.<//>`}
        <//>
      </div>
    </div>`;
  }

  function sortTx(a, b) {
    var da = a.type === 'income' ? a.month + '-01' : a.date, dbb = b.type === 'income' ? b.month + '-01' : b.date;
    if (da !== dbb) return da < dbb ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  }

  // ---- Transactions -------------------------------------------------------------------

  function Transactions(p) {
    var db = p.db, cur = p.currency;
    var q = useState(''), cat = useState('all'), month = useState('');
    var list = useMemo(function () {
      var needle = q[0].trim().toLowerCase();
      return db.transactions.filter(function (t) {
        if (cat[0] === 'income' && t.type !== 'income') return false;
        if (cat[0] !== 'all' && cat[0] !== 'income' && (t.type !== 'expense' || t.category !== cat[0])) return false;
        if (month[0] && S.txMonth(t) !== month[0]) return false;
        if (!needle) return true;
        return [t.category, t.source, t.notes, t.method, String(t.amount)].join(' ').toLowerCase().indexOf(needle) !== -1;
      }).sort(sortTx);
    }, [db.transactions, q[0], cat[0], month[0]]);
    var sum = list.reduce(function (s, t) { return s + (t.type === 'income' ? t.amount : -t.amount); }, 0);
    var filtered = q[0] || cat[0] !== 'all' || month[0];

    return html`<div className="stack">
      <div className="toolbar">
        <${M.Button} onClick=${function () { p.onAdd('expense'); }}><${Icon} name="plus" />Add expense<//>
        <${M.Button} variant="secondary" onClick=${function () { p.onAdd('income'); }}><${Icon} name="plus" />Add income<//>
      </div>
      <div className="filters">
        <div className="ml-field search">
          <label className="ml-label" htmlFor="tx-search">Search</label>
          <div className="search-box">
            <${Icon} name="search" />
            <input id="tx-search" className="ml-input" type="search" placeholder="Category, notes, amount" value=${q[0]} onChange=${function (e) { q[1](e.target.value); }} />
          </div>
        </div>
        <${Select} id="tx-cat" label="Category" value=${cat[0]} onChange=${cat[1]}
          options=${[['all', 'All'], ['income', 'Income only']].concat(S.CATEGORIES.map(function (c) { return [c, c]; }))} />
        <${M.Input} label="Month" type="month" value=${month[0]} onChange=${function (e) { month[1](e.target.value); }} />
      </div>
      <div className="list-head small muted">
        <span>${list.length} ${list.length === 1 ? 'record' : 'records'}${filtered ? ' · net ' + S.money(sum, cur) : ''}</span>
        ${filtered && html`<button type="button" className="link" onClick=${function () { q[1](''); cat[1]('all'); month[1](''); }}>Clear filters</button>`}
      </div>
      ${list.length ? html`<ul className="panel list">${list.map(function (t) {
        return html`<${TxRow} key=${t.id} tx=${t} currency=${cur} onOpen=${p.onOpenTx} />`;
      })}</ul>` : html`<${Empty}>${db.transactions.length ? 'Nothing matches these filters.' : 'No transactions yet.'}<//>`}
    </div>`;
  }

  // ---- Budget planning ----------------------------------------------------------------

  function BudgetForm(p) {
    var init = { total: String(p.budgets.total || '') };
    S.CATEGORIES.forEach(function (c) { init[c] = p.budgets.categories[c] ? String(p.budgets.categories[c]) : ''; });
    var f = useForm(init);
    var formRef = useRef(null);
    var catSum = S.CATEGORIES.reduce(function (s, c) { return s + (Number(f.v[c]) || 0); }, 0);
    function submit(e) {
      e.preventDefault();
      var errs = {};
      var te = S.validAmount(f.v.total);
      if (te) errs.total = te;
      S.CATEGORIES.forEach(function (c) { if (f.v[c] !== '') { var ce = S.validAmount(f.v[c], true); if (ce) errs[c] = ce; } });
      f.setErrors(errs);
      if (Object.keys(errs).length) return focusFirstError(formRef.current);
      var cats = {};
      S.CATEGORIES.forEach(function (c) { if (Number(f.v[c]) > 0) cats[c] = Number(f.v[c]); });
      p.onSave({ total: Number(f.v.total), categories: cats });
    }
    return html`<form id="budget-form" ref=${formRef} className="form" onSubmit=${submit} noValidate>
      <${M.Input} label=${'Total monthly budget (' + p.currency + ')'} type="number" inputMode="decimal" min="0" step="any" ...${f.bind('total')}
        hint=${catSum > (Number(f.v.total) || 0) ? 'Category budgets add up to ' + S.money(catSum, p.currency) + ', more than the total.' : 'Category budgets add up to ' + S.money(catSum, p.currency) + '.'} />
      <div className="form-grid">
        ${S.CATEGORIES.map(function (c) {
          return html`<${M.Input} key=${c} label=${c} type="number" inputMode="decimal" min="0" step="any" placeholder="0" ...${f.bind(c)} />`;
        })}
      </div>
    </form>`;
  }

  function Budget(p) {
    var db = p.db, cur = p.currency;
    var month = useState(S.monthKey(S.today()));
    var editing = useState(!db.budgets.total);
    var spent = S.spentByCategory(db, [month[0]]);
    var total = S.totals(db, [month[0]]).expense;
    var rows = S.CATEGORIES.filter(function (c) { return db.budgets.categories[c] > 0 || spent[c] > 0; });
    return html`<div className="stack">
      <div className="toolbar between">
        <${MonthSwitcher} label=${S.monthLabel(month[0])} onChange=${function (d) { month[1](S.addMonths(month[0], d)); }} />
        <${M.Button} variant="secondary" onClick=${function () { editing[1](true); }}>Set budgets<//>
      </div>
      <div className="panel">
        <${BudgetBar} label="Total" spent=${total} planned=${db.budgets.total} currency=${cur} />
      </div>
      <${Section} title="Actual vs planned by category">
        ${rows.length ? html`<div className="panel budget-grid">${rows.map(function (c) {
          return html`<${BudgetBar} key=${c} label=${c} spent=${spent[c] || 0} planned=${db.budgets.categories[c]} currency=${cur} />`;
        })}</div>` : html`<${Empty}>No category budgets or spending yet this month.<//>`}
      <//>
      <${M.Dialog} open=${editing[0]} onClose=${function () { editing[1](false); }} title="Set budgets"
        actions=${html`<${M.Button} variant="secondary" onClick=${function () { editing[1](false); }}>Cancel<//><${M.Button} type="submit" form="budget-form">Save budgets<//>`}>
        <p className="small muted">Budgets repeat every month. Leave a category empty if you don’t want to track it.</p>
        <${BudgetForm} budgets=${db.budgets} currency=${cur} onSave=${function (b) { p.onSaveBudgets(b); editing[1](false); }} />
      <//>
    </div>`;
  }

  // ---- Home maintenance --------------------------------------------------------------

  function JobForm(p) {
    var f = useForm({ title: '', provider: '', cost: '', date: S.today(), method: 'Cash', notes: '', repeat: false, every: '12' });
    var formRef = useRef(null);
    function submit(e) {
      e.preventDefault();
      var errs = {};
      if (!f.v.title.trim()) errs.title = 'Say what the job was.';
      if (!f.v.provider.trim()) errs.provider = 'Enter who did the work.';
      var ce = S.validAmount(f.v.cost); if (ce) errs.cost = ce;
      if (!f.v.date) errs.date = 'Pick a date.';
      f.setErrors(errs);
      if (Object.keys(errs).length) return focusFirstError(formRef.current);
      p.onSave({ title: f.v.title.trim(), provider: f.v.provider.trim(), cost: Number(f.v.cost), date: f.v.date, method: f.v.method,
        notes: f.v.notes.trim(), repeat: f.v.repeat, every: Number(f.v.every) });
    }
    return html`<form id="job-form" ref=${formRef} className="form" onSubmit=${submit} noValidate>
      <${M.Input} label="Job" placeholder="e.g. AC service, plumbing repair" autoFocus=${true} ...${f.bind('title')} />
      <div className="form-row">
        <${M.Input} label="Provider" placeholder="Name or company" ...${f.bind('provider')} />
        <${M.Input} label=${'Cost (' + p.currency + ')'} type="number" inputMode="decimal" min="0" step="any" ...${f.bind('cost')} />
      </div>
      <div className="form-row">
        <${M.Input} label="Date" type="date" ...${f.bind('date')} />
        <${Select} id="job-method" label="Payment method" value=${f.v.method} onChange=${f.set('method')} options=${S.METHODS} />
      </div>
      <${TextArea} id="job-notes" label="Notes" placeholder="Optional" value=${f.v.notes} onChange=${f.set('notes')} />
      <label className="check">
        <input type="checkbox" checked=${f.v.repeat} onChange=${function (e) { f.set('repeat')(e.target.checked); }} />
        <span>Schedule this as a recurring task with reminders</span>
      </label>
      ${f.v.repeat && html`<${Select} id="job-every" label="Repeat" value=${f.v.every} onChange=${f.set('every')}
        options=${S.EVERY.map(function (e) { return [String(e[0]), e[1]]; })} hint="You’ll get a reminder in Bills when it’s due." />`}
    </form>`;
  }

  function Maintenance(p) {
    var db = p.db, cur = p.currency;
    var adding = useState(false), del = useState(null);
    var now = S.today(), month = S.monthKey(now), year = now.slice(0, 4);
    var jobs = db.jobs.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var mSpend = 0, ySpend = 0;
    db.jobs.forEach(function (j) { if (S.monthKey(j.date) === month) mSpend += j.cost; if (j.date.slice(0, 4) === year) ySpend += j.cost; });
    var tasks = db.recurring.filter(function (r) { return r.source === 'maintenance'; });
    return html`<div className="stack">
      <div className="stats">
        <div className="stat"><span className="small muted">This month</span><strong className="stat-value">${S.money(mSpend, cur)}</strong></div>
        <div className="stat"><span className="small muted">This year</span><strong className="stat-value">${S.money(ySpend, cur)}</strong></div>
      </div>
      <div className="toolbar"><${M.Button} onClick=${function () { adding[1](true); }}><${Icon} name="plus" />Add job<//></div>

      ${tasks.length > 0 && html`<${Section} title="Scheduled tasks" action=${html`<a className="link" href="#/bills">Reminders</a>`}>
        <ul className="panel list">${tasks.map(function (r) {
          var nd = S.nextDue(r, now);
          return html`<li key=${r.id} className="bill-row">
            <span className="bill-icon is-upcoming"><${Icon} name="repeat" size=${18} /></span>
            <span className="row-main"><span className="row-title">${r.name}</span>
              <span className="row-meta">${S.EVERY.filter(function (e) { return e[0] === r.every; })[0][1]}${nd ? ' · next ' + S.dateLabel(nd) : ''}</span></span>
            <span className="amount">${S.money(r.amount, cur)}</span>
          </li>`;
        })}</ul>
      <//>`}

      <${Section} title="Jobs">
        ${jobs.length ? html`<ul className="panel list">${jobs.map(function (j) {
          return html`<li key=${j.id} className="job">
            <div className="row-main">
              <span className="row-title">${j.title}</span>
              <span className="row-meta">${j.provider} · ${S.dateLabel(j.date)}${j.notes ? ' · ' + j.notes : ''}</span>
            </div>
            <span className="amount">${S.money(j.cost, cur)}</span>
            <button type="button" className="link danger-text" onClick=${function () { del[1](j); }}>Delete</button>
          </li>`;
        })}</ul>` : html`<${Empty}>No jobs yet. Add repairs and services to track what your home costs.<//>`}
      <//>

      <${M.Dialog} open=${adding[0]} onClose=${function () { adding[1](false); }} title="Add maintenance job"
        actions=${html`<${M.Button} variant="secondary" onClick=${function () { adding[1](false); }}>Cancel<//><${M.Button} type="submit" form="job-form">Save job<//>`}>
        ${adding[0] && html`<${JobForm} currency=${cur} onSave=${function (v) { p.onSaveJob(v); adding[1](false); }} />`}
      <//>
      <${Confirm} open=${!!del[0]} title="Delete this job?" danger=${true} confirmLabel="Delete"
        body="Its recorded expense is deleted too. A scheduled task stays until you remove it in Bills."
        onCancel=${function () { del[1](null); }} onConfirm=${function () { p.onDeleteJob(del[0]); del[1](null); }} />
    </div>`;
  }

  // ---- Bills and reminders ------------------------------------------------------------

  function BillForm(p) {
    var r = p.bill || p.defaults || {};
    var f = useForm({ name: r.name || '', category: r.category || 'Utilities', amount: r.amount ? String(r.amount) : '', dueDay: String(r.dueDay || 10), every: String(r.every || 1) });
    var formRef = useRef(null);
    function submit(e) {
      e.preventDefault();
      var errs = {};
      if (!f.v.name.trim()) errs.name = 'Name the bill.';
      if (f.v.amount !== '') { var ae = S.validAmount(f.v.amount, true); if (ae) errs.amount = ae; }
      var d = Number(f.v.dueDay);
      if (!(d >= 1 && d <= 31 && Math.floor(d) === d)) errs.dueDay = 'Enter a day from 1 to 31.';
      f.setErrors(errs);
      if (Object.keys(errs).length) return focusFirstError(formRef.current);
      p.onSave({ name: f.v.name.trim(), category: f.v.category, amount: Number(f.v.amount) || 0, dueDay: d, every: Number(f.v.every) });
    }
    return html`<form id="bill-form" ref=${formRef} className="form" onSubmit=${submit} noValidate>
      ${!p.bill && html`<div className="chips" aria-label="Quick pick">${(p.presets || S.BILL_PRESETS).map(function (b) {
        return html`<button key=${b.name} type="button" className=${'chip' + (f.v.name === b.name ? ' is-on' : '')}
          onClick=${function () { f.set('name')(b.name); f.set('category')(b.category); }}>${b.name}</button>`;
      })}</div>`}
      <${M.Input} label="Bill name" placeholder="e.g. Electricity" ...${f.bind('name')} />
      <div className="form-row">
        <${Select} id="bill-cat" label="Category" value=${f.v.category} onChange=${f.set('category')} options=${S.CATEGORIES} />
        <${M.Input} label=${'Usual amount (' + p.currency + ')'} type="number" inputMode="decimal" min="0" step="any" placeholder="Varies" hint="Optional" ...${f.bind('amount')} />
      </div>
      <div className="form-row">
        <${M.Input} label="Due day of month" type="number" inputMode="numeric" min="1" max="31" ...${f.bind('dueDay')} />
        <${Select} id="bill-every" label="Repeats" value=${f.v.every} onChange=${f.set('every')} options=${S.EVERY.map(function (e) { return [String(e[0]), e[1]]; })} />
      </div>
    </form>`;
  }

  function Bills(p) {
    var db = p.db, cur = p.currency;
    var editing = useState(null), del = useState(null);
    var occ = S.occurrences(db, S.today());
    return html`<div className="stack">
      <div className="toolbar"><${M.Button} onClick=${function () { editing[1]({}); }}><${Icon} name="plus" />Add bill<//></div>
      <${Section} title="Upcoming and overdue">
        ${occ.length ? html`<ul className="panel list">${occ.map(function (o) {
          return html`<${BillRow} key=${o.item.id + o.month} occ=${o} currency=${cur} onPay=${p.onPay} />`;
        })}</ul>` : html`<${Empty}>Nothing due in the next two weeks.<//>`}
      <//>
      <${Section} title="All recurring bills and tasks">
        ${db.recurring.length ? html`<ul className="panel list">${db.recurring.map(function (r) {
          var nd = S.nextDue(r, S.today());
          return html`<li key=${r.id} className="job">
            <div className="row-main">
              <span className="row-title">${r.name}${r.source === 'maintenance' ? ' · maintenance' : ''}</span>
              <span className="row-meta">${r.category} · day ${r.dueDay} · ${S.EVERY.filter(function (e) { return e[0] === r.every; })[0][1].toLowerCase()}${nd ? ' · next ' + S.dateLabel(nd) : ''}</span>
            </div>
            <span className="amount">${r.amount ? S.money(r.amount, cur) : 'Varies'}</span>
            <span className="row-actions">
              <button type="button" className="link" onClick=${function () { editing[1](r); }}>Edit</button>
              <button type="button" className="link danger-text" onClick=${function () { del[1](r); }}>Delete</button>
            </span>
          </li>`;
        })}</ul>` : html`<${Empty}>No recurring bills yet. Add electricity, gas, internet or rent to get reminders.<//>`}
      <//>
      <${M.Dialog} open=${!!editing[0]} onClose=${function () { editing[1](null); }} title=${editing[0] && editing[0].id ? 'Edit bill' : 'Add bill'}
        actions=${html`<${M.Button} variant="secondary" onClick=${function () { editing[1](null); }}>Cancel<//><${M.Button} type="submit" form="bill-form">Save bill<//>`}>
        ${editing[0] && html`<${BillForm} key=${editing[0].id || 'new'} bill=${editing[0].id ? editing[0] : null} currency=${cur}
          onSave=${function (v) { p.onSaveBill(v, editing[0].id ? editing[0] : null); editing[1](null); }} />`}
      <//>
      <${Confirm} open=${!!del[0]} title="Delete this bill?" danger=${true} confirmLabel="Delete"
        body="Reminders stop. Expenses you already recorded for it stay."
        onCancel=${function () { del[1](null); }} onConfirm=${function () { p.onDeleteBill(del[0]); del[1](null); }} />
    </div>`;
  }

  // ---- Education ----------------------------------------------------------------------

  var EDU_PRESETS = [
    { name: 'School fee', category: 'Education' },
    { name: 'Tuition', category: 'Education' },
    { name: 'School van', category: 'Education' },
    { name: 'Exam fee', category: 'Education' }
  ];

  function Education(p) {
    var db = p.db, cur = p.currency;
    var adding = useState(false);
    var now = S.today(), month = S.monthKey(now), year = now.slice(0, 4);
    var list = db.transactions.filter(function (t) { return t.type === 'expense' && t.category === 'Education'; }).sort(sortTx);
    var mSpend = 0, ySpend = 0;
    list.forEach(function (t) { if (S.monthKey(t.date) === month) mSpend += t.amount; if (t.date.slice(0, 4) === year) ySpend += t.amount; });
    var fees = S.occurrences(db, now).filter(function (o) { return o.item.category === 'Education'; });
    var plans = db.recurring.filter(function (r) { return r.category === 'Education'; });

    return html`<div className="stack">
      <div className="stats">
        <div className="stat"><span className="small muted">This month</span><strong className="stat-value">${S.money(mSpend, cur)}</strong></div>
        <div className="stat"><span className="small muted">This year</span><strong className="stat-value">${S.money(ySpend, cur)}</strong></div>
      </div>
      <div className="toolbar">
        <${M.Button} onClick=${function () { p.onAdd({ category: 'Education' }); }}><${Icon} name="plus" />Add education expense<//>
        <${M.Button} variant="secondary" onClick=${function () { adding[1](true); }}><${Icon} name="bell" />Add fee reminder<//>
      </div>
      <div className="panel">
        <${BudgetBar} label="Monthly budget" spent=${mSpend} planned=${db.budgets.categories.Education} currency=${cur} />
        ${!db.budgets.categories.Education && html`<a className="link" href="#/budget">Set an education budget</a>`}
      </div>

      <div className="home-grid">
        <div className="stack">
          <${Section} title="Upcoming fees">
            ${fees.length ? html`<ul className="panel list">${fees.map(function (o) {
              return html`<${BillRow} key=${o.item.id + o.month} occ=${o} currency=${cur} onPay=${p.onPay} />`;
            })}</ul>` : html`<${Empty}>No education fees due in the next two weeks.<//>`}
          <//>
          ${plans.length > 0 && html`<${Section} title="Fee reminders" action=${html`<a className="link" href="#/bills">Manage</a>`}>
            <ul className="panel list">${plans.map(function (r) {
              var nd = S.nextDue(r, now);
              return html`<li key=${r.id} className="bill-row">
                <span className="bill-icon is-upcoming"><${Icon} name="repeat" size=${18} /></span>
                <span className="row-main"><span className="row-title">${r.name}</span>
                  <span className="row-meta">${S.EVERY.filter(function (e) { return e[0] === r.every; })[0][1]}${nd ? ' · next ' + S.dateLabel(nd) : ''}</span></span>
                <span className="amount">${r.amount ? S.money(r.amount, cur) : 'Varies'}</span>
              </li>`;
            })}</ul>
          <//>`}
        </div>
        <${Section} title="Education expenses">
          ${list.length ? html`<ul className="panel list">${list.map(function (t) {
            return html`<${TxRow} key=${t.id} tx=${t} currency=${cur} onOpen=${p.onOpenTx} titleFromNotes=${true} />`;
          })}</ul>` : html`<${Empty}>No education expenses yet. Add school fees, books, uniforms or tuition.<//>`}
        <//>
      </div>

      <${M.Dialog} open=${adding[0]} onClose=${function () { adding[1](false); }} title="Add fee reminder"
        actions=${html`<${M.Button} variant="secondary" onClick=${function () { adding[1](false); }}>Cancel<//><${M.Button} type="submit" form="bill-form">Save reminder<//>`}>
        ${adding[0] && html`<${BillForm} currency=${cur} presets=${EDU_PRESETS} defaults=${{ category: 'Education', dueDay: 5 }}
          onSave=${function (v) { p.onSaveBill(v, null); adding[1](false); }} />`}
      <//>
    </div>`;
  }

  // ---- Reports ------------------------------------------------------------------------

  function download(name, text, type) {
    var blob = new Blob([text], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function Reports(p) {
    var db = p.db, cur = p.currency;
    var kind = useState('month'), anchor = useState(S.monthKey(S.today())), table = useState(false);
    var months = S.periodMonths(kind[0], anchor[0]);
    var t = S.totals(db, months);
    var byCat = S.spentByCategory(db, months);
    var donut = S.CATEGORIES.map(function (c) { return { label: c, value: byCat[c] || 0 }; });
    var groups = months.map(function (m) {
      var mt = S.totals(db, [m]);
      return { label: kind[0] === 'month' ? S.monthLabel(m, true) : S.monthLabel(m, true), title: S.monthLabel(m), values: { income: mt.income, expense: mt.expense }, savings: mt.savings };
    });
    var series = [{ key: 'income', label: 'Income', color: 'var(--series-1)' }, { key: 'expense', label: 'Expenses', color: 'var(--series-2)' }];
    var rate = t.income > 0 ? Math.round(t.savings / t.income * 100) : null;
    var label = S.periodLabel(kind[0], anchor[0]);

    function exportCSV() {
      var rows = [['Date', 'Type', 'Category or source', 'Amount', 'Currency', 'Payment method', 'Notes']];
      S.inMonths(db, months).sort(sortTx).reverse().forEach(function (x) {
        rows.push([x.type === 'income' ? x.month : x.date, x.type, x.type === 'income' ? x.source : x.category, x.amount, cur, x.method || '', x.notes || '']);
      });
      download('home-ledger-' + label.replace(/\s+/g, '-').toLowerCase() + '.csv', S.toCSV(rows), 'text/csv');
    }

    return html`<div className="stack report">
      <div className="toolbar between no-print">
        <${Segmented} label="Period" value=${kind[0]} onChange=${kind[1]} options=${[['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year']]} />
        <${MonthSwitcher} label=${label} onChange=${function (d) { anchor[1](S.shiftPeriod(kind[0], anchor[0], d)); }} />
      </div>
      <h2 className="h2 print-only">Home Ledger report · ${label}</h2>
      <div className="stats stats-3">
        <div className="stat"><span className="small muted">Income</span><strong className="stat-value">${S.money(t.income, cur)}</strong></div>
        <div className="stat"><span className="small muted">Expenses</span><strong className="stat-value">${S.money(t.expense, cur)}</strong></div>
        <div className="stat"><span className="small muted">Savings${rate !== null ? ' · ' + rate + '% of income' : ''}</span>
          <strong className=${'stat-value' + (t.savings < 0 ? ' danger-text' : '')}>${S.money(t.savings, cur)}</strong></div>
      </div>
      <div className="report-grid">
        <${Section} title="Expenses by category">
          <div className="panel"><${Ch.Donut} data=${donut} currency=${cur} /></div>
        <//>
        <${Section} title="Income vs expenses" action=${html`<button type="button" className="link no-print" onClick=${function () { table[1](!table[0]); }}>${table[0] ? 'Show chart' : 'Show table'}</button>`}>
          <div className="panel">
            <ul className="legend legend-inline">${series.map(function (s) {
              return html`<li key=${s.key}><span className="swatch" style=${{ background: s.color }}></span>${s.label}</li>`;
            })}</ul>
            ${table[0] ? html`<table className="table">
              <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings</th></tr></thead>
              <tbody>${groups.map(function (g) {
                return html`<tr key=${g.title}><td>${g.title}</td><td>${S.money(g.values.income, cur)}</td><td>${S.money(g.values.expense, cur)}</td>
                  <td className=${g.savings < 0 ? 'danger-text' : ''}>${S.money(g.savings, cur)}</td></tr>`;
              })}</tbody>
            </table>` : html`<${Ch.BarChart} groups=${groups} series=${series} currency=${cur} label="Income and expenses by month"
              extra=${function (g) { return html`<div className="tooltip-row">Savings<b>${S.money(g.savings, cur)}</b></div>`; }} />`}
          </div>
        <//>
      </div>
      <div className="toolbar no-print">
        <${M.Button} variant="secondary" onClick=${exportCSV}><${Icon} name="download" />Export CSV<//>
        <${M.Button} variant="secondary" onClick=${function () { window.print(); }}><${Icon} name="download" />Export PDF<//>
      </div>
    </div>`;
  }

  // ---- Settings (data management) ------------------------------------------------------

  function Settings(p) {
    var db = p.db;
    var fileRef = useRef(null);
    var restore = useState(null), reset = useState(false);
    function onFile(e) {
      var file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      file.text().then(function (txt) {
        var data = JSON.parse(txt);
        if (!S.isBackup(data)) throw new Error('bad');
        restore[1](data);
      }).catch(function () { p.toast('That file isn’t a Home Ledger backup.', 'danger'); });
    }
    return html`<div className="stack settings">
      <${Section} title="Currency and theme">
        <div className="panel form">
          <${Select} id="set-currency" label="Currency" value=${db.settings.currency}
            onChange=${function (v) { p.onSettings({ currency: v }); }}
            options=${S.CURRENCIES.map(function (c) { return [c[0], c[0] + ' — ' + c[1]]; })} hint="Amounts are not converted; only the symbol changes." />
          <div className="ml-field">
            <span className="ml-label">Theme</span>
            <${Segmented} label="Theme" value=${db.settings.theme} onChange=${function (v) { p.onSettings({ theme: v }); }}
              options=${[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']]} />
          </div>
        </div>
      <//>
      <${Section} title="Backup and restore">
        <div className="panel stack-sm">
          <p className="small muted">Your data is saved only in this browser. Download a backup to keep a copy or move to another device.</p>
          <div className="toolbar">
            <${M.Button} variant="secondary" onClick=${function () {
              download('home-ledger-backup-' + S.today() + '.json', JSON.stringify(db, null, 2), 'application/json');
              p.toast('Backup downloaded.');
            }}><${Icon} name="download" />Download backup<//>
            <${M.Button} variant="secondary" onClick=${function () { fileRef.current.click(); }}><${Icon} name="upload" />Restore from file<//>
            <input ref=${fileRef} type="file" accept="application/json,.json" hidden onChange=${onFile} />
          </div>
        </div>
      <//>
      <${Section} title=${db.settings.sample ? 'Sample data' : 'Reset'}>
        <div className="panel stack-sm">
          <p className="small muted">${db.settings.sample
            ? 'You’re using sample data. Clear it to set up the app with your own currency, budget and bills.'
            : 'Delete all transactions, budgets, jobs and bills and start again.'}</p>
          <div><${M.Button} variant="danger" onClick=${function () { reset[1](true); }}>${db.settings.sample ? 'Clear sample data' : 'Delete all data'}<//></div>
        </div>
      <//>
      <${Confirm} open=${!!restore[0]} title="Restore this backup?" confirmLabel="Restore"
        body=${restore[0] ? 'It has ' + restore[0].transactions.length + ' transactions. Everything currently in the app will be replaced.' : ''}
        onCancel=${function () { restore[1](null); }} onConfirm=${function () { p.onRestore(restore[0]); restore[1](null); }} />
      <${Confirm} open=${reset[0]} title=${db.settings.sample ? 'Clear sample data?' : 'Delete all data?'} danger=${true}
        confirmLabel=${db.settings.sample ? 'Clear and start fresh' : 'Delete everything'}
        body=${db.settings.sample ? 'The example records are removed and setup starts again.' : 'This can’t be undone. Download a backup first if you might need it.'}
        onCancel=${function () { reset[1](false); }} onConfirm=${function () { reset[1](false); p.onReset(); }} />
    </div>`;
  }

  // ---- shell -----------------------------------------------------------------------------

  // A new bill starts this month unless its due day has already passed.
  function firstMonthFor(dueDay) {
    var now = S.today();
    return Number(now.slice(8, 10)) > dueDay ? S.addMonths(S.monthKey(now), 1) : S.monthKey(now);
  }

  function resolveTheme(pref) {
    if (pref === 'system') return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return pref;
  }

  function Toast(p) {
    if (!p.toast) return null;
    var tone = p.toast.tone || 'ok';
    return html`<div className=${'toast is-' + tone} role="status" key=${p.toast.id}>
      <${Icon} name=${tone === 'ok' ? 'check' : 'alert'} size=${18} />
      <span>${tone === 'warning' ? html`<b>Near limit. </b>` : tone === 'danger' && p.toast.budget ? html`<b>Over budget. </b>` : null}${p.toast.text}</span>
    </div>`;
  }

  function App() {
    var dbState = useState(S.load), db = dbState[0];
    var dbRef = useRef(db); dbRef.current = db;
    var route = useRoute();
    var editor = useState(null), pay = useState(null), toast = useState(null);
    var cur = db.settings.currency;

    function update(fn) {
      var next = fn(JSON.parse(JSON.stringify(dbRef.current)));
      dbRef.current = next;
      var ok = S.save(next);
      dbState[1](next);
      if (!ok) showToast('Couldn’t save to this device. Check that storage is allowed.', 'danger');
      return next;
    }
    function showToast(text, tone, extra) { toast[1](Object.assign({ id: S.uid(), text: text, tone: tone || 'ok' }, extra)); }
    useEffect(function () {
      if (!toast[0]) return;
      var t = setTimeout(function () { toast[1](null); }, 4500);
      return function () { clearTimeout(t); };
    }, [toast[0]]);

    // theme
    var previewTheme = useState(null);
    useEffect(function () {
      function apply() { document.documentElement.dataset.theme = resolveTheme(previewTheme[0] || db.settings.theme); }
      apply();
      var mq = window.matchMedia && matchMedia('(prefers-color-scheme: dark)');
      if (mq && mq.addEventListener) mq.addEventListener('change', apply);
      return function () { if (mq && mq.removeEventListener) mq.removeEventListener('change', apply); };
    }, [db.settings.theme, previewTheme[0]]);

    // After an expense lands in the local database, check the budget status.
    function afterExpense(next, date, category, prefix) {
      var msg = S.budgetMessage(next, S.monthKey(date), category, next.settings.currency);
      if (msg) showToast(prefix + ' ' + msg.text, msg.tone, { budget: true });
      else showToast(prefix);
    }

    function saveTx(kind, values, existing) {
      var next = update(function (d) {
        if (existing) {
          var i = d.transactions.findIndex(function (t) { return t.id === existing.id; });
          if (i >= 0) d.transactions[i] = Object.assign({}, existing, values);
        } else {
          d.transactions.push(Object.assign({ id: S.uid(), type: kind, createdAt: Date.now() }, values));
        }
        return d;
      });
      editor[1](null);
      if (kind === 'expense') afterExpense(next, values.date, values.category, existing ? 'Changes saved.' : 'Expense saved.');
      else showToast(existing ? 'Changes saved.' : 'Income saved.');
    }
    function deleteTx(tx) {
      update(function (d) {
        d.transactions = d.transactions.filter(function (t) { return t.id !== tx.id; });
        d.jobs.forEach(function (j) { if (j.txId === tx.id) j.txId = null; });
        return d;
      });
      editor[1](null);
      showToast('Deleted.');
    }

    function markPaid(o, v) {
      var next = update(function (d) {
        d.transactions.push({ id: S.uid(), type: 'expense', createdAt: Date.now(), amount: v.amount, category: o.item.category, date: v.date, method: v.method,
          notes: o.item.name + ' · ' + S.monthLabel(o.month) });
        var r = d.recurring.find(function (x) { return x.id === o.item.id; });
        if (r && r.paid.indexOf(o.month) === -1) r.paid.push(o.month);
        return d;
      });
      pay[1](null);
      afterExpense(next, v.date, o.item.category, o.item.name + ' marked paid.');
    }

    function saveJob(v) {
      var next = update(function (d) {
        var txId = S.uid();
        d.transactions.push({ id: txId, type: 'expense', createdAt: Date.now(), amount: v.cost, category: 'Maintenance', date: v.date, method: v.method,
          notes: v.title + ' · ' + v.provider });
        d.jobs.push({ id: S.uid(), title: v.title, provider: v.provider, cost: v.cost, date: v.date, notes: v.notes, txId: txId });
        if (v.repeat) {
          d.recurring.push({ id: S.uid(), name: v.title, category: 'Maintenance', amount: v.cost, dueDay: Number(v.date.slice(8, 10)),
            every: v.every, startMonth: S.addMonths(S.monthKey(v.date), v.every), paid: [], source: 'maintenance' });
        }
        return d;
      });
      afterExpense(next, v.date, 'Maintenance', v.repeat ? 'Job saved and scheduled.' : 'Job saved; cost added to expenses.');
    }
    function deleteJob(j) {
      update(function (d) {
        d.jobs = d.jobs.filter(function (x) { return x.id !== j.id; });
        d.transactions = d.transactions.filter(function (t) { return t.id !== j.txId; });
        return d;
      });
      showToast('Job deleted.');
    }

    function saveBill(v, existing) {
      update(function (d) {
        if (existing) {
          var r = d.recurring.find(function (x) { return x.id === existing.id; });
          Object.assign(r, v);
        } else {
          d.recurring.push(Object.assign({ id: S.uid(), startMonth: firstMonthFor(v.dueDay), paid: [], source: 'bill' }, v));
        }
        return d;
      });
      showToast(existing ? 'Bill updated.' : 'Bill added. You’ll be reminded 3 days before it’s due.');
    }
    function deleteBill(r) {
      update(function (d) { d.recurring = d.recurring.filter(function (x) { return x.id !== r.id; }); return d; });
      showToast('Bill deleted.');
    }

    function finishOnboarding(v) {
      update(function (d) {
        d.settings = Object.assign(d.settings, { onboarded: true, currency: v.currency, theme: v.theme });
        d.budgets.total = Number(v.budget);
        if (v.bills) {
          S.BILL_PRESETS.forEach(function (b, i) {
            var day = b.name === 'Rent' ? 1 : 10 + i * 2;
            d.recurring.push({ id: S.uid(), name: b.name, category: b.category, amount: 0, dueDay: day,
              every: 1, startMonth: firstMonthFor(day), paid: [], source: 'bill' });
          });
        }
        return d;
      });
      previewTheme[1](null);
      location.hash = '#/home';
    }

    if (!db.settings.onboarded) {
      return html`<${Onboarding} onDone=${finishOnboarding} onPreviewTheme=${previewTheme[1]}
        onSample=${function (theme) {
          update(function () { return S.sampleData(S.today(), theme); });
          previewTheme[1](null);
          location.hash = '#/home';
          showToast('Sample data loaded. Clear it in Settings when you’re ready to start.');
        }} />`;
    }

    var screen;
    var common = { db: db, currency: cur };
    if (route === 'transactions') screen = html`<${Transactions} ...${common} onAdd=${function (k) { editor[1]({ kind: k }); }} onOpenTx=${function (t) { editor[1]({ kind: t.type, tx: t }); }} />`;
    else if (route === 'budget') screen = html`<${Budget} ...${common} onSaveBudgets=${function (b) { update(function (d) { d.budgets = b; return d; }); showToast('Budgets saved.'); }} />`;
    else if (route === 'maintenance') screen = html`<${Maintenance} ...${common} onSaveJob=${saveJob} onDeleteJob=${deleteJob} />`;
    else if (route === 'reports') screen = html`<${Reports} ...${common} />`;
    else if (route === 'education') screen = html`<${Education} ...${common} onPay=${pay[1]} onSaveBill=${saveBill}
      onAdd=${function (defaults) { editor[1]({ kind: 'expense', defaults: defaults }); }}
      onOpenTx=${function (t) { editor[1]({ kind: t.type, tx: t }); }} />`;
    else if (route === 'bills') screen = html`<${Bills} ...${common} onPay=${pay[1]} onSaveBill=${saveBill} onDeleteBill=${deleteBill} />`;
    else if (route === 'settings') screen = html`<${Settings} db=${db} toast=${showToast}
      onSettings=${function (s) { update(function (d) { Object.assign(d.settings, s); return d; }); }}
      onRestore=${function (data) { update(function () { return S.normalize(data); }); showToast('Backup restored.'); }}
      onReset=${function () { update(function () { return S.empty(); }); location.hash = '#/home'; }} />`;
    else screen = html`<${Home} ...${common} onPay=${pay[1]} onOpenTx=${function (t) { editor[1]({ kind: t.type, tx: t }); }} />`;

    var active = route === 'bills' ? 'home' : route;
    return html`<div className="app">
      <aside className="sidebar">
        <a className="side-brand" href="#/home"><span className="brand-mark small-mark"><${Icon} name="home" size=${18} /></span>Home Ledger</a>
        <nav aria-label="Main" className="side-nav">
          ${TABS.concat(MORE).map(function (t) {
            return html`<a key=${t.id} href=${'#/' + t.id} className="side-link" aria-current=${route === t.id ? 'page' : undefined}><${Icon} name=${t.icon} />${t.label}</a>`;
          })}
        </nav>
      </aside>
      <div className="content">
        <header className="topbar">
          <h1 className="topbar-title">${TITLES[route]}</h1>
          <a className="icon-btn topbar-only" href="#/education" aria-label="Education" aria-current=${route === 'education' ? 'page' : undefined}><${Icon} name="cap" /></a>
          <a className="icon-btn topbar-only" href="#/bills" aria-label="Bills and reminders"><${Icon} name="bell" /></a>
          <a className="icon-btn topbar-only" href="#/settings" aria-label="Settings"><${Icon} name="sliders" /></a>
        </header>
        <main className="main">${screen}</main>
      </div>
      <nav className="tabbar" aria-label="Main">
        ${TABS.map(function (t) {
          return html`<a key=${t.id} href=${'#/' + t.id} className="tab" aria-current=${active === t.id ? 'page' : undefined}><${Icon} name=${t.icon} size=${22} /><span>${t.id === 'maintenance' ? 'Home care' : t.id === 'transactions' ? 'Activity' : t.label}</span></a>`;
        })}
      </nav>
      ${(route === 'home' || route === 'transactions') && html`<button type="button" className="fab no-print" aria-label="Quick add expense" onClick=${function () { editor[1]({ kind: 'expense' }); }}><${Icon} name="plus" size=${24} /></button>`}
      <${TxEditor} editor=${editor[0]} currency=${cur} onClose=${function () { editor[1](null); }} onSave=${saveTx} onDelete=${deleteTx} />
      ${pay[0] && html`<${PayDialog} key=${pay[0].item.id + pay[0].month} occ=${pay[0]} currency=${cur} onClose=${function () { pay[1](null); }} onPaid=${markPaid} />`}
      <${Toast} toast=${toast[0]} />
    </div>`;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
})();
