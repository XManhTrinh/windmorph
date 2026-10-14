'use client';

import {
  IconButton,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  SearchAppBar,
  TopAppBar,
} from '@windmorph/react';
import { SkipLink } from '@windmorph/react-pro';
import { usePathname } from 'next/navigation';
import { ViewTransition, useState, type ReactElement, type ReactNode } from 'react';
import { HomeIcon, MenuBookIcon, MenuIcon, WidgetsIcon } from '../../components/icons';
import { DocsRail, currentDestination } from '../../components/nav/docs-rail';
import { DrawerNav } from '../../components/nav/drawer-nav';
import { Footer } from '../../components/footer';
import { PageOutline } from '../../components/page-outline';
import { DocsSearch } from './docs-search';
import { DisplaySettingsButton, DisplaySettingsProvider } from './display-settings';
import { SiteSnackbarProvider } from '../../components/site-snackbar';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The page a path belongs to, for the page transition: a component page's tabs
 * (`/components/button/api`) are one page, so only a move to another page transitions.
 */
function pageKey(pathname: string): string {
  const component = /^\/components\/[^/]+/.exec(pathname);
  return component ? component[0] : pathname;
}

/** The three compact bottom-bar destinations, defined independently of `DOCS_SECTIONS`. */
const BOTTOM_DESTINATIONS: { href: string; label: string; icon: ReactElement }[] = [
  { href: '/', label: 'Home', icon: <HomeIcon /> },
  { href: '/components', label: 'Components', icon: <WidgetsIcon /> },
  { href: '/getting-started', label: 'Guides', icon: <MenuBookIcon /> },
];

/**
 * The documentation shell: a skip link, a left navigation rail with Guides and component-group
 * flyouts and a top app bar with the search (medium+); a compact `SearchAppBar` with a modal
 * drawer and a three-destination bottom `NavigationBar`. It holds the one display-settings
 * sheet and the site snackbar, and puts the "On this page" outline beside guides and
 * component pages. Every element is a Windmorph component or site-owned nav markup;
 * active-route state comes from `usePathname()`.
 */
export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  // On a guide or component page the panel is pinned in the layout, so the content column
  // is inset past BOTH the rail (96px) and the panel (256px); elsewhere just past the rail.
  const pinnedPanel = currentDestination(pathname) !== null;
  // Guides and component pages list their sections; the home page and the index don't.
  const withOutline = pathname !== '/' && pathname !== '/components';

  return (
    <DisplaySettingsProvider>
      <SiteSnackbarProvider>
        <div className="min-h-dvh bg-surface text-on-surface">
          <SkipLink target="main-content">Skip to content</SkipLink>

          {/* Medium and wider: the fixed left rail with group flyouts. */}
          <DocsRail settings={<DisplaySettingsButton />} />

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
              pinnedPanel ? 'medium:ms-[352px]' : 'medium:ms-24'
            }`}
          >
            {/* Medium and wider: the search (guides and settings live in the rail). */}
            <TopAppBar
              variant="small"
              // M3: an opaque `surface` bar that turns `surface-container` once content scrolls
              // under it. (A translucent, blurred bar flashed as dark content passed beneath.)
              scrollBehavior="pinned"
              className="sticky top-0 z-20 hidden medium:flex"
              classNames={{ actions: 'min-w-0 pe-4' }}
              // The page names itself in its h1; the bar only anchors the search at the end.
              title={null}
              actions={
                <DocsSearch
                  view="docked"
                  // 48px (M3's minimum touch target) in the 64px bar; M3's 360px minimum
                  // width, narrowing only when the window leaves less room.
                  className="h-12 w-[360px] min-w-0 max-w-full shrink large:w-[480px]"
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
              actions={<DisplaySettingsButton />}
            >
              <DocsSearch view="full-screen" />
            </SearchAppBar>
            <main id="main-content" className="min-w-0 flex-1 p-6 pb-28 medium:pb-6">
              {/*
               * Moving to another page runs M3's shared-axis (Y) transition (see globals.css).
               * It is keyed on the page, not the URL, so a query change (the playground's
               * state) or a component tab change never transitions the whole page.
               */}
              <ViewTransition
                key={pageKey(pathname)}
                enter="page-axis"
                exit="page-axis"
                default="none"
              >
                {withOutline ? (
                  // The outline column is always reserved on large windows, so the content
                  // column sits in the same place whether or not the page lists its sections.
                  <div className="flex justify-center gap-8">
                    <div data-docs-content className="min-w-0 flex-1">
                      {children}
                    </div>
                    <PageOutline />
                  </div>
                ) : (
                  <div data-docs-content>{children}</div>
                )}
              </ViewTransition>
            </main>
            <Footer />
          </div>

          <NavigationBar
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-20 medium:hidden"
          >
            {BOTTOM_DESTINATIONS.map((destination) => (
              <NavigationBarItem
                key={destination.href}
                href={destination.href}
                icon={destination.icon}
                selected={
                  destination.href === '/'
                    ? pathname === '/'
                    : destination.label === 'Guides'
                      ? currentDestination(pathname) === 'guides'
                      : isActive(pathname, destination.href)
                }
              >
                {destination.label}
              </NavigationBarItem>
            ))}
          </NavigationBar>
        </div>
      </SiteSnackbarProvider>
    </DisplaySettingsProvider>
  );
}
