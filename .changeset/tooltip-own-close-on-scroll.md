---
'@windmorph/react': patch
---

A menu opened from a trigger with a tooltip (an icon button's built-in tooltip) no longer closes when its page scrolls while the tooltip is shown or leaving. The tooltip's positioning gave React Aria no close of its own, so its close on scroll fell back to the menu's, which shares the trigger; a scroll as the menu opened (a click that first scrolled the trigger into view) closed it at once. The tooltip now closes itself on scroll, and leaves the menu open.
