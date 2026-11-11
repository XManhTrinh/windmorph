---
'@windmorph/react': patch
---

Fixed: Content in a `NavigationRail`'s `header` keeps its own size. An image avatar, or any box showing an image at its full size, grew to the image's natural width (a 512px logo covered the whole rail), since the header gave every child `min-width: max-content`. An extended FAB, or an app's name, there still keeps its full width on one line.
