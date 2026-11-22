---
'@windmorph/react': patch
---

Fixed: the `dark:` variant follows the nearest part with a mode. Inside a light `ThemeScope` on a dark page (or a `system` page on a dark device) it no longer applies, and inside a dark scope within that light one it applies again, for scopes nested up to three deep. Its specificity is still a class's.
