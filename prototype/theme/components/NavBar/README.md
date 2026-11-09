# NavBar

The top bar of every page: brand on the left, up to five links and one action.

- **Mobile (below 768px):** 56px tall; brand plus a 44px menu button. The menu opens a panel under the bar with 48px link rows and the action as a full-width button.
- **Tablet and desktop:** 64px tall; links inline next to the brand, the action on the right, no menu button. Side padding follows the gutters.
- **Active link:** set `active: true` on the current page's link; it shows in `accent` on `accent-soft` and gets `aria-current="page"`.
- **You provide:** `brand`, `links` (`label`, `href`, `active`) and an optional `action`. Keep labels to one word where you can.
