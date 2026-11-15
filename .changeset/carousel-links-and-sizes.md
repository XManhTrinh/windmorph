---
'@windmorph/react': patch
---

Added: a `Carousel`'s items can be links (`itemHref`, with `itemTarget` and `itemRel`): real links a `RouterProvider` routes, that a modifier or the context menu opens in a new tab, named by their content, with `classNames.link`. Each item now says its size, `data-size` (`large`, `medium` or `small`) and `--m3-carousel-item-openness` (0 to 1), so words over an item can fade as it shrinks to a strip, and `onFocalChange` names the item in the large place once scrolling settles (multi-browse and hero).
