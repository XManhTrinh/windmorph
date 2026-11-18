---
'@windmorph/react': patch
---

Changed: Needs `motion` 14.12 or later (the peer range is now `^14.12.0`): the motion primitives rely on its `useTransform` catching up with a value set as it subscribes again.
