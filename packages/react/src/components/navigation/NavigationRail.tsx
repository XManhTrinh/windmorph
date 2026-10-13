'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { mergeProps, useDialog, useModalOverlay } from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { useControlledState } from 'react-stately/useControlledState';
import { Overlay } from '../../primitives/Overlay';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import type { NavItemLayout } from './nav-item-styles';
import { NavItem, type NavItemProps } from './NavItem';
import { navigationRailStyles } from './navigation-styles';

/** Registered in utilities.css (96px); every rail inset is derived from it. */
const COLLAPSED_WIDTH_VAR = '--m3-rail-collapsed-width';
const DEFAULT_COLLAPSED_WIDTH = 96;
const EXPANDED_MIN = 220;
const EXPANDED_MAX = 360;

/**
 * The item chrome beside an expanded label: an item inset each side, (collapsed − 56) / 2,
 * plus 16px pill padding each side, the 24px icon and the 8px gap. 104px at 96px.
 */
function expandedChrome(el: HTMLElement) {
  const collapsed =
    Number.parseFloat(getComputedStyle(el).getPropertyValue(COLLAPSED_WIDTH_VAR)) ||
    DEFAULT_COLLAPSED_WIDTH;
  return collapsed - 56 + 64;
}

interface RailContextValue {
  layout: NavItemLayout;
  enterLabel: boolean;
  /** The expanded list's last current pill, which the next current item's pill slides from. */
  lastIndicatorRef?: RefObject<HTMLElement | null>;
  /** The modal rail collapses after an item is chosen. */
  onNavigate?: () => void;
}

const RailContext = createContext<RailContextValue | null>(null);

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

export interface NavigationRailClassNames {
  root?: string;
  /** The in-flow rail's scrolling column, which holds the 44px top inset. */
  body?: string;
  header?: string;
  items?: string;
  sheet?: string;
  scrim?: string;
}

interface NavigationRailOwnProps {
  /** Whether the rail is expanded (controlled). */
  expanded?: boolean;
  /** @default false */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Expand over the page as a modal sheet with a scrim instead of pushing content.
   * Pressing outside, Escape or choosing an item collapses it.
   */
  modal?: boolean;
  /** With `modal`, show nothing while collapsed (the expanded rail slides in). */
  hideOnCollapse?: boolean;
  /** Content above the items, e.g. a menu button and a FAB; a function receives the state. */
  header?: ReactNode | ((state: { expanded: boolean; toggle: () => void }) => ReactNode);
  /** `NavigationRailItem` elements. */
  children: ReactNode;
  classNames?: NavigationRailClassNames;
}

export type NavigationRailProps = NavigationRailOwnProps &
  Naming &
  Omit<
    ComponentPropsWithRef<'nav'>,
    keyof NavigationRailOwnProps | 'aria-label' | 'aria-labelledby'
  >;

/** Expanded width: the widest label plus the item chrome, 220–360px (Compose). */
function useExpandedWidth(ref: RefObject<HTMLElement | null>, active: boolean, content: ReactNode) {
  const [width, setWidth] = useState(EXPANDED_MIN);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const labels = [...el.querySelectorAll<HTMLElement>('[data-nav-label]')];
    const widest = Math.max(0, ...labels.map((label) => label.scrollWidth));
    const header = el.querySelector<HTMLElement>('[data-rail-header]');
    const headerWidth = header ? header.scrollWidth : 0;
    const chrome = expandedChrome(el);
    setWidth(Math.min(Math.max(widest + chrome, headerWidth, EXPANDED_MIN), EXPANDED_MAX));
  }, [ref, active, content]);
  return width;
}

/**
 * M3 Expressive navigation rail: destinations along the start edge. Collapsed (96px) items
 * show the icon above the label; expanded (220–360px) they show it beside the label and
 * the rail's width springs open. With `modal`, the expanded rail opens over the page as a
 * sheet with a scrim. Put a menu button in `header` to toggle `expanded`.
 *
 * Icons stay on one line through the middle of the collapsed rail in both states. For a
 * different collapsed width, set `--m3-rail-collapsed-width` (e.g. the class
 * `[--m3-rail-collapsed-width:80px]`) rather than a `w-*` class; M3's widths are 96px
 * (Expressive) and 80px (baseline).
 *
 * @example
 * <NavigationRail aria-label="Main" header={({ toggle }) => <IconButton icon={<MenuIcon />} aria-label="Menu" onPress={toggle} />}>
 *   <NavigationRailItem href="/inbox" icon={<InboxIcon />} selected>Inbox</NavigationRailItem>
 * </NavigationRail>
 */
