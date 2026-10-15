---
'@windmorph/react': patch
---

A `Button` narrower than its content and padding keeps its content centred. A button group's compressed neighbour now gives up its padding equally on both sides during the press bump, instead of its label spilling past its trailing edge into the next button; the same holds for a connected group sized by its content.
