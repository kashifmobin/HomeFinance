# Input

A labelled single-line text field with an optional hint or error message under it.

- **Always give a `label`.** Placeholders are examples, not labels.
- **Text is 16px on every screen** so iOS doesn't zoom in when the field gets focus.
- **Responsive:** 44px tall on mobile and tablet, 40px from 1024px. The field fills its container; limit forms to about 400px wide on desktop.
- **Errors:** pass `error` with what to do next ("Use at least 8 characters."). It replaces the hint, turns the border and text `danger`, and sets `aria-invalid`.
- **You provide:** `type`, `name`, `value`/`onChange` (or `defaultValue`), and the validation.
