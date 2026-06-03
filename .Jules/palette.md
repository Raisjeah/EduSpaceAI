## 2025-05-15 - [Accessibility & Navigation Polish]
**Learning:** Icon-only buttons often lack focus-visible rings and aria-labels, making them inaccessible to keyboard and screen reader users. Adding a "Scroll to Bottom" button significantly improves the experience in long chat threads.
**Action:** Always include `focus-visible:ring-2` and `aria-label` for interactive icons. Implement scroll-to-bottom logic for chat interfaces to enhance navigation.
