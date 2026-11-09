/* Home Ledger — small SVG charts: a category donut and grouped bars, each with a hover layer. */
(function () {
  var useState = React.useState, useRef = React.useRef, useEffect = React.useEffect;
  var html = htm.bind(React.createElement);
  var S = window.HL.store;

  // Colour follows the category, never its rank. Slot order is the validated categorical order; Other is grey.
  var SLOT = { 'Groceries': 1, 'Food & dining': 2, 'Utilities': 3, 'Rent': 4, 'Transport': 5, 'Maintenance': 6, 'Health': 7, 'Education': 8 };
  function categoryColor(cat) { return SLOT[cat] ? 'var(--series-' + SLOT[cat] + ')' : 'var(--series-other)'; }

  function useWidth() {
    var ref = useRef(null);
    var state = useState(0);
    React.useLayoutEffect(function () {
      if (!ref.current) return;
      // Measure now; the observer only keeps it current (its first callback can be delayed in background tabs).
      state[1](Math.floor(ref.current.getBoundingClientRect().width));
      var ro = new ResizeObserver(function (entries) { state[1](Math.floor(entries[0].contentRect.width)); });
      ro.observe(ref.current);
      return function () { ro.disconnect(); };
    }, []);
    return [ref, state[0]];
  }

  function arc(cx, cy, r, a0, a1) {
    var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return { x0: x0, y0: y0, x1: x1, y1: y1, large: a1 - a0 > Math.PI ? 1 : 0 };
  }
  function segmentPath(cx, cy, ro, ri, a0, a1) {
    if (a1 - a0 >= Math.PI * 2 - 1e-6) a1 = a0 + Math.PI * 2 - 1e-4;
    var o = arc(cx, cy, ro, a0, a1), i = arc(cx, cy, ri, a0, a1);
    return 'M' + o.x0 + ' ' + o.y0 + 'A' + ro + ' ' + ro + ' 0 ' + o.large + ' 1 ' + o.x1 + ' ' + o.y1 +
      'L' + i.x1 + ' ' + i.y1 + 'A' + ri + ' ' + ri + ' 0 ' + i.large + ' 0 ' + i.x0 + ' ' + i.y0 + 'Z';
  }

  // data: [{ label, value }] in fixed category order.
  function Donut(props) {
    var data = props.data.filter(function (d) { return d.value > 0; });
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    var hover = useState(-1), hi = hover[0], setHi = hover[1];
    var size = 208, c = size / 2, ro = 100, ri = 66;
    var a = -Math.PI / 2;
    var segs = data.map(function (d) {
      var a0 = a, a1 = a + (d.value / total) * Math.PI * 2;
      a = a1;
      return Object.assign({ a0: a0, a1: a1 }, d);
    });
    var active = hi >= 0 ? segs[hi] : null;
    if (!total) return html`<p className="empty">No expenses in this period.</p>`;
    return html`
      <div className="donut-wrap">
        <div className="donut">
          <svg width=${size} height=${size} viewBox=${'0 0 ' + size + ' ' + size} role="img" aria-label="Expenses by category">
            ${segs.map(function (s, i) {
              return html`<path key=${s.label} d=${segmentPath(c, c, ro, ri, s.a0, s.a1)}
                fill=${categoryColor(s.label)} stroke="var(--surface)" strokeWidth="2"
                opacity=${hi >= 0 && hi !== i ? 0.45 : 1} tabIndex="0"
                aria-label=${s.label + ': ' + S.money(s.value, props.currency)}
                onMouseEnter=${function () { setHi(i); }} onMouseLeave=${function () { setHi(-1); }}
                onFocus=${function () { setHi(i); }} onBlur=${function () { setHi(-1); }} />`;
            })}
          </svg>
          <div className="donut-center" aria-hidden="true">
            <span className="caption muted">${active ? active.label : 'Total spent'}</span>
            <strong>${S.money(active ? active.value : total, props.currency)}</strong>
            ${active && html`<span className="caption muted">${Math.round(active.value / total * 100)}%</span>`}
          </div>
        </div>
        <ul className="legend">
          ${segs.map(function (s, i) {
            return html`<li key=${s.label} className=${hi === i ? 'is-active' : ''}
              onMouseEnter=${function () { setHi(i); }} onMouseLeave=${function () { setHi(-1); }}>
              <span className="swatch" style=${{ background: categoryColor(s.label) }}></span>
              <span className="legend-label">${s.label}</span>
              <span className="legend-value">${S.money(s.value, props.currency)}</span>
              <span className="legend-pct">${Math.round(s.value / total * 100)}%</span>
            </li>`;
          })}
        </ul>
      </div>`;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / p;
    // Steps that divide into four round ticks.
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 3 ? 3 : n <= 4 ? 4 : n <= 6 ? 6 : n <= 8 ? 8 : 10) * p;
  }
  function barPath(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, w / 2, h);
    return 'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y +
      'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h) + 'Z';
  }

  // groups: [{ label, values: { key: number } }], series: [{ key, label, color }]
  function BarChart(props) {
    var wr = useWidth(), ref = wr[0], width = wr[1];
    var hover = useState(-1), hi = hover[0], setHi = hover[1];
    var height = 240, m = { l: 44, r: 8, t: 12, b: 28 };
    var groups = props.groups, series = props.series;
    var max = niceMax(Math.max.apply(null, [0].concat(groups.map(function (g) {
      return Math.max.apply(null, series.map(function (s) { return g.values[s.key] || 0; }));
    }))));
    var pw = Math.max(0, width - m.l - m.r), ph = height - m.t - m.b;
    var gw = groups.length ? pw / groups.length : 0;
    var bw = Math.max(4, Math.min(28, (gw * 0.7 - (series.length - 1) * 2) / series.length));
    var y = function (v) { return m.t + ph - (v / max) * ph; };
    var ticks = [0, 0.25, 0.5, 0.75, 1].map(function (t) { return t * max; });
    var labelEvery = gw < 34 ? 2 : 1;
    var g = hi >= 0 ? groups[hi] : null;
    return html`
      <div className="bars" ref=${ref}>
        ${width > 0 && html`
          <svg width=${width} height=${height} role="img" aria-label=${props.label}>
            ${ticks.map(function (t) {
              return html`<g key=${t}>
                <line x1=${m.l} x2=${width - m.r} y1=${y(t)} y2=${y(t)} stroke=${t === 0 ? 'var(--chart-axis)' : 'var(--chart-grid)'} strokeWidth="1" />
                <text x=${m.l - 8} y=${y(t) + 4} textAnchor="end" className="tick">${S.compact(t)}</text>
              </g>`;
            })}
            ${groups.map(function (grp, gi) {
              var x0 = m.l + gi * gw + (gw - (bw * series.length + 2 * (series.length - 1))) / 2;
              return html`<g key=${grp.label + gi}>
                ${hi === gi && html`<rect x=${m.l + gi * gw} y=${m.t} width=${gw} height=${ph} fill="var(--chart-hover)" />`}
                ${series.map(function (s, si) {
                  var v = grp.values[s.key] || 0;
                  return html`<path key=${s.key} d=${barPath(x0 + si * (bw + 2), y(v), bw, m.t + ph - y(v), 4)} fill=${s.color} />`;
                })}
                ${gi % labelEvery === 0 && html`<text x=${m.l + gi * gw + gw / 2} y=${height - 8} textAnchor="middle" className="tick">${grp.label}</text>`}
                <rect x=${m.l + gi * gw} y=${m.t} width=${gw} height=${ph + m.b} fill="transparent"
                  onMouseEnter=${function () { setHi(gi); }} onMouseLeave=${function () { setHi(-1); }}
                  onClick=${function () { setHi(hi === gi ? -1 : gi); }} />
              </g>`;
            })}
          </svg>`}
        ${g && html`
          <div className="tooltip" style=${{ left: Math.min(Math.max(m.l + hi * gw + gw / 2, 90), width - 90) + 'px' }}>
            <strong>${g.title || g.label}</strong>
            ${series.map(function (s) {
              return html`<div key=${s.key} className="tooltip-row"><span className="swatch" style=${{ background: s.color }}></span>${s.label}<b>${S.money(g.values[s.key] || 0, props.currency)}</b></div>`;
            })}
            ${props.extra && props.extra(g)}
          </div>`}
      </div>`;
  }

  window.HL.charts = { Donut: Donut, BarChart: BarChart, categoryColor: categoryColor };
})();
