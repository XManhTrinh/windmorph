import type { ComponentAccessibility } from './types';

export const listDetailLayout: ComponentAccessibility = {
  keyboard: {
    none: 'The layout adds no keys of its own: Tab moves through the panes in order, and the list, the back control and the content keep their own keys.',
  },
  screenReader: {
    role: 'Two landmarks: the list pane is a `navigation` region (`nav`), or a `region` (`section`) with `listAs="section"`; the detail pane is a `region` (`section`).',
    name: 'The list pane is named by `listLabel` ("Settings"), the detail pane by `detailLabel` (the open item\'s title).',
    states:
      'None. Below 840px the hidden pane is `display: none`, so it is out of the accessibility tree.',
  },
  focus: [
    'Below 840px, when `detailKey` changes, focus moves to the pane now showing (unless focus is already inside it), so keyboard and screen reader users land on the new content. Both panes take focus this way only (`tabIndex={-1}`), never by Tab.',
    'From 840px focus stays where it is, usually on the item that was chosen.',
  ],
  touchTarget: {
    none: 'The layout has no controls of its own; the list items and the back control keep their own targets.',
  },
  motion: [
    'Below 840px the incoming pane fades in and slides 30px along the shared axis: the detail from the end edge, the list from the start edge. A page load never animates.',
    'Under reduced motion the pane appears at once. In right-to-left layouts the list sits on the right and the slide mirrors.',
  ],
  consumer: [
    'Pass `listLabel` and `detailLabel` from your translations; update `detailLabel` with the open item.',
    'Pass `detailKey` (usually the pathname) and render the layout in a shared route layout, so focus can follow the open item below 840px.',
    'Pass `back`, usually an {@link IconButton} link with an `aria-label` such as "Back", so phone users can return to the list.',
    'Mark the open item as selected in the list (a {@link List} with `selectedKeys`), so the two panes agree.',
  ],
};
