---
'@windmorph/react': minor
---

Search and app bars: follow the M3 Expressive spec. The full-screen view uses the contained style (`surface-container-low` view, filled field); the docked bar widens by 12px on each side when focused; the docked view is 240px to 2/3 of the window tall; the trailing slot holds two icon buttons or an avatar; new `textAlign` and `resultsAnnouncement` props; focus moves to the results after a search. In a search app bar the field is `surface-container` and fills the free space up to 312px, then half of it. Medium and large `enter-always` app bars stay small on scroll up until back at the top, and long expanded titles wrap to two lines at most.