export function NavigationRail({
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  modal = false,
  hideOnCollapse = false,
  header,
  children,
  classNames,
  className,
  style,
  ...rest
}: NavigationRailProps) {
  const [isExpanded, setExpanded] = useControlledState(expanded, defaultExpanded, onExpandedChange);
  const toggle = () => setExpanded(!isExpanded);
  const inlineExpanded = isExpanded && !modal;
  const rootRef = useRef<HTMLElement>(null);
  const lastIndicatorRef = useRef<HTMLElement>(null);
  const width = useExpandedWidth(rootRef, inlineExpanded, children);
  // Labels fade in at their new place once the rail has changed mode (not on first render).
  const [mode, setMode] = useState(inlineExpanded);
  const [modeChanged, setModeChanged] = useState(false);
  if (mode !== inlineExpanded) {
    setMode(inlineExpanded);
    setModeChanged(true);
  }

  const styles = navigationRailStyles({ expanded: inlineExpanded });
  const headerContent =
    typeof header === 'function' ? header({ expanded: isExpanded, toggle }) : header;
  const showInline = !(modal && hideOnCollapse);

  return (
    <>
      {showInline && (
        <nav
          {...rest}
          ref={rootRef}
          style={
            {
              '--m3-rail-width': inlineExpanded ? `${width}px` : `var(${COLLAPSED_WIDTH_VAR})`,
              ...style,
            } as CSSProperties
          }
          data-expanded={inlineExpanded || undefined}
          className={styles.root({ class: cn(classNames?.root, className) })}
        >
          <div className={styles.body({ class: classNames?.body })}>
            {headerContent != null && (
              <div data-rail-header="" className={styles.header({ class: classNames?.header })}>
                {headerContent}
              </div>
            )}
            <div className={styles.items({ class: classNames?.items })}>
              <RailContext
                value={{
                  layout: inlineExpanded ? 'rail-start' : 'rail-top',
                  enterLabel: modeChanged,
                  lastIndicatorRef: inlineExpanded ? lastIndicatorRef : undefined,
                }}
              >
                {children}
              </RailContext>
            </div>
          </div>
        </nav>
      )}
      {modal && (
        <ModalRail
          open={isExpanded}
          onClose={() => setExpanded(false)}
          header={headerContent}
          naming={rest as Naming}
          slide={hideOnCollapse}
          railRef={rootRef}
          classNames={classNames}
        >
          {children}
        </ModalRail>
      )}
    </>
  );
}

function ModalRail({
  open,
  onClose,
  header,
  naming,
  slide,
  railRef,
  classNames,
  children,
}: {
  open: boolean;
  onClose: () => void;
  header: ReactNode;
  naming: Naming;
  slide: boolean;
  railRef: RefObject<HTMLElement | null>;
  classNames?: NavigationRailClassNames;
  children: ReactNode;
}) {
  const state = useOverlayTriggerState({
    isOpen: open,
    onOpenChange: (isOpen) => {
      if (!isOpen) onClose();
    },
  });
  const { isPresent, isExiting, exitProps } = usePresence(open);
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting}>
      <ModalSheet
        state={state}
        isExiting={isExiting}
        exitProps={exitProps}
        header={header}
        naming={naming}
        slide={slide}
        railRef={railRef}
        classNames={classNames}
      >
        {children}
      </ModalSheet>
    </Overlay>
  );
}

function ModalSheet({
  state,
  isExiting,
  exitProps,
  header,
  naming,
  slide,
  railRef,
  classNames,
  children,
}: {
  state: OverlayTriggerState;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  header: ReactNode;
  naming: Naming;
  slide: boolean;
  railRef: RefObject<HTMLElement | null>;
  classNames?: NavigationRailClassNames;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastIndicatorRef = useRef<HTMLElement>(null);
  const { modalProps, underlayProps } = useModalOverlay({ isDismissable: !isExiting }, state, ref);
  const { dialogProps } = useDialog(naming, ref);
  // The sheet is portalled out of the rail, so it can't inherit a collapsed width set on the
  // rail itself. Copy it before the width is measured and the sheet first paints.
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || !ref.current) return;
    ref.current.style.setProperty(
      COLLAPSED_WIDTH_VAR,
      getComputedStyle(rail).getPropertyValue(COLLAPSED_WIDTH_VAR),
    );
  }, [railRef]);
  const width = useExpandedWidth(ref, true, children);
  const styles = navigationRailStyles({ expanded: true, sheetEntry: slide ? 'slide' : 'grow' });
  const exiting = isExiting || undefined;
  return (
    <>
      <div
        {...underlayProps}
        {...exitProps}
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div
        {...mergeProps(modalProps, dialogProps)}
        ref={ref}
        data-exiting={exiting}
        style={{ '--m3-rail-width': `${width}px` } as CSSProperties}
        className={styles.sheet({ class: classNames?.sheet })}
      >
        {header != null && (
          <div data-rail-header="" className={styles.header({ class: classNames?.header })}>
            {header}
          </div>
        )}
        <nav
          aria-label={'aria-label' in naming ? naming['aria-label'] : undefined}
          aria-labelledby={'aria-labelledby' in naming ? naming['aria-labelledby'] : undefined}
          className={styles.items({ class: classNames?.items })}
        >
          <RailContext
            value={{
              layout: 'rail-start',
              enterLabel: false,
              lastIndicatorRef,
              onNavigate: state.close,
            }}
          >
            {children}
          </RailContext>
        </nav>
      </div>
    </>
  );
}

export type NavigationRailItemProps = NavItemProps;

/** A destination in a {@link NavigationRail}: a link (`href`) or a button. */
export function NavigationRailItem({ onPress, ...props }: NavigationRailItemProps) {
  const rail = useContext(RailContext);
  if (!rail) throw new Error('NavigationRailItem must be rendered inside a NavigationRail');
  return (
    <NavItem
      {...(props as NavItemProps)}
      layout={rail.layout}
      enterLabel={rail.enterLabel}
      {...(rail.lastIndicatorRef && { lastIndicatorRef: rail.lastIndicatorRef })}
      onPress={(event) => {
        onPress?.(event);
        rail.onNavigate?.();
      }}
    />
  );
}
