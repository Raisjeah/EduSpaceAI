## 2025-05-15 - [Reviving Unused UX States]
**Learning:** The codebase contained an implemented but unused `isFooterScrolled` state in `ChatView.jsx`, indicating an intended "Scroll to Bottom" feature that was never fully wired to a UI component. Discovering these "ghost" states is a great way to find low-hanging UX improvements that align with original design intent.
**Action:** Always check for defined but unreferenced state variables related to UI feedback (scroll, focus, hover) to identify missing micro-interactions.
