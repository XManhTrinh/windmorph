---
'@windmorph/react': patch
---

`SearchBar`'s expanded views grow out of the bar and shrink back onto it without a jump: the docked field now animates its position and height from the collapsed bar's bounds (a resized 48px bar too) to the 56px focused field and back, instead of appearing 56px tall at once and snapping to the bar when removed; closing never shrinks it past the bar (it undershot by about 2px and sprang back) and ends exactly on it, on the default spatial spring as in Compose. The full-screen view's field grows from the bar's height too, and its surface no longer closes past the bar. The docked results area's height animates on the default spatial spring as the results change, instead of jumping; under reduced motion it changes at once, as before. The docked dropdown wraps its content in one extra `div`.
