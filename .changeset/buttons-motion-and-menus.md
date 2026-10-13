---
'@windmorph/react': minor
---

Under reduced motion, press and selection morphs snap (every component using `container-motion`) and the split button's chevron turns without animating. An icon button's built-in tooltip no longer describes the button it already names, so screen readers announce the name once. The split button opens its menu on release with a mouse, so its pressed shape shows, and its menu lines up with the trailing button at the window's edge through the new `Menu` `containerPadding` prop (default 12).
