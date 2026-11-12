---
'@windmorph/react': patch
---

Fixed: `useScrollKeys` and `useScrollRestoration` (`@windmorph/react/primitives`) follow the element behind their ref when it arrives after the first render, is left out on some pages or is replaced, while the component that calls them stays mounted (a frame that lays some pages out without its pane). `useScrollKeys` took the element once, so the scroll keys kept going to an element no longer on the page and the tab stop was watched on it; `useScrollRestoration` didn't note a page shown without the element, so going back from such a page left the pane at its top.
