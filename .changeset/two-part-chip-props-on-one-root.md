---
'@windmorph/react': patch
---

Fixed: a chip made of two buttons puts its props where a chip with one button does. A `FilterChip` with `onRemove` sent `ref`, `id`, `data-*`, `title` and every `aria-*` attribute to its toggle while `className` and `style` went to its container, so they changed element when `onRemove` was added, and an app's `data-tokens` was not added to the chip's own. They now go on the container, which is the chip's root: `ref` reaches it (a `div` there, so the prop's type is `Ref<HTMLElement>`; the toggle is its first button), while the attributes that name or describe a control (`aria-label`, `aria-describedby`, `aria-expanded`, `aria-controls` …) and the event handlers stay on the toggle. An `InputChip` with `onPress` puts those naming and describing attributes on its action's button instead of its container, which has no role, so they did nothing there.
