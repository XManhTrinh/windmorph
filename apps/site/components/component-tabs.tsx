'use client';

import { Tab, Tabs } from '@windmorph/react';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, type Key, type ReactNode } from 'react';
import {
  SUB_TABS,
  TAB_LABELS,
  componentTabHref,
  type ComponentTab,
} from '../content/components/doc';

/** The tab a component page's path shows: its last segment, or Overview. */
export function tabFromPathname(pathname: string): ComponentTab {
  const last = pathname.replace(/\/$/, '').split('/').pop() ?? '';
  return (SUB_TABS as readonly string[]).includes(last) ? (last as ComponentTab) : 'overview';
}

/**
 * A component page's tabs (Overview, API, Accessibility, Guidelines), M3 primary tabs that
 * navigate: each tab is its own statically exported URL, so a tab can be linked to, opened
 * in the search and read without JavaScript. The selected tab's panel holds the route's
 * content; a horizontal swipe on it (touch or pen) moves to the next or previous tab. The
 * row scrolls on phones, with M3's 52px leading inset, and sits flush with the page from
 * medium windows up.
 */
export function ComponentTabs({
  slug,
  title,
  tabs,
  children,
}: {
  slug: string;
  title: string;
  tabs: ComponentTab[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const selected = tabFromPathname(pathname);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Tabs
      ref={ref}
      aria-label={`${title} documentation`}
      scrollable
      swipeable
      selectedKey={selected}
      onSelectionChange={(key: Key) => {
        const tab = String(key) as ComponentTab;
        if (tab === selected) return;
        // Keep the place on the page, unless the tabs have scrolled away: then bring them
        // back under the top bar, so the new tab starts at its top.
        if (ref.current && ref.current.getBoundingClientRect().top < 0) {
          ref.current.scrollIntoView({ block: 'start' });
        }
        router.push(componentTabHref(slug, tab), { scroll: false });
      }}
      className="-mx-6 scroll-mt-16 medium:mx-0"
      classNames={{ list: 'medium:ps-0', panel: 'px-6 pt-8 medium:px-0' }}
    >
      {tabs.map((tab) => (
        <Tab key={tab} title={TAB_LABELS[tab]}>
          {tab === selected ? children : null}
        </Tab>
      ))}
    </Tabs>
  );
}
