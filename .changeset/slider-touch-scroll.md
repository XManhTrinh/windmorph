---
'@windmorph/react': patch
---

On touch screens, a swipe across a `Slider` or `RangeSlider` scrolls the page instead of changing the value, as Compose's slider does: a touch on the track sets the value when it lifts (a tap) or once it moves 8px along the track (a drag), and a vertical swipe on a horizontal slider (or a sideways one on a vertical slider) is left to the browser. Mouse presses still set the value at once.
