# Notes from an app, for 0.2.9: four additions

Status: **approved** (2026-11-15; Carousel links as `itemHref`, `itemTarget` and `itemRel`). Four suggestions an app made while using 0.2.6, to go into 0.2.9 as additions (patch changesets; nothing changes for an app that doesn't use them). The two bugs from the same notes (overlays in full screen, Option alone showing a ring) are fixed separately.

## 1. Selection controls: the control after its label

**Asked:** a settings row has its words at the start and the switch at the end, the whole row being the label (M3's list item with a trailing switch). Today `Switch`, `Checkbox` and `Radio` always draw the control first; the app reverses the row with `flex-row-reverse` and removes the label's start spacing through `classNames.label`.

**Proposed:** `controlPlacement: 'start' | 'end'` on `Switch`, `Checkbox` and `Radio` (and on `RadioGroup` for all its options), default `start` (today's look).

- **The name:** the library already says `controlPlacement="start" | "end"` for the same idea on `ListItem` (where a switch, checkbox or radio sits beside the text), and `*Placement` for every "where a part goes" prop (`iconPlacement`, `fabPlacement`). The other common name, `labelPlacement` (the label's side, the opposite word), would be a second name for one idea.
- **Layout:** `end` puts the control after the label, mirrors the label's spacing (the 8px or 12px moves to its end), and lets the label grow (`flex-1`), so a full-width row puts the control at the row's end. Logical sides, so right to left mirrors it. The control keeps its 48px target; the whole row stays the `<label>`, so a press anywhere toggles it.
- **When not to use it:** inside a `List`, use a switch list item (`controlPlacement` there already does this, with list semantics).
- **Checks:** unit tests (order, spacing, press on the label's far end), the radio group passing it down, a story row per control in both placements and right to left, screenshots, the density and layout-safety specs.

## 2. ThemeScope as a span

**Asked:** a scope can't sit inside a link's or button's inline content (a dark badge over a picture in a card that is a link) without putting a `div` inside phrasing content.

**Proposed:** `as: 'div' | 'span'`, default `div`, as `ExpandableText`'s `as` and the library's other element choices. A `span` scope keeps every feature (theme attributes, scoped classes and variables, overlays re-applying it); it is inline where the `div` is a block, and the app styles its box as before.

- **Checks:** unit tests (the element, its attributes, an overlay inside still themed), the theme-scope spec over the span form, the docs page.

## 3. Slider: its value in words

**Asked (one part of "a media scrubber"):** the value is described only through `formatOptions` (a number format), so a time can't be read as words through `aria-valuetext` ("1 minute 23 seconds of 10 minutes").

**Proposed:** `valueText?: (value: number) => string` on `Slider` (and `RangeSlider`, per thumb), used for the thumb's `aria-valuetext` and the value indicator. It wins over `formatOptions`, which stays for numbers. Named after the attribute it sets; React Aria's thumbs take `aria-valuetext` through the slider state's value label, so no private API is needed (to verify while building).

- **Not in the core:** a 4px track, a loaded part and a bubble over the pointer are outside M3's slider sizes (16px is the thinnest track); they go into Windmorph Pro's media scrubber (its own plan), which builds on this.
- **Checks:** unit tests (the attribute while dragging and by keyboard, the indicator's text, the range's two thumbs), axe.

## 4. Carousel: slides that are links, and which slide is large

**Asked:** (a) a slide can't be a link: `onAction(index)` makes each slide a button, so a carousel that navigates does so by script, with no open in a new tab and no link for search engines or assistive technology; (b) nothing tells an app which slide is large, which words laid over a slide need (a small slide is a strip of its middle, where a few letters of its words show).

**Proposed:**

- **(a) `itemHref: (index: number) => string | undefined`**, and `itemTarget` / `itemRel` alongside: a slide with an address is a real link (React Aria `useLink`, the `RouterProvider` for client routing, middle click and the context menu as any link), with the slide's press area (and its 48px target on a small item) as the link. `onAction` stays for slides that act. Three props, as approved (2026-11-15).
- **(b) Each slide's size, as state:** `data-size="large" | "medium" | "small"` on each slide, from the keyline it is nearest, and the CSS variable `--m3-carousel-item-openness` (0 at its smallest, 1 at its largest) for words that fade as a slide shrinks, as Compose hands a carousel item's content its size; plus `onFocalChange(index)`, called when another slide takes the focal (largest) place after scrolling settles.
- **Checks:** unit tests (links, the router, the data attribute and variable at rest and after a scroll), browser tests (middle click opens a tab; the attribute and variable follow a scroll frame by frame), the docs page and the playground.
