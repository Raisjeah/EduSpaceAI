
## 2025-05-15 - [Dynamic A11y Labels & Scroll-to-Bottom Delight]
**Learning:** For interactive icon-only buttons like "Copy", a static ARIA label is insufficient when the UI provides visual feedback for state changes (e.g., "Copied!"). Screen readers should receive the same feedback through dynamic `aria-label` updates. Additionally, chat interfaces significantly benefit from a "Scroll to Bottom" micro-interaction that leverages existing scroll state logic (`isFooterScrolled`) to reduce friction.
**Action:** Always check if visual state changes (like "Success" or "Error" indicators) are reflected in ARIA attributes for screen reader users. Reuse existing scroll/header-scroll states to implement contextual floating buttons.
