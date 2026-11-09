'use client';

import { NavigationRail, useNavigationRail } from '@windmorph/react';
import { NavigationRailGroup, NavigationRailGroupItem } from '@windmorph/react-pro';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { DOCS_SECTIONS } from '../../app/(docs)/sections';
import {
  COMPONENT_META_MAP,
  RAIL_GROUPS,
  pagesInRailGroup,
  type RailGroupId,
} from '../../content/components/catalog';
import { MenuBookIcon } from '../icons';
import { IntentLink } from '../intent-link';
import { PageChips } from '../page-chips';
import { DrawerNav } from './drawer-nav';
import { GROUP_ICONS } from './group-icons';

/** A rail destination's id: the guides, or a component group. */
type DestinationId = 'guides' | RailGroupId;

/** A link in a destination's column, with the chips its page carries. */
interface RailLink {
  href: string;
  title: string;
  expressive?: boolean | undefined;
  pro?: boolean | undefined;
}

interface RailDestination {
  id: DestinationId;
  icon: ReactElement;
  /** One word: the rail label, also the column's heading. */
  railLabel: string;
  /** The column's accessible name. */
  fullName: string;
  /** Where the destination itself goes: its first link. */
  href: string;
  links: RailLink[];
}

/** The rail's destinations, top to bottom: the guides, then the component groups. */
const DESTINATIONS: RailDestination[] = [
  {
    id: 'guides',
    icon: <MenuBookIcon />,
    railLabel: 'Guides',
    fullName: 'Guides',
    href: DOCS_SECTIONS[0]!.href,
    links: DOCS_SECTIONS.map((section) => ({ href: section.href, title: section.label })),
  },
  ...RAIL_GROUPS.map((group) => {
    const pages = pagesInRailGroup(group.id);
    return {
      id: group.id,
      icon: GROUP_ICONS[group.id] as ReactElement,
      railLabel: group.railLabel,
      fullName: group.fullName,
      // The registry is the single source of truth for the group's first page.
      href: pages.length > 0 ? `/components/${pages[0]!.slug}` : '/components',
      links: pages.map((page) => ({
        href: `/components/${page.slug}`,
        title: page.title,
        expressive: page.expressive,
        pro: page.pro,
      })),
    };
  }),
];

/**
 * The column's rows at the site's density. Its 272px holds every name beside its chip,
 * emphasised, with the whole-pixel glyph advances Linux renders (up to 7% wider than macOS's).
 */
const COLUMN_TOKENS = {
  '--wm-navigation-rail-group-item-height': '40px',
  '--wm-navigation-rail-group-item-padding': '12px',
} as CSSProperties;

const HEADING = 'px-4 pt-5 pb-3 text-label-small uppercase';

/** The destination a page belongs to: a guide, or a component page's group. */
export function currentDestination(pathname: string): DestinationId | null {
  if (DOCS_SECTIONS.some((section) => pathname === section.href)) return 'guides';
  const match = pathname.match(/^\/components\/([^/]+)/);
  if (!match) return null;
  return COMPONENT_META_MAP[match[1]!]?.railGroup ?? null;
}

/** One destination: a link with a column in the rail, an accordion in the sheet. */
function DestinationGroup({
  destination,
  pathname,
}: {
  destination: RailDestination;
  pathname: string;
}) {
  return (
    <NavigationRailGroup
      id={destination.id}
      icon={destination.icon}
      label={destination.railLabel}
      aria-label={destination.fullName}
      href={destination.href}
      currentPath={pathname}
      pinned
      style={COLUMN_TOKENS}
      classNames={{ heading: HEADING }}
    >
      {destination.links.map((link) => (
        <NavigationRailGroupItem
          key={link.href}
          href={link.href}
          {...((link.expressive || link.pro) && {
            trailing: <PageChips expressive={link.expressive} pro={link.pro} />,
          })}
        >
          {link.title}
        </NavigationRailGroupItem>
      ))}
    </NavigationRailGroup>
  );
}

/** The component groups, for the phone's sheet (which lists the guides as plain rows). */
export function ComponentGroups({ pathname }: { pathname: string }) {
  return DESTINATIONS.filter((destination) => destination.id !== 'guides').map((destination) => (
    <DestinationGroup key={destination.id} destination={destination} pathname={pathname} />
  ));
}

/** What the rail holds: its three zones, or the sheet's list once it's the phone's drawer. */
function RailContent({ settings, pathname }: { settings: ReactNode; pathname: string }) {
  const rail = useNavigationRail();
  if (rail.expanded) return <DrawerNav pathname={pathname} onNavigate={rail.close} />;
  return (
    <>
      {/* Home zone: the Windmorph logo tile (the favicon), set apart from the destinations
          below. A -mt-8 pulls the content up into the library rail body's default pt-[44px] so
          the effective top inset is a balanced ~12px. The tile brings its own dark background,
          so it reads the same in every theme. */}
      <div className="-mt-8 flex shrink-0 justify-center pb-6">
        <IntentLink
          href="/"
          aria-label="Home"
          aria-current={pathname === '/' ? 'page' : undefined}
          className="block size-14 rounded-corner-large outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <img
            src="/windmorph-icon.png"
            alt=""
            width={56}
            height={56}
            className="size-full rounded-corner-large"
          />
        </IntentLink>
      </div>

      {/* Middle zone: the scrollable destinations. */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {DESTINATIONS.map((destination) => (
          <DestinationGroup key={destination.id} destination={destination} pathname={pathname} />
        ))}
      </div>

      {/* Bottom zone: theme/display controls. */}
      <div className="flex shrink-0 justify-center pb-2 pt-2">{settings}</div>
    </>
  );
}

/**
 * The site's one navigation rail. From 600px wide it's the fixed rail: a Home tile, a
 * destination per guide list and component group, and the display settings. On a guide or
 * component page the destination's column stays open beside it (the shell insets the content);
 * another destination previews over the page. Below 600px the rail is hidden and `open` shows
 * it as a modal sheet.
 */
export function DocsRail({
  settings,
  open,
  onOpenChange,
}: {
  settings: ReactNode;
  /** Whether the phone's sheet is open. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const prefetched = useRef(new Set<string>());

  // Prefetching every link in the rail would download dozens of pages nobody opens, so a page
  // is fetched once a pointer or focus reaches its link, before the click.
  const prefetch = (event: { target: EventTarget }) => {
    const href = (event.target as Element).closest?.('a[href^="/"]')?.getAttribute('href');
    if (!href || prefetched.current.has(href)) return;
    prefetched.current.add(href);
    router.prefetch(href);
  };

  return (
    <div
      className="site-rail fixed top-0 start-0 z-30 h-dvh"
      onPointerOver={prefetch}
      onFocus={prefetch}
    >
      <NavigationRail
        aria-label="Components and settings"
        modal
        hideOnCollapse="compact"
        expanded={open}
        onExpandedChange={onOpenChange}
        classNames={{
          root: 'relative z-30 h-full bg-surface-container',
          items: 'min-h-0 flex-1',
          // As wide as M3's modal drawer (360px), leaving 56px of the page in view, so names
          // and their chips never truncate; the rail would size itself to the truncated rows.
          sheet: 'w-[min(360px,calc(100vw-56px))]',
        }}
      >
        <RailContent settings={settings} pathname={pathname} />
      </NavigationRail>
    </div>
  );
}
