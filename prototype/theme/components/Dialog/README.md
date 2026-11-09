# Dialog

Asks for a decision or a short task on top of the page: a bottom sheet on mobile, a centred dialog from 768px.

- **Mobile:** slides up from the bottom, full width, top corners `radius-lg`, with a small handle. Actions stack full width with the main action on top.
- **Tablet and desktop:** centred, up to 560px wide, all corners `radius-lg`, actions in a row on the right.
- **Behaviour:** `scrim` behind it; closes on Escape, a scrim click and the close button (all call `onClose`). Focus moves into the dialog when it opens.
- **Actions:** pass them least important first — `[Cancel, Delete]`. Use `danger` only for destructive confirmation.
- **You provide:** `open`, `onClose`, a `title` phrased as a question or task, and short body text.
