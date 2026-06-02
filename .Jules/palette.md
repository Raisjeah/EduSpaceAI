## 2025-05-15 - [Accessibility for Icon-Only Buttons]
**Learning:** This application relies heavily on minimalist, icon-only buttons (Like, Dislike, Copy, Send, Sidebar Toggle) which provide good visual UX but are completely inaccessible to screen readers without ARIA labels.
**Action:** When adding or modifying interactive elements with icons and no visible text labels, always include a descriptive `aria-label` in Indonesian to match the application's locale.
