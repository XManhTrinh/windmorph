---
'@windmorph/react': patch
---

Fixed: closing a dialog, sheet, menu or other overlay gives focus back to where it was without passing through the page. Focus was on `<body>` for one frame first, which a screen reader can announce as the page.
