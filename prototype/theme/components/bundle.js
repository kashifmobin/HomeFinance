/* @ds-bundle: {"format":4,"namespace":"MinimalLight","components":[{"name":"Button"},{"name":"Input"},{"name":"Card"},{"name":"NavBar"},{"name":"Dialog"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }

  function Icon(props) {
    return h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', 'aria-hidden': true }, props.d.map(function (d, i) {
      return h('path', { key: i, d: d });
    }));
  }
  var MENU = ['M3 6h14', 'M3 10h14', 'M3 14h14'];
  var CLOSE = ['M5 5l10 10', 'M15 5L5 15'];

  // Button — primary | secondary | ghost | danger. block: true (always full width) or "mobile" (full width below 768px).
  function Button({ variant = 'primary', block = false, type = 'button', className, children, ...rest }) {
    var cls = cx('ml-btn', 'ml-btn-' + variant, block === true && 'ml-btn-block', block === 'mobile' && 'ml-btn-block-mobile', className);
    if (rest.href) return h('a', { ...rest, className: cls }, children);
    return h('button', { ...rest, type: type, className: cls }, children);
  }

  // Input — a labelled text field with optional hint or error.
  function Input({ label, hint, error, id, className, ...rest }) {
    var autoId = React.useId();
    var fieldId = id || autoId;
    var hintId = fieldId + '-hint';
    var message = error || hint;
    return h('div', { className: cx('ml-field', error && 'ml-field-error', className) },
      label && h('label', { className: 'ml-label', htmlFor: fieldId }, label),
      h('input', { type: 'text', ...rest, id: fieldId, className: 'ml-input', 'aria-invalid': error ? true : undefined, 'aria-describedby': message ? hintId : undefined }),
      message && h('p', { id: hintId, className: 'ml-hint' }, message));
  }

  // Card — a bordered surface with optional eyebrow, title and footer actions.
  function Card({ eyebrow, title, footer, className, children, ...rest }) {
    return h('article', { ...rest, className: cx('ml-card', className) },
      eyebrow && h('p', { className: 'ml-card-eyebrow' }, eyebrow),
      title && h('h3', { className: 'ml-card-title' }, title),
      children && h('div', { className: 'ml-card-body' }, children),
      footer && h('div', { className: 'ml-card-footer' }, footer));
  }

  // CardGrid — 1 column on mobile, 2 on tablet, `columns` (3 or 4) on desktop.
  function CardGrid({ columns = 3, className, children, ...rest }) {
    return h('div', { ...rest, className: cx('ml-card-grid', 'ml-card-grid-' + columns, className) }, children);
  }

  // NavBar — top bar. Mobile: brand + menu button with a drop-down panel. Tablet and up: inline links.
  function NavBar({ brand, brandHref = '#', links = [], action, defaultOpen = false, className }) {
    var state = React.useState(defaultOpen);
    var open = state[0], setOpen = state[1];
    var panelId = React.useId();
    function renderLinks(extra) {
      return links.map(function (link, i) {
        return h('a', { key: i, href: link.href || '#', className: cx('ml-nav-link', extra), 'aria-current': link.active ? 'page' : undefined, onClick: function () { setOpen(false); } }, link.label);
      });
    }
    return h('header', { className: cx('ml-nav', className) },
      h('div', { className: 'ml-nav-bar' },
        h('a', { className: 'ml-nav-brand', href: brandHref }, brand),
        h('nav', { className: 'ml-nav-links', 'aria-label': 'Main' }, renderLinks()),
        action && h('div', { className: 'ml-nav-action' }, action),
        h('button', { type: 'button', className: 'ml-nav-toggle', 'aria-expanded': open, 'aria-controls': panelId, 'aria-label': open ? 'Close menu' : 'Open menu', onClick: function () { setOpen(!open); } }, h(Icon, { d: open ? CLOSE : MENU }))),
      open && h('div', { className: 'ml-nav-panel', id: panelId },
        h('nav', { 'aria-label': 'Main' }, renderLinks('ml-nav-panel-link')),
        action && h('div', { className: 'ml-nav-panel-action' }, action)));
  }

  // Dialog — a bottom sheet on mobile, a centred dialog (max 560px) from tablet. Closes on Escape and scrim click.
  function Dialog({ open, onClose, title, actions, className, children }) {
    var panelRef = React.useRef(null);
    var titleId = React.useId();
    React.useEffect(function () {
      if (!open) return;
      if (panelRef.current) panelRef.current.focus();
      function onKey(e) { if (e.key === 'Escape' && onClose) onClose(); }
      document.addEventListener('keydown', onKey);
      return function () { document.removeEventListener('keydown', onKey); };
    }, [open, onClose]);
    if (!open) return null;
    return h('div', { className: 'ml-dialog-scrim', onMouseDown: function (e) { if (e.target === e.currentTarget && onClose) onClose(); } },
      h('div', { ref: panelRef, className: cx('ml-dialog', className), role: 'dialog', 'aria-modal': true, 'aria-labelledby': title ? titleId : undefined, tabIndex: -1 },
        h('div', { className: 'ml-dialog-handle', 'aria-hidden': true }),
        h('div', { className: 'ml-dialog-head' },
          title && h('h2', { id: titleId, className: 'ml-dialog-title' }, title),
          onClose && h('button', { type: 'button', className: 'ml-dialog-close', 'aria-label': 'Close', onClick: onClose }, h(Icon, { d: CLOSE }))),
        children && h('div', { className: 'ml-dialog-body' }, children),
        actions && h('div', { className: 'ml-dialog-actions' }, actions)));
  }

  window.MinimalLight = Object.assign(window.MinimalLight || {}, { Button: Button, Input: Input, Card: Card, CardGrid: CardGrid, NavBar: NavBar, Dialog: Dialog });
})();
