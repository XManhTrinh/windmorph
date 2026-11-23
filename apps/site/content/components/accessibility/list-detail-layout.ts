import type { ComponentAccessibility } from './types';

export const listDetailLayout: ComponentAccessibility = {
  keyboard: {
    none: 'The layout adds no keys of its own: Tab moves through the panes in order, and the list, the back control and the content keep their own keys.',
  },
  screenReader: {
    role: 'Two landmarks: the list pane is a `navigation` region (`nav`), or a `region` (`section`) with `listAs="section"`; the detail pane is a `region` (`section`).',
    name: 'The list pane is named by `listLabel` ("Settings"), the detail pane by `detailLabel` (the open item\'s title).',
    states:
      "None. Below 840px of the layout’s own width (its wrapper’s, not the window’s) the hidden pane is `display: none`, so it is out of the accessibility tree; while it fades out it is already `inert`, so neither Tab, a screen reader's cursor nor a press reaches it.",
    notes: [
      "With `pageHeading`, the page's heading is said again first in the detail pane while only the detail shows (below 840px of the layout's own width), visually hidden, so the page keeps its heading (at `pageHeadingLevel`, 1 by default) while the list's own heading is gone. From 840px it is `display: none`, so it is never read twice.",
    ],
  },
  focus: [
    'Below 840px of the layout’s own width, when `detailKey` changes, focus moves to the pane now showing (unless focus is already inside it), without scrolling the page, so keyboard and screen reader users land on the new content. Both panes take focus this way only (`tabIndex={-1}`), never by Tab.',
    "A pane focused this way from the keyboard shows M3's focus indicator inside its edge.",
    'From 840px of its width, focus stays where it is, usually on the item that was chosen.',
    "Below 840px of its width, focus inside the pane that's leaving (on Back, say) moves to the pane showing as the switch starts, so it never drops to the page.",
  ],
  touchTarget: {
    none: 'The layout has no controls of its own; the list items and the back control keep their own targets.',
  },
  motion: [
    'Below 840px of the layout’s own width, the panes switch with the shared axis transition both ways: the outgoing pane fades and slides out before it hides, and the incoming one fades in and slides 30px, the detail from the end edge, the list from the start edge. A page load never animates.',
    'Under reduced motion the slides are instant and the panes only fade. In right-to-left layouts the list sits on the right and the slide mirrors.',
  ],
  consumer: [
    'Pass `listLabel` and `detailLabel` from your translations; update `detailLabel` with the open item.',
    'Pass `detailKey` (usually the pathname) and render the layout in a shared route layout, so focus can follow the open item below 840px of the layout’s own width.',
    'Pass `back`, usually an {@link IconButton} link with an `aria-label` such as "Back", so people can return to the list while one pane shows (below 840px of the layout’s own width).',
    "When the list holds the page's heading, pass its words as `pageHeading` (at the same level), so the page still has its heading while only the detail shows.",
    'Mark the open item as selected in the list (a {@link List} with `selectedKeys`), so the two panes agree.',
  ],
};
