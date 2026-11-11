import type { ReactNode } from 'react';
import { ScrollPane } from './scroll-pane';

/** The pane stays mounted as its pages change, as an app frame's does. */
export default function ScrollPaneLayout({ children }: { children: ReactNode }) {
  return <ScrollPane>{children}</ScrollPane>;
}
