---
'@windmorph/react': patch
---

Fixed: A `Slider` or `RangeSlider` named with `aria-labelledby` names each thumb by that label, as it names the slider. Its thumb used to be read as its value ("0%"), or a range's thumbs by each other's names, so a screen reader never said the label and `getByRole('slider', { name })` couldn't find it.
