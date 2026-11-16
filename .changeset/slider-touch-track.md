---
'@windmorph/react': patch
---

Added: `useSliderTouchTrack` in `@windmorph/react/primitives`, the Slider's touch handling for a slider of your own built on React Aria's `useSlider`: a tap sets the value as the finger lifts, a drag starts after 8px along the track, and a swipe across it scrolls the page. Beside it, `sliderThumbInputProps` makes React Aria's thumb input props right for assistive technology (named by a visible label, no empty descriptions, a screen reader's change committed) and `sliderArrowRaises` tells which arrow keys raise the value, mirrored right to left.
