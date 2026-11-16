---
'@windmorph/react': patch
---

Fixed: a touch on a `Slider` reads the slider as it is now rather than as it was when the finger went down, so a range that changes during a drag maps the finger to the new one, and a tap still waiting to tell itself from a drag is dropped once the slider is disabled, so it never sets a value the slider no longer takes.
