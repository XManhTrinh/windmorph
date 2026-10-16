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
import { DensityZeroButtons } from '../button/DensityZeroButtons';
import { NavItem, type NavItemProps } from './NavItem';
import { navigationRailStyles } from './navigation-styles';
import { onItemArrowKeys } from './use-item-arrow-keys';
import { mergeDataTokens } from '../../utils/merge-data-tokens';

/** Registered in utilities.css (96px); every rail inset is derived from it. */
const COLLAPSED_WIDTH_VAR = '--m3-rail-collapsed-width';
const DEFAULT_COLLAPSED_WIDTH = 96;
const EXPANDED_MIN = 220;
const EXPANDED_MAX = 360;
/** Elements that take focus with Tab, for the modal rail's initial focus. */
const FOCUSABLE =
  'a[href]:not([aria-disabled="true"]), button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

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

type Naming =
  | {
      /** Accessible name for the navigation rail. Required unless `aria-labelledby` is set. */
      'aria-label': string;
    }
  | {
      /** The id of the element that names the navigation rail. Required unless `aria-label` is set. */
      'aria-labelledby': string;
    };

export interface NavigationRailClassNames {
  /** The `<nav>` container, merged with `className`. */
  root?: string;
  /** The in-flow rail's scrolling column, which holds the 44px top inset. */
  body?: string;
  /** The content above the items (`header`). */
  header?: string;
  /** The list of items. */
  items?: string;
  /** The expanded modal rail's sheet. */
  sheet?: string;
  /** The scrim behind the expanded modal rail. */
  scrim?: string;
}

interface NavigationRailOwnProps {
  /** Whether the rail is expanded (controlled). */
  expanded?: boolean;
  /** Whether the rail starts expanded (uncontrolled). @default false */
  defaultExpanded?: boolean;
  /** Called when the rail expands or collapses. */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Expand over the page as a modal sheet with a scrim instead of pushing content.
   * Pressing outside, Escape or choosing an item collapses it.
   * @default false
   */
  modal?: boolean;
  /** With `modal`, show nothing while collapsed (the expanded rail slides in). @default false */
  hideOnCollapse?: boolean;
  /** Content above the items, e.g. a menu button and a FAB; a function receives the state. */
  header?: ReactNode | ((state: { expanded: boolean; toggle: () => void }) => ReactNode);
  /**
   * Align the items as a group to the top, or to the middle of the space below the header
   * (M3 recommends centre on tablets, within easier reach). The header stays at the top.
   * @default "top"
   */
  itemAlignment?: 'top' | 'center';
  /** Draw a divider on the edge next to the content. @default false */
  divider?: boolean;
  /**
   * How the current item's pill moves to a newly chosen item. `expand` (M3: "the active
   * indicator expands from the center of the icon") grows it in place. `slide` moves it from
   * the previously chosen item on the fast spatial spring while the rail is expanded (in
   * place or modal), as in Google's Expressive showcase; an extension beyond the M3 spec.
   * The collapsed rail always expands, and reduced motion fades the pill in place.
   * @default "expand"
   */
  indicatorMotion?: 'expand' | 'slide';
  /** `NavigationRailItem` elements. */
  children: ReactNode;
  /** Classes for each part, by slot. */
  classNames?: NavigationRailClassNames;
}

export type NavigationRailProps = NavigationRailOwnProps &
  Naming &
  Omit<
    ComponentPropsWithRef<'nav'>,
    keyof NavigationRailOwnProps | 'aria-label' | 'aria-labelledby'
  >;

/**
 * Expanded width: the widest label on one line plus the item chrome, 220–360px (Compose).
 * Past 360px labels wrap.
 */
function useExpandedWidth(ref: RefObject<HTMLElement | null>, active: boolean, content: ReactNode) {
  const [width, setWidth] = useState(EXPANDED_MIN);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const labels = [...el.querySelectorAll<HTMLElement>('[data-nav-label]')];
    // Labels wrap in a narrow rail; measure each on one line.
    const widest = Math.max(
      0,
      ...labels.map((label) => {
        label.style.whiteSpace = 'nowrap';
        const natural = label.scrollWidth;
        label.style.whiteSpace = '';
        return natural;
      }),
    );
    const header = el.querySelector<HTMLElement>('[data-rail-header]');
    const headerWidth = header ? header.scrollWidth : 0;
    const chrome = expandedChrome(el);
    setWidth(Math.min(Math.max(widest + chrome, headerWidth, EXPANDED_MIN), EXPANDED_MAX));
  }, [ref, active, content]);
  return width;
}

/**
 * Whether `ref` is still widening after it became `expanding` (or mounted expanding, as the
 * modal sheet grows from the collapsed width): from that render until its width transition
 * ends, and false at once when none runs (reduced motion, or a consumer width). Meanwhile the
 * rail keeps its labels on one line, so none wraps letter by letter in a rail that is still
 * narrow and no icon jumps; the rail's clipping hides what doesn't fit yet.
 */
function useWidening(ref: RefObject<HTMLElement | null>, expanding: boolean) {
  const [widening, setWidening] = useState(expanding);
  const [wasExpanding, setWasExpanding] = useState(expanding);
  if (expanding !== wasExpanding) {
    setWasExpanding(expanding);
    setWidening(expanding);
  }
  useLayoutEffect(() => {
    const el = ref.current;
    if (!widening || !el) return;
    // Reading the running transitions resolves this render's styles, starting the spring.
    const running =
      typeof el.getAnimations === 'function' &&
      el
        .getAnimations()
        .some(
          (animation) =>
            'transitionProperty' in animation && animation.transitionProperty === 'width',
        );
    if (!running) {
      setWidening(false);
      return;
    }
    // A later width (the measured one replacing the minimum) retargets the same spring.
    const done = (event: TransitionEvent) => {
      if (event.target === el && event.propertyName === 'width') setWidening(false);
    };
    el.addEventListener('transitionend', done);
    return () => el.removeEventListener('transitionend', done);
  }, [ref, widening]);
  return widening;
}

