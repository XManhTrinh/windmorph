---
'@windmorph/react': patch
---

Fixed: a `Slider` or `RangeSlider` moved by a screen reader (VoiceOver's swipe up or down) calls `onChangeEnd`, as a key does. Before, only `onChange` came, so an app that commits on `onChangeEnd` never saw the change.
