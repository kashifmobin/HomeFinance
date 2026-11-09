# Card

A bordered `surface` block that groups one item's content; lay several out with `CardGrid`.

- **Parts:** optional `eyebrow` (caption in `ink-muted`), `title` (h3), body (children) and `footer` (one or two Buttons, pinned to the bottom).
- **Flat by default:** a 1px `border` and `radius-lg`, no shadow.
- **Responsive:** padding `space-4` on mobile, `space-6` from 768px. `CardGrid` shows 1 column on mobile, 2 on tablet and `columns` (3 or 4, default 3) from 1024px.
- **You provide:** the content; keep body text to two or three lines.
