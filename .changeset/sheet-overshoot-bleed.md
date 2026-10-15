---
'@windmorph/react': patch
---

Bottom sheets and docked modal side sheets no longer show a sliver of the page under their anchored edge when the opening spring overshoots: the panel carries a bleed in its own colour past that edge, clipped by its container at rest (Compose scales the sheet up for the same reason).
