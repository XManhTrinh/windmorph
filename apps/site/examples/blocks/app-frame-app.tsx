'use client';

import { IconButton, NavigationRail, NavigationRailItem, TopAppBar } from '@windmorph/react';
import { NavigationRailGroup, NavigationRailGroupItem } from '@windmorph/react-pro';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { HomeIcon, MenuIcon, PersonIcon, SearchIcon, SettingsIcon } from '../../components/icons';

/** The keys that scroll a page. */
const SCROLL_KEYS = new Set(['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp']);

/** What takes focus with Tab. */
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A rail and top bar on one raised surface, and the page a rounded pane on it.
 *
 * - `--app-frame-gap` is the gap below and beside the pane.
 * - The pane scrolls by itself, so its corners stay put. It needs an explicit height: as a flex
 *   child, `flex-1` alone would defeat the height of whatever it holds.
 * - The rail sits above the bar and the pane, so a flyout opens over them.
 * - On a phone the page is flat and the rail is a drawer.
 */
export function AppFrameApp() {
  const [drawerOpen, setDrawerOpen] = useState(false);
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
  return (
    <div
      style={{ '--app-frame-gap': '16px' } as CSSProperties}
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
        <NavigationRailItem href="#demo-overview" icon={<HomeIcon />} selected>
          Overview
        </NavigationRailItem>
        <NavigationRailGroup id="people" icon={<PersonIcon />} label="People">
          <NavigationRailGroupItem href="#demo-team">Team</NavigationRailGroupItem>
          <NavigationRailGroupItem href="#demo-invites">Invites</NavigationRailGroupItem>
        </NavigationRailGroup>
        <NavigationRailGroup id="settings" icon={<SettingsIcon />} label="Settings">
          <NavigationRailGroupItem href="#demo-general">General</NavigationRailGroupItem>
          <NavigationRailGroupItem href="#demo-security">Security</NavigationRailGroupItem>
        </NavigationRailGroup>
      </NavigationRail>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopAppBar
          variant="small"
          title="Workspace"
          className="z-20 shrink-0 bg-surface [transition-property:none] medium:bg-surface-container"
          // Lines the actions up with the pane's end edge.
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
          {/* Sticky from the start, so nothing shifts when it begins to stick. */}
          <header className="sticky top-0 z-10 bg-surface px-6 py-4">
            <h1 className="m-0 text-title-large">Overview</h1>
          </header>
          <div className="flex flex-col gap-6 px-6 pb-6">
            {Array.from({ length: 24 }, (_, index) => (
              <p key={index} className="m-0 text-body-large text-on-surface-variant">
                The pane scrolls by itself, with no page scroll. Section {index + 1}.
              </p>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
