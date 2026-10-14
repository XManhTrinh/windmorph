---
'@windmorph/react': patch
---

`ButtonGroup`'s press bump moves only between the rest and bumped widths. In a connected group with `expandedRatio`, every press shrank the buttons to their padding before they sprang up past their width, and after the release they jumped wider before settling. The group now waits for the release to settle before letting go of its sizing (in standard groups too), keeps a content-sized (`w-fit`) group's other buttons where they were, and measures layout widths, so a group under a scaled ancestor no longer shrinks on press.
