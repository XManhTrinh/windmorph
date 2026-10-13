'use client';

import { NavigationRail } from '@windmorph/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  COMPONENT_META_MAP,
  RAIL_GROUPS,
  RAIL_GROUP_MAP,
  type RailGroupId,
} from '../../content/components/catalog';
import { GROUP_ICONS } from './group-icons';
import { GroupTrigger, RailFlyout } from './rail-flyout';

/**
 * Hover-intent timing. A short OPEN delay means briefly passing the pointer over adjacent
 * triggers (e.g. on a diagonal path to the panel) does not flash-switch groups; a longer
 * CLOSE delay keeps the panel while the pointer crosses the gap from a trigger into it.
 * Keyboard focus and clicks are immediate — the delays apply to pointer hover only.
 */
// Open feels near-instant (matching the reference) but keeps a tiny intent delay so a
// diagonal pointer crossing an adjacent trigger doesn't flash-switch groups; the longer
// close delay + cancel-on-drawer-enter does the heavy lifting against mis-switches.
const OPEN_DELAY = 60;
const CLOSE_DELAY = 250;

function currentRailGroup(pathname: string): RailGroupId | null {
  const match = pathname.match(/^\/components\/([^/]+)/);
  if (!match) return null;
  return COMPONENT_META_MAP[match[1]!]?.railGroup ?? null;
}

/**
 * The medium+ left navigation rail: a Home squircle, one navigable group trigger per rail
 * group (each links to the group's first page AND opens a secondary flyout of component
 * links), and the display-settings trigger pinned at the bottom.
 *
 * On a component DETAIL page the flyout is a PERMANENT secondary pane for the active group
 * (`pinned`); the shell insets content past it. On every other page the flyout is a
 * transient hover/focus overlay. In both cases hovering another group previews it (after the
 * open delay) and leaving reverts to the active/pinned group (after the close delay). Owns
 * the single open-group state, the hover-intent timers and the flyout's keyboard behaviour.
 */
export function DocsRail({ settings }: { settings: ReactNode }) {
  const pathname = usePathname();
  const current = currentRailGroup(pathname);
  const pinned = current !== null;
  const baseId = useId();
  const [openGroup, setOpenGroup] = useState<RailGroupId | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Partial<Record<RailGroupId, HTMLAnchorElement | null>>>({});

  // On a detail page the panel defaults to the active group; a hover/focus preview overrides it.
  const displayedGroup = openGroup ?? current;
  const open = displayedGroup !== null;
  const flyoutId = (id: RailGroupId) => `${baseId}-flyout-${id}`;

  // The panel is ALWAYS mounted (closed = inert, width 0) so that every open/close runs the
  // same `data-open` width transition — the first hover after load animates identically to
  // every later one (no `@starting-style` first-mount special case). It keeps showing the
  // last group's content while it closes, updating only to a new non-null group.
  const [shownGroup, setShownGroup] = useState<RailGroupId>(
    () => displayedGroup ?? RAIL_GROUPS[0]!.id,
  );
  if (displayedGroup !== null && displayedGroup !== shownGroup) {
    setShownGroup(displayedGroup);
  }

  const clearOpenTimer = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Pointer hover: open/switch after the intent delay; a pending open replaces any earlier one.
  const hoverOpen = useCallback(
    (id: RailGroupId) => {
      clearCloseTimer();
      clearOpenTimer();
      openTimer.current = setTimeout(() => setOpenGroup(id), OPEN_DELAY);
    },
    [clearCloseTimer, clearOpenTimer],
  );

  // Keyboard focus: open immediately (no hover delay).
  const focusOpen = useCallback(
    (id: RailGroupId) => {
      clearCloseTimer();
      clearOpenTimer();
      setOpenGroup(id);
    },
    [clearCloseTimer, clearOpenTimer],
  );

  // Pointer left a trigger or the panel: close/revert after the close delay (cancellable).
  const scheduleClose = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenGroup(null), CLOSE_DELAY);
  }, [clearOpenTimer, clearCloseTimer]);

  // Pointer entered the panel (or returned to a trigger): keep it open.
  const cancelClose = useCallback(() => clearCloseTimer(), [clearCloseTimer]);

  const closeNow = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    setOpenGroup(null);
  }, [clearOpenTimer, clearCloseTimer]);

  // Drop any hover preview when the route changes (reverts to the new page's pinned group).
  // Storing the previous pathname in state and adjusting during render is React's recommended
  // pattern for resetting state on a prop change — simpler than an effect, and it keeps
  // client-side navigations from leaving a stale preview open.
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpenGroup(null);
  }

  // Clear pending timers on unmount so rapid movement can't leave a stuck panel.
  useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
    },
    [clearOpenTimer, clearCloseTimer],
  );

  return (
    <div
      className="fixed top-0 start-0 z-30 hidden h-dvh medium:block"
      onKeyDown={(event) => {
        // Escape closes a hover/focus preview (not the pinned active group) and refocuses.
        if (event.key === 'Escape' && openGroup) {
          const toFocus = triggerRefs.current[openGroup];
          closeNow();
          toFocus?.focus();
        }
      }}
      onBlur={(event) => {
        // Close when focus leaves the whole rail+flyout subtree.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeNow();
      }}
    >
      <NavigationRail
        aria-label="Components and settings"
        classNames={{
          root: 'relative z-30 h-full bg-surface-container',
          items: 'min-h-0 flex-1',
        }}
      >
        {/* Home zone: the Windmorph logo tile (the favicon), set apart from the destinations
            below. A -mt-8 pulls the content up into the library rail body's default pt-[44px] so
            the effective top inset is a balanced ~12px — kept site-side (core is read-only).
            The tile brings its own dark background, so it reads the same in every theme. */}
        <div className="-mt-8 flex shrink-0 justify-center pb-6">
          <Link
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
          </Link>
        </div>

        {/* Middle zone: the scrollable group destinations, with M3 rail item rhythm. */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {RAIL_GROUPS.map((group) => (
            <GroupTrigger
              key={group.id}
              group={group}
              icon={GROUP_ICONS[group.id]}
              open={displayedGroup === group.id}
              current={current === group.id}
              flyoutId={flyoutId(group.id)}
              triggerRef={(node) => {
                triggerRefs.current[group.id] = node;
              }}
              onPointerOpen={() => hoverOpen(group.id)}
              onFocusOpen={() => focusOpen(group.id)}
              onPointerLeave={scheduleClose}
            />
          ))}
        </div>

        {/* Bottom zone: theme/display controls. */}
        <div className="flex shrink-0 justify-center pb-2 pt-2">{settings}</div>
      </NavigationRail>

      {/* Mounted once a group has been shown, so it can animate CLOSED as well as open. */}
      {/* Always mounted (closed = inert, width 0) so every open/close runs the same width
          transition — no first-mount `@starting-style` special case. */}
      <RailFlyout
        id={flyoutId(shownGroup)}
        group={RAIL_GROUP_MAP[shownGroup]}
        open={open}
        pinned={pinned}
        pathname={pathname}
        // Activating a child navigates within the same group → it pins. Don't force a
        // close here (that would briefly close before the route pins the group, a flicker);
        // just cancel any pending close and let the route-change logic transition in place.
        onNavigate={cancelClose}
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
      />
    </div>
  );
}
