'use client';

import {
  IconButton,
  Menu,
  MenuItem,
  MenuTrigger,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  SearchAppBar,
  SheetTrigger,
  SideSheet,
  TopAppBar,
} from '@windmorph/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactElement, type ReactNode } from 'react';
import {
  HomeIcon,
  MenuBookIcon,
  MenuIcon,
  MoreVertIcon,
  SettingsIcon,
  WidgetsIcon,
} from '../../components/icons';
import { DocsRail } from '../../components/nav/docs-rail';
import { DrawerNav } from '../../components/nav/drawer-nav';
import { Footer } from '../../components/footer';
import { DocsSearch } from './docs-search';
import type { SearchEntry } from './search-index';
import { DOCS_SECTIONS } from './sections';
import { ThemeControls } from './theme-controls';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The three compact bottom-bar destinations, defined independently of `DOCS_SECTIONS`. */
const BOTTOM_DESTINATIONS: { href: string; label: string; icon: ReactElement }[] = [
  { href: '/', label: 'Home', icon: <HomeIcon /> },
  { href: '/components', label: 'Components', icon: <WidgetsIcon /> },
  { href: '/getting-started', label: 'Guides', icon: <MenuBookIcon /> },
];

/** The display settings (theme, mode, contrast, motion, direction) in a modal side sheet. */
function DisplaySettings() {
  return (
    <SheetTrigger>
      <IconButton icon={<SettingsIcon />} aria-label="Display settings" />
      <SideSheet title="Display" className="w-[320px]" labels={{ close: 'Close display settings' }}>
        <ThemeControls />
      </SideSheet>
    </SheetTrigger>
  );
}

/** The six guide-section links, inline at `large:` and up. */
function SectionLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Guide sections" className="hidden items-center gap-1 large:flex">
      {DOCS_SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          aria-current={isActive(pathname, section.href) ? 'page' : undefined}
          className="rounded-full px-3 py-2 text-label-large text-on-surface-variant outline-none transition-colors hover:bg-on-surface/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary aria-[current=page]:bg-secondary-container aria-[current=page]:text-on-secondary-container motion-reduce:transition-none"
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}

/** The six guide sections collapsed into one overflow menu, from `medium:` to below `large:`. */
function SectionMenu() {
  const router = useRouter();
  return (
    <span className="large:hidden">
      <MenuTrigger>
        <IconButton icon={<MoreVertIcon />} aria-label="Guide sections" />
        <Menu aria-label="Guide sections" onAction={(key) => router.push(String(key))}>
          {DOCS_SECTIONS.map((section) => (
            <MenuItem key={section.href}>{section.label}</MenuItem>
          ))}
        </Menu>
      </MenuTrigger>
    </span>
  );
}

/**
 * The documentation shell: a skip link, a left navigation rail with group flyouts (medium+)
 * and a top app bar whose six guide-section links go inline at `large:` and collapse into an
 * overflow menu below it; a compact `SearchAppBar` with a modal drawer and a three-
 * destination bottom `NavigationBar`. Every element is a `@windmorph/react` component or
 * site-owned nav markup; active-route state comes from `usePathname()`.
 */
export function DocsShell({
  children,
  searchEntries,
}: {
  children: ReactNode;
  searchEntries: SearchEntry[];
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  // On a component detail page the group panel is pinned in the layout, so the content column
  // is inset past BOTH the rail (96px) and the panel (280px); elsewhere just past the rail.
  const pinnedPanel = /^\/components\/[^/]+/.test(pathname);

  return (
    <div className="min-h-dvh bg-surface text-on-surface">
      <a
        href="#main-content"
        className="sr-only rounded-corner-medium bg-primary px-4 py-2 text-label-large text-on-primary focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50"
      >
        Skip to content
      </a>

      {/* Medium and wider: the fixed left rail with group flyouts. */}
      <DocsRail settings={<DisplaySettings />} />

      {/* Compact: a modal drawer opened from the search app bar's navigation icon. */}
      <NavigationRail
        aria-label="Documentation navigation"
        modal
        hideOnCollapse
        expanded={navOpen}
        onExpandedChange={setNavOpen}
      >
        <DrawerNav pathname={pathname} onNavigate={() => setNavOpen(false)} />
      </NavigationRail>

      {/* The rail is fixed; the content column is inset past the rail (and the pinned panel),
          transitioning the inline-start margin as the pinned drawer pushes content. */}
      <div
        className={`flex min-h-dvh min-w-0 flex-col transition-[margin-inline-start] duration-[var(--md-sys-motion-spring-spatial-default-duration)] ease-[var(--md-sys-motion-spring-spatial-default-easing)] motion-reduce:transition-none ${
          pinnedPanel ? 'medium:ms-[328px]' : 'medium:ms-24'
        }`}
      >
        {/* Medium and wider: section links (inline at large / overflow menu below), search, settings. */}
        <TopAppBar
          variant="small"
          titleAlign="center"
          // M3: an opaque `surface` bar that turns `surface-container` once content scrolls
          // under it. (A translucent, blurred bar flashed as dark content passed beneath.)
          scrollBehavior="pinned"
          className="sticky top-0 z-20 hidden medium:flex"
          classNames={{ actions: 'min-w-0 pe-4' }}
          // Section links centered in the middle column; search anchored at the inline-end.
          title={
            <div className="flex min-w-0 items-center justify-center gap-1">
              <SectionLinks pathname={pathname} />
              <SectionMenu />
            </div>
          }
          actions={
            <DocsSearch
              entries={searchEntries}
              view="docked"
              // 48px (M3's minimum touch target) in the 64px bar; the field fills the bar.
              className="h-12 w-[260px] min-w-0 max-w-full shrink"
            />
          }
        />
        {/* Compact: the search fills the bar between the drawer button and the settings. */}
        <SearchAppBar
          scrollBehavior="pinned"
          className="sticky top-0 z-20 medium:hidden"
          navigationIcon={
            <IconButton
              icon={<MenuIcon />}
              aria-label="Open navigation"
              onPress={() => setNavOpen(true)}
            />
          }
          actions={<DisplaySettings />}
        >
          <DocsSearch entries={searchEntries} view="full-screen" />
        </SearchAppBar>
        <main id="main-content" className="min-w-0 flex-1 p-6 pb-28 medium:pb-6">
          {children}
        </main>
        <Footer />
      </div>

      <NavigationBar aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 medium:hidden">
        {BOTTOM_DESTINATIONS.map((destination) => (
          <NavigationBarItem
            key={destination.href}
            href={destination.href}
            icon={destination.icon}
            selected={
              destination.href === '/' ? pathname === '/' : isActive(pathname, destination.href)
            }
          >
            {destination.label}
          </NavigationBarItem>
        ))}
      </NavigationBar>
    </div>
  );
}
