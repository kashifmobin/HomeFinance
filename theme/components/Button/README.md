# Button

Starts an action; use one `primary` button per screen and `secondary` or `ghost` for everything else.

- **Variants:** `primary` (`accent` fill, `on-accent` text), `secondary` (`surface` with a `border-control` edge), `ghost` (`accent` text, `accent-soft` on hover), `danger` (`danger` fill) for destructive actions only.
- **Responsive:** 44px tall on mobile and tablet, 40px from 1024px. `block="mobile"` makes it full width below 768px — use it for the main action at the bottom of a mobile form.
- **Label:** a verb in sentence case ("Save changes"). Pass `href` to render a link that looks like a button.
- **You provide:** the label, `onClick` or `href`, and `disabled` while an action is running.
