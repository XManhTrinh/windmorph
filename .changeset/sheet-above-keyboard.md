---
'@windmorph/react': patch
---

Bottom sheets stay above an on-screen keyboard: phone browsers lay the keyboard over the page without resizing it, so a sheet fixed to the window's bottom sat behind it. The sheet now follows the visible part of the window (the visual viewport), rising as the keyboard opens and capping its height to what's left. A searchable `Select`'s sheet takes that full height, so filtering changes the list inside and never resizes the sheet.
