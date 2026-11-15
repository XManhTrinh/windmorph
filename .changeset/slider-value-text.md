---
'@windmorph/react': patch
---

Added: `valueText` on `Slider` and `RangeSlider` puts the value in words for screen readers (each thumb's `aria-valuetext`) where a number format can't, such as a time: "1 minute 25 seconds of 10 minutes". The value indicator keeps `formatOptions`.