/**
 * M3 Expressive navigation rail: destinations along the start edge. Collapsed (96px) items
 * show the icon above the label; expanded (220–360px) they show it beside the label and
 * the rail's width springs open. With `modal`, the expanded rail opens over the page as a
 * sheet with a scrim, focusing its first interactive element. Put a menu button in
 * `header` to toggle `expanded`. Tab or the Up / Down arrows move between items, and
 * labels wrap rather than truncate.
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
  itemAlignment = 'top',
  divider = false,
  indicatorMotion = 'expand',
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
  const slide = indicatorMotion === 'slide';
  const width = useExpandedWidth(rootRef, inlineExpanded, children);
  const widening = useWidening(rootRef, inlineExpanded);
  // Labels fade in at their new place once the rail has changed mode (not on first render).
  const [mode, setMode] = useState(inlineExpanded);
  const [modeChanged, setModeChanged] = useState(false);
  if (mode !== inlineExpanded) {
    setMode(inlineExpanded);
    setModeChanged(true);
  }

  const styles = navigationRailStyles({
    expanded: inlineExpanded,
    itemAlignment,
    divider,
    slidingIndicator: slide && inlineExpanded,
  });
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
          data-tokens={mergeDataTokens('md-comp-nav-rail', rest)}
          data-expanded={inlineExpanded || undefined}
          data-widening={widening || undefined}
          className={styles.root({ class: cn(classNames?.root, className) })}
        >
          <div className={styles.body({ class: classNames?.body })}>
            {headerContent != null && (
              <div data-rail-header="" className={styles.header({ class: classNames?.header })}>
                <DensityZeroButtons>{headerContent}</DensityZeroButtons>
              </div>
            )}
            <div
              data-item-alignment={itemAlignment}
              onKeyDown={onItemArrowKeys('vertical')}
              className={styles.items({ class: classNames?.items })}
            >
              <RailContext
                value={{
                  layout: inlineExpanded ? 'rail-start' : 'rail-top',
                  enterLabel: modeChanged,
                  ...(slide && inlineExpanded && { lastIndicatorRef }),
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
          itemAlignment={itemAlignment}
          slidingIndicator={slide}
          railRef={rootRef}
          classNames={classNames}
        >
          {children}
        </ModalRail>
      )}
    </>
  );
}

/** The sheet's exit transitions; whichever runs marks the end of its exit. */
const SHEET_EXIT_PROPERTIES = ['width', 'translate', 'opacity'] as const;

function ModalRail({
  open,
  onClose,
  header,
  naming,
  slide,
  itemAlignment,
  slidingIndicator,
  railRef,
  classNames,
  children,
}: {
  open: boolean;
  onClose: () => void;
  header: ReactNode;
  naming: Naming;
  slide: boolean;
  itemAlignment: 'top' | 'center';
  /** `indicatorMotion="slide"`: the pill slides between items. */
  slidingIndicator: boolean;
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
  // Presence ends with the sheet's own motion, not the scrim's shorter fade, which removed
  // the sheet mid-spring inside the collapsed rail (2026-10-15). Width when it shrinks back,
  // translate when it slides out, opacity under reduced motion.
  const { isPresent, isExiting, exitProps } = usePresence(open, SHEET_EXIT_PROPERTIES);
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
        itemAlignment={itemAlignment}
        slidingIndicator={slidingIndicator}
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
  itemAlignment,
  slidingIndicator,
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
  itemAlignment: 'top' | 'center';
  /** `indicatorMotion="slide"`: the pill slides between items. */
  slidingIndicator: boolean;
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
  // M3: initial focus lands on the first interactive item, whether it's the menu button,
  // the FAB or the first destination (useDialog would otherwise focus the sheet itself).
  useLayoutEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, []);
  const width = useExpandedWidth(ref, true, children);
  const widening = useWidening(ref, true);
  const styles = navigationRailStyles({
    expanded: true,
    sheetEntry: slide ? 'slide' : 'grow',
    itemAlignment,
    slidingIndicator,
  });
  const exiting = isExiting || undefined;
  return (
    <>
      <div
        {...underlayProps}
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div
        {...mergeProps(modalProps, dialogProps, exitProps)}
        ref={ref}
        data-tokens="md-comp-nav-rail"
        data-modal=""
        data-exiting={exiting}
        data-widening={widening || undefined}
        style={{ '--m3-rail-width': `${width}px` } as CSSProperties}
        className={styles.sheet({ class: classNames?.sheet })}
      >
        {header != null && (
          <div data-rail-header="" className={styles.header({ class: classNames?.header })}>
            <DensityZeroButtons>{header}</DensityZeroButtons>
          </div>
        )}
        <nav
          aria-label={'aria-label' in naming ? naming['aria-label'] : undefined}
          aria-labelledby={'aria-labelledby' in naming ? naming['aria-labelledby'] : undefined}
          data-item-alignment={itemAlignment}
          onKeyDown={onItemArrowKeys('vertical')}
          className={styles.items({ class: classNames?.items })}
        >
          <RailContext
            value={{
              layout: 'rail-start',
              enterLabel: false,
              ...(slidingIndicator && { lastIndicatorRef }),
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
