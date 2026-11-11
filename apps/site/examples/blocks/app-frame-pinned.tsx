'use client';

import { IconButton, NavigationRail, NavigationRailItem, TopAppBar } from '@windmorph/react';
import { NavigationRailGroup, NavigationRailGroupItem } from '@windmorph/react-pro';
import {
  ViewTransition,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { HomeIcon, MenuIcon, PersonIcon, SearchIcon, SettingsIcon } from '../../components/icons';

type Page = 'overview' | 'team' | 'invites' | 'general' | 'security';

const TITLES: Record<Page, string> = {
  overview: 'Overview',
  team: 'Team',
  invites: 'Invites',
  general: 'General',
  security: 'Security',
};

const PEOPLE: Page[] = ['team', 'invites'];
const SETTINGS: Page[] = ['general', 'security'];

/** A pinned column sits beside the page, with nothing under it to cast a shadow on. */
const FLAT = {
  '--wm-navigation-rail-group-elevation': '0 0 0 0 transparent',
  '--wm-navigation-rail-group-elevation-rtl': '0 0 0 0 transparent',
} as CSSProperties;

const SLIDE =
  'transition-[margin-inline-start] duration-[var(--md-sys-motion-spring-spatial-fast-duration)] ease-[var(--md-sys-motion-spring-effects-default-easing)] motion-reduce:transition-none';

/** The keys that scroll a page. */
const SCROLL_KEYS = new Set(['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp']);

/** What takes focus with Tab. */
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A working demo: pages with and without a pinned second nav, and the change between them.
 *
 * The `site-top-bar` class, the `page-axis` transition and the `data-column-opened` attribute go
 * with this site's page transition. Without one of your own, leave them out.
 */
export function AppFramePinned() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState<Page>('team');
  const hasColumn = page !== 'overview';
  const paneRef = useRef<HTMLElement>(null);
  const [paneIsTabStop, setPaneIsTabStop] = useState(false);
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    // With nothing focused, the scroll keys go to the window, which has nothing to scroll here.
    // The pane takes focus as such a key goes down, and the browser scrolls it with that same
    // press.
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement !== document.body || !SCROLL_KEYS.has(event.key)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      pane.focus({ preventScroll: true });
    };
    // A tab stop only while the page holds nothing that takes focus, as browsers do for a
    // scrolling region: a text-only page can still be reached and scrolled from the keyboard,
    // and every other page has no extra stop.
    const update = () => setPaneIsTabStop(pane.querySelector(TABBABLE) === null);
    update();
    const observer = new MutationObserver(update);
    observer.observe(pane, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  const hadColumn = useRef(hasColumn);
  useLayoutEffect(() => {
    document.documentElement.toggleAttribute('data-column-opened', hasColumn && !hadColumn.current);
    hadColumn.current = hasColumn;
  }, [page, hasColumn]);

  // The demo has no routes, so a link only changes the page shown here.
  const navigate = (event: MouseEvent) => {
    const link = (event.target as Element).closest?.('a[href^="#demo-"]');
    const next = link?.getAttribute('href')?.replace('#demo-', '') as Page | undefined;
    if (!next || !(next in TITLES)) return;
    event.preventDefault();
    event.stopPropagation();
    setDrawerOpen(false);
    startTransition(() => setPage(next));
  };

  const item = (id: Page) => (
    <NavigationRailGroupItem key={id} href={`#demo-${id}`} current={page === id}>
      {TITLES[id]}
    </NavigationRailGroupItem>
  );

  return (
    <div
      style={{ '--app-frame-gap': '16px' } as CSSProperties}
      onClickCapture={navigate}
      className="flex h-dvh overflow-hidden bg-surface text-on-surface medium:bg-surface-container"
    >
      <NavigationRail
        aria-label="Main"
        modal
        hideOnCollapse="compact"
        expanded={drawerOpen}
        onExpandedChange={setDrawerOpen}
        classNames={{ root: 'relative z-30 h-full bg-surface-container', header: 'pb-6' }}
        header={
          <a
            href="#demo-overview"
            aria-label="Workspace home"
            className="-mt-9 flex size-12 items-center justify-center rounded-corner-large bg-primary-container text-title-medium text-on-primary-container no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <span aria-hidden="true">W</span>
          </a>
        }
      >
        <NavigationRailItem
          href="#demo-overview"
          icon={<HomeIcon />}
          selected={page === 'overview'}
        >
          Overview
        </NavigationRailItem>
        <NavigationRailGroup
          id="people"
          icon={<PersonIcon />}
          label="People"
          pinned
          {...(hasColumn && { style: FLAT })}
        >
          {PEOPLE.map(item)}
        </NavigationRailGroup>
        <NavigationRailGroup
          id="settings"
          icon={<SettingsIcon />}
          label="Settings"
          pinned
          {...(hasColumn && { style: FLAT })}
        >
          {SETTINGS.map(item)}
        </NavigationRailGroup>
      </NavigationRail>

      <div
        className={`flex min-w-0 flex-1 flex-col ${hasColumn ? 'medium:ms-[280px]' : `medium:ms-0 ${SLIDE}`}`}
      >
        <TopAppBar
          variant="small"
          title="Workspace"
          className="site-top-bar z-20 shrink-0 bg-surface [transition-property:none] medium:bg-surface-container"
          classNames={{ actions: 'medium:pe-(--app-frame-gap)' }}
          navigationIcon={
            <IconButton
              variant="standard"
              className="medium:hidden"
              icon={<MenuIcon />}
              aria-label="Open navigation"
              onPress={() => setDrawerOpen(true)}
            />
          }
          actions={<IconButton variant="standard" icon={<SearchIcon />} aria-label="Search" />}
        />
        <main
          ref={paneRef}
          // Always focusable, for the scroll keys and a skip link.
          tabIndex={paneIsTabStop ? 0 : -1}
          className="min-h-0 flex-1 overflow-y-auto bg-surface medium:me-(--app-frame-gap) medium:mb-(--app-frame-gap) medium:h-[calc(100dvh-64px-var(--app-frame-gap))] medium:flex-none medium:rounded-corner-large outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary"
        >
          <ViewTransition key={page} enter="page-axis" exit="page-axis" default="none">
            <div>
              <header className="sticky top-0 z-10 bg-surface px-6 py-4">
                <h1 className="m-0 text-title-large">{TITLES[page]}</h1>
              </header>
              <div className="flex flex-col gap-6 px-6 pb-6">
                {Array.from({ length: 24 }, (_, index) => (
                  <p key={index} className="m-0 text-body-large text-on-surface-variant">
                    {TITLES[page]} page. Section {index + 1}.
                  </p>
                ))}
              </div>
            </div>
          </ViewTransition>
        </main>
      </div>
    </div>
  );
}
