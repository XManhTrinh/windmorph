---
'@windmorph/react': patch
---

Fixed: `ThemeProvider` stores only the person's own selection. A dimension the app controls (a `mode` passed while the page is open) is no longer written to the cookie or localStorage; the value stored for it stays, so the person's choice comes back when the app stops passing it. `serializeThemeState` takes a partial state and leaves out the dimensions not given.
