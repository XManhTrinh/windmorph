---
'@windmorph/react': patch
---

48px touch targets without changing how anything looks: an xs or sm `Slider` takes presses 2px past its 44px height on each side; the `TimePicker`'s AM and PM options take 48px-tall presses, reaching away from each other (the options now round their own outer corners instead of the selector clipping them); and a small `Carousel` item narrower than 48px takes 48px of presses, grown into the spacing beside it and never onto a neighbour. A masked carousel's slots no longer take presses outside their visible item, so a press between items reaches no item.
