---
'@windmorph/react': minor
---

List follows the M3 Expressive spec: selection lists are a `listbox` of `option`s on the web and show a check besides the selected colour (`selectionIndicator={false}` removes it), arrow keys wrap at the ends, items with `childItems` expand and collapse (a tree grid with `expandedKeys` / `onExpandedChange`), icons are 20px, images and videos have 8px corners, the large video thumbnail is 114 × 64px, and the new `ListItemAvatar` is the spec's 40px leading avatar. Breaking: a list with `selectionMode` and no `onAction` now has `listbox` / `option` roles instead of `grid` / `row`, and its items can't hold buttons or links; add `onAction` to keep a grid list.
