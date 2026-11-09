---
'@windmorph/react': patch
---

Fixed: changing the theme, mode or contrast through `ThemeProvider` updates every control at once, where buttons and other controls used to fade behind the page.
