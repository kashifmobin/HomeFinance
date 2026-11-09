# Minimal Light

Online version: https://claude.ai/artifact/VVhaxB9FkN43o3Gc6MSE6Y

## Using this folder

| File | What it is |
| --- | --- |
| `tokens.json` | The source of truth: colours, type, spacing, radii, breakpoints. |
| `tokens.css` | The same tokens as CSS variables (`var(--accent)`) and type classes (`.h1`, `.body`). Generated from `tokens.json`. |
| `components/bundle.css` | Styles for the components (loads Inter from Google Fonts). |
| `components/bundle.js` | React components on `window.MinimalLight`: Button, Input, Card, CardGrid, NavBar, Dialog. Needs React 18 loaded first. |
| `components/index.d.ts` | Props for each component. |
| `components/<Name>/README.md` | When and how to use each component. |
| `example.html` | A working page using everything. Open it through a local server and resize the window. |

Components respond to the width of the element with class `ml-screen` (put it on `<body>`). On desktop browsers a visible scrollbar (about 15px) counts against that width, so the tablet layout starts at about a 783px window; on phones and tablets scrollbars float, so it starts at exactly 768px.

Plain HTML/CSS only: link `tokens.css` and use the variables and type classes. With components: also link `components/bundle.css`, load React 18, then `components/bundle.js` — see `example.html`.

---

A quiet, light design system for web, tablet and mobile. Warm off-white grounds, one calm blue accent, a single sans-serif and generous space. Everything is designed mobile first and grows with the screen.

## Principles

- **Less, but clear.** Each screen has one primary action, styled with `accent`. Everything else is `ink`, `ink-muted` or a border.
- **Borders before shadows.** Cards sit on `bg` as `surface` with a 1px `border`. Only floating things (menus, dialogs, bottom sheets) use `shadow-float`.
- **Space does the grouping.** Use the spacing scale, not lines, to separate content. Related items: `space-2`. Blocks: `space-4` / `space-6`. Sections: `space-10` on mobile, `space-16` from tablet.
- **One colour means one thing.** `accent` is action and selection. `success` and `danger` are states only, never decoration.

## Content fundamentals

- Write in plain, short sentences. Sentence case for every title, button and label ("Save changes", not "Save Changes").
- Buttons say what happens: "Create project", "Delete file". Avoid "OK" and "Submit".
- Keep body lines to about 65 characters on desktop (`max-width: 65ch`).
- No emoji in UI text.

## Colour

| Token | Use |
| --- | --- |
| `bg` | Page background |
| `surface` | Cards, inputs, nav bars |
| `surface-sunken` | Table headers, code, sidebars |
| `border` | Hairlines and card outlines |
| `border-control` | Input and checkbox edges |
| `ink` / `ink-muted` | Primary / secondary text |
| `accent` / `on-accent` | Primary button and its text, links, focus |
| `accent-soft` | Selected rows, tags, info notes |
| `success` / `danger` | States only |

All text pairs meet 4.5:1. Focus rings are a 2px `accent` outline with a 2px offset.

## Typography

One family, **Inter** (loaded from Google Fonts, falls back to the system sans). Weights 400, 500 and 600 only.

- Headings: `display` 40/44, `h1` 32/38, `h2` 24/30, `h3` 18/26 — all 600.
- Text: `body` 16/24, `small` 14/20, `label` 14/20 (500), `caption` 12/16 (500).
- On mobile, page titles use `h1` instead of `display`. Body stays 16px on every screen.

## Responsive layout

Mobile first: write base styles for phones, then add `min-width` queries.

| Screen | Width | Columns | Gutter | Section gap |
| --- | --- | --- | --- | --- |
| Mobile | 0 – 767px | 4 | `gutter-mobile` 16px | `space-10` |
| Tablet | 768 – 1023px (`bp-tablet`) | 8 | `gutter-tablet` 24px | `space-16` |
| Desktop | 1024px+ (`bp-desktop`) | 12 | `gutter-desktop` 32px | `space-16` |

```css
.container { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--gutter-mobile); }
@media (min-width: 768px)  { .container { padding: 0 var(--gutter-tablet); } }
@media (min-width: 1024px) { .container { padding: 0 var(--gutter-desktop); } }
```

Patterns by screen size:

- **Navigation:** mobile uses a top bar with a menu button or a bottom tab bar (max 5 items); tablet and desktop show the links inline or a left sidebar on `surface-sunken`.
- **Cards:** one per row on mobile, two on tablet, three or four on desktop. Card padding `space-4` on mobile, `space-6` from tablet.
- **Dialogs:** a bottom sheet (`radius-lg` on the top corners) on mobile; a centred dialog, max 560px wide, from tablet.
- **Tables:** on mobile, stack each row as a card; from tablet, a regular table.
- **Touch targets:** at least 44 × 44px on every screen size.

## Components

Button, Input, Card (with CardGrid), NavBar and Dialog, written in React and available as `window.MinimalLight`.

They adapt to the width of the nearest element with the `ml-screen` class, at 768px and 1024px. Put it on `<body>` or your app root, and use `ml-container` for page padding:

```html
<body class="ml-screen">
  <div class="ml-container">…</div>
</body>
```

Without an `ml-screen` ancestor, components keep their mobile layout.

## Shape

- `radius-sm` 4px: checkboxes, tags. `radius-md` 8px: buttons, inputs. `radius-lg` 16px: cards, sheets, dialogs.
- Buttons and inputs are 44px tall on mobile and tablet, 40px allowed on desktop.

## Iconography

No icon set is bundled yet. Use a simple outline set with a 1.5px stroke at 20px (24px on mobile), coloured `ink` or `ink-muted`, `accent` when active. There is no logo; the name is set in Inter 600.
