---
'@windmorph/react': minor
---

A selected `InputChip` without `onPress` tells assistive tech it's selected: its remove button is described by "Selected", and a static chip carries the word as hidden text. New `labels.selected` (default "Selected") on the chips' `ChipLabels`. With `onPress`, the chip's action keeps `aria-pressed`.
