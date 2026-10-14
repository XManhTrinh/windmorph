'use client';

import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react';
import { mergeProps, mergeRefs, useFocusRing, useObjectRef, useToolbar } from 'react-aria';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
} from '../../primitives/ButtonBase';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { IconFaces } from '../../primitives/IconFaces';
import { iconFacesStyles, type IconTransition } from '../../primitives/icon-faces-styles';
import { ButtonContext, standardIconButtons } from '../button/ButtonContext';
import { cn } from '../../utils/cn';
import { useWarnOnce } from '../../utils/warn-once';
import type { FabElevation } from '../fab/fab-styles';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import { TooltipTrigger } from '../tooltip/tooltip-trigger';
import { ToolbarContext } from '../../primitives/ToolbarContext';
import {
  dockedToolbarStyles,
  floatingToolbarStyles,
  toolbarCollapseAnchor,
  toolbarFabStyles,
  type DockedToolbarArrangement,
  type FloatingToolbarColor,
  type ToolbarExitEdge,
  type ToolbarOrientation,
} from './toolbar-styles';

const DOCKED = { kind: 'docked', color: 'standard' } as const;

/** The `data-*` and `inert` attributes of a toolbar that has exited the screen. */
const exitProps = (visible: boolean) => ({
  'data-hidden': visible ? undefined : true,
  inert: !visible || undefined,
});

type Naming =
  | {
      /** Accessible name for the toolbar. Required unless `aria-labelledby` is set. */
      'aria-label': string;
    }
  | {
      /** The id of the element that names the toolbar. Required unless `aria-label` is set. */
      'aria-labelledby': string;
    };

type DivProps<Own> = Omit<
  ComponentPropsWithRef<'div'>,
  keyof Own | 'aria-label' | 'aria-labelledby' | 'color'
>;

/** Applies React Aria's toolbar behaviour (role, arrow keys) with the DOM's direction. */
function useToolbarRoot(
  ref: Ref<HTMLDivElement> | undefined,
  directionRef: RefCallback<HTMLElement>,
  props: { orientation: ToolbarOrientation; 'aria-label'?: string; 'aria-labelledby'?: string },
) {
  const merged = useMemo(
    () => mergeRefs<HTMLDivElement>(ref, directionRef as RefCallback<HTMLDivElement>),
    [ref, directionRef],
  );
  const rootRef = useObjectRef<HTMLDivElement>(merged);
  const { toolbarProps: aria } = useToolbar(props, rootRef);
  const { onKeyDownCapture } = aria;
  /*
   * M3, not the WAI-ARIA single-tab-stop pattern (2026-10-13): "Tab or Arrows: Navigate
   * between interactive elements". React Aria's arrows stay (orientation-aware, flipped in
   * RTL), but Tab and Shift+Tab are left to the browser, so they move through every control
   * in order and then out of the toolbar. Its focus restoring is dropped too, so Tab enters
   * at the first control and Shift+Tab at the last.
   */
  const toolbarProps: HTMLAttributes<HTMLElement> = {
    ...aria,
    onFocusCapture: undefined,
    onBlurCapture: undefined,
    onKeyDownCapture:
      onKeyDownCapture &&
      ((event) => {
        if (event.key !== 'Tab') onKeyDownCapture(event);
      }),
  };
  return { rootRef, toolbarProps };
}

export interface DockedToolbarClassNames {
  /** The toolbar's container, merged with `className`. */
  root?: string;
}

interface DockedToolbarOwnProps {
  /**
   * Centre the items 32px apart (M3's default), or spread them across the toolbar, which
   * M3 recommends in compact windows. @default "centered"
   */
  arrangement?: DockedToolbarArrangement;
  /**
   * Shows the toolbar. Hiding it slides it off the bottom of the window, e.g. while the
   * page scrolls (`useToolbarScrollExit`). A hidden toolbar is `inert`. @default true
   */
  visible?: boolean;
  /** The toolbar's controls, e.g. icon buttons, buttons or a FAB. */
  children: ReactNode;
  /** Classes for each part, by slot. */
  classNames?: DockedToolbarClassNames;
}

export type DockedToolbarProps = DockedToolbarOwnProps & Naming & DivProps<DockedToolbarOwnProps>;

/**
 * M3 Expressive docked toolbar: a full-width 64px bar of actions, usually along the bottom
 * of the window (it replaces the bottom app bar). Tab and the arrow keys move between its
 * controls (M3).
 *
 * @example
 * <DockedToolbar aria-label="Message actions" className="fixed inset-x-0 bottom-0">
 *   <IconButton icon={<ArchiveIcon />} aria-label="Archive" />
 *   <IconButton icon={<DeleteIcon />} aria-label="Delete" />
 * </DockedToolbar>
 */
export function DockedToolbar(props: DockedToolbarProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <DockedToolbarRoot {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

function DockedToolbarRoot({
  arrangement,
  visible = true,
  children,
  classNames,
  className,
  ref,
  directionRef,
  ...rest
}: DockedToolbarProps & { directionRef: RefCallback<HTMLElement> }) {
  const { rootRef, toolbarProps } = useToolbarRoot(ref, directionRef, {
    ...rest,
    orientation: 'horizontal',
  });
  return (
    <div
      {...mergeProps(rest, toolbarProps)}
      {...exitProps(visible)}
      ref={rootRef}
      data-tokens="md-comp-toolbar-docked"
      className={dockedToolbarStyles({ arrangement }).root({
        class: cn(classNames?.root, className),
      })}
    >
      <ToolbarContext value={DOCKED}>
        <ButtonContext value={standardIconButtons}>{children}</ButtonContext>
      </ToolbarContext>
    </div>
  );
}

export interface FloatingToolbarClassNames {
  /** The outer container, merged with `className`. */
  root?: string;
  /** The main content group. */
  items?: string;
  /** The group of `leading` controls. */
  leading?: string;
  /** The group of `trailing` controls. */
  trailing?: string;
  /** The toolbar's surface when it has a FAB. */
  surface?: string;
  /** The box the FAB fills (56px, 80px while collapsed). */
  fab?: string;
}

interface FloatingToolbarBaseProps {
  /** Lay the controls out in a row, or in a column at a window edge. @default "horizontal" */
  orientation?: ToolbarOrientation;
  /**
   * The container colour: `standard` (`surface-container`) or `vibrant`
   * (`primary-container`). @default "standard"
   */
  color?: FloatingToolbarColor;
  /**
   * Level 1 elevation, which M3 gives floating toolbars by default. Remove it when the
   * content beneath is visually distinct. @default true
   */
  elevated?: boolean;
  /**
   * Shows the leading and trailing content, or (with a FAB) the toolbar itself. Collapse
   * it while the page scrolls, e.g. with `useToolbarScrollExpansion`. Collapsed controls
   * stay in the tab order and the accessibility tree, and keyboard focus inside the
   * toolbar expands it, so every control stays reachable. @default true
   */
  expanded?: boolean;
  /**
   * Shows the toolbar. Hiding it slides it off `exitEdge`, e.g. while the page scrolls
   * (`useToolbarScrollExit`). A hidden toolbar is `inert`. Don't combine it with
   * collapsing: M3 says a toolbar shouldn't both collapse and leave the screen.
   * @default true
   */
  visible?: boolean;
  /** The window edge a hidden toolbar slides past (logical). @default "bottom" */
  exitEdge?: ToolbarExitEdge;
  /** The main controls, always shown. */
  children: ReactNode;
  /** Classes for each part, by slot. */
  classNames?: FloatingToolbarClassNames;
}

type FloatingToolbarContent =
  | {
      /** Controls before the main content, hidden while collapsed. */
      leading?: ReactNode;
      /** Controls after the main content, hidden while collapsed. */
      trailing?: ReactNode;
      fab?: undefined;
      fabPosition?: undefined;
    }
  | {
      leading?: undefined;
      trailing?: undefined;
      /**
       * A FAB beside the toolbar, usually a {@link ToolbarFab}. Collapsing hides the
       * toolbar and grows the FAB from 56px to 80px.
       */
      fab: ReactElement;
      /**
       * Side of the toolbar the FAB sits on. `top` is the same as `start` and `bottom` as
       * `end`, so the value can stay put when the orientation changes. @default "end"
       */
      fabPosition?: 'start' | 'end' | 'top' | 'bottom';
    };

type FloatingToolbarOwnProps = FloatingToolbarBaseProps & FloatingToolbarContent;

export type FloatingToolbarProps = FloatingToolbarOwnProps &
  Naming &
  DivProps<
    FloatingToolbarBaseProps & Record<'leading' | 'trailing' | 'fab' | 'fabPosition', unknown>
  >;

/**
 * M3 Expressive floating toolbar: a pill of controls that floats above the content,
 * horizontal or vertical, in standard or vibrant colours. Leading and trailing content
 * collapse with `expanded`; or pair it with a FAB, and collapsing hides the toolbar while
 * the FAB grows. Tab and the arrow keys move between its
 * controls (M3).
 *
 * @example
 * <FloatingToolbar aria-label="Formatting" expanded={expanded} className="fixed bottom-4 start-1/2"
 *   leading={<IconButton icon={<UndoIcon />} aria-label="Undo" />}>
 *   <IconButton toggle icon={<BoldIcon />} aria-label="Bold" />
 * </FloatingToolbar>
 *
 * <FloatingToolbar aria-label="Actions" fab={<ToolbarFab icon={<AddIcon />} aria-label="New" />}>
 *   <IconButton icon={<SearchIcon />} aria-label="Search" />
 * </FloatingToolbar>
 */
export function FloatingToolbar(props: FloatingToolbarProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <FloatingToolbarRoot {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

function FloatingToolbarRoot({
  orientation = 'horizontal',
  color = 'standard',
  elevated = true,
  expanded: expandedProp = true,
  visible = true,
  exitEdge,
  leading,
  trailing,
  fab,
  fabPosition,
  children,
  classNames,
  className,
  style,
  ref,
  directionRef,
  ...rest
}: FloatingToolbarProps & { directionRef: RefCallback<HTMLElement> }) {
  const { rootRef, toolbarProps } = useToolbarRoot(ref, directionRef, { ...rest, orientation });
  // Keyboard focus inside expands the toolbar. So does any focus that lands on collapsed
  // content (only the keyboard or assistive tech can reach it), so collapsed controls stay
  // reachable. Pointer focus on the always-shown controls doesn't.
  const { isFocusVisible, focusProps } = useFocusRing({ within: true });
  const [focusInCollapsed, setFocusInCollapsed] = useState(false);
  const expanded = expandedProp || isFocusVisible || focusInCollapsed;
  const collapsedFocusProps = {
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (!expanded && isInCollapsed(event.target)) setFocusInCollapsed(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!isInCollapsed(event.relatedTarget)) setFocusInCollapsed(false);
    },
  };
  const hasFab = fab != null;
  const fabAt = fabPosition === 'start' || fabPosition === 'top' ? 'start' : 'end';
  const styles = floatingToolbarStyles({
    orientation,
    color,
    elevated,
    exitEdge: exitEdge ?? 'bottom',
    hasFab,
    fabAt,
  });
  const [contentRef, toolbarSize] = useContentSize(hasFab, orientation);
  const context = useMemo(
    () => ({ kind: 'floating', color, expanded, orientation }) as const,
    [color, expanded, orientation],
  );
  // Once per toolbar, however often it collapses and leaves while scrolling.
  useWarnOnce(
    !visible && !expandedProp,
    "[@windmorph/react] A FloatingToolbar shouldn't both collapse and leave the screen (M3): use `expanded` or `visible`, not both.",
  );

  const collapsible = (slot: 'leading' | 'trailing', content: ReactNode) =>
    content != null && (
      <div
        data-collapsed={!expanded || undefined}
        data-toolbar-collapsible=""
        className={styles.collapse()}
      >
        <div
          data-collapsed={!expanded || undefined}
          className={styles.clip({ class: toolbarCollapseAnchor({ slot, orientation }) })}
        >
          <div className={styles.items({ class: classNames?.[slot] })}>{content}</div>
        </div>
      </div>
    );

  return (
    <div
      {...mergeProps(rest, toolbarProps, focusProps, collapsedFocusProps)}
      {...exitProps(visible)}
      ref={rootRef}
      data-tokens="md-comp-toolbar-floating"
      data-color={color}
      data-expanded={expanded}
      style={
        toolbarSize === undefined
          ? style
          : ({ '--m3-toolbar-size': `${toolbarSize}px`, ...style } as CSSProperties)
      }
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <ToolbarContext value={context}>
        <ButtonContext value={standardIconButtons}>
          {hasFab ? (
            <>
              <div className={styles.toolbarSlot()}>
                <div
                  data-collapsed={!expanded || undefined}
                  data-toolbar-collapsible=""
                  className={styles.surface({ class: classNames?.surface })}
                >
                  <div ref={contentRef} className={styles.content({ class: classNames?.items })}>
                    {children}
                  </div>
                </div>
              </div>
              <div className={styles.fabSlot()}>
                <div
                  data-collapsed={!expanded || undefined}
                  className={styles.fabBox({ class: classNames?.fab })}
                >
                  {fab}
                </div>
              </div>
            </>
          ) : (
            <>
              {collapsible('leading', leading)}
              <div className={styles.items({ class: classNames?.items })}>{children}</div>
              {collapsible('trailing', trailing)}
            </>
          )}
        </ButtonContext>
      </ToolbarContext>
    </div>
  );
}

/** Whether an element sits in collapsible content (leading, trailing or the FAB's toolbar). */
function isInCollapsed(element: EventTarget | null) {
  return element instanceof Element && element.closest('[data-toolbar-collapsible]') !== null;
}

/**
 * Measures the toolbar content's natural length along the toolbar, so the slot keeps the
 * expanded size and the surface can animate between it and 0.
 */
function useContentSize(enabled: boolean, orientation: ToolbarOrientation) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>();
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const measure = () =>
      setSize(orientation === 'horizontal' ? element.offsetWidth : element.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, orientation]);
  return [ref, size] as const;
}

export interface ToolbarFabClassNames {
  /** The FAB's button, merged with `className`. */
  root?: string;
  /** The icon. */
  icon?: string;
  /** The built-in plain tooltip that shows the label (`tooltip`). */
  tooltip?: string;
}

type AccessibleName =
  | {
      /** Accessible name for the FAB, also its tooltip. Required unless `aria-labelledby` is set. */
      'aria-label': string;
      /** The id of the element that names the FAB. */
      'aria-labelledby'?: string;
    }
  | {
      /** Accessible name for the FAB, also its tooltip. */
      'aria-label'?: string;
      /** The id of the element that names the FAB. Required unless `aria-label` is set. */
      'aria-labelledby': string;
    };

interface ToolbarFabOwnProps {
  /**
   * The icon (while the toolbar is collapsed, when `expandedIcon` is set). Hidden from
   * assistive tech; `aria-label` names the FAB.
   */
  icon: ReactElement;
  /**
   * The icon while the toolbar is expanded, e.g. "close" for a FAB that collapses the
   * toolbar. Without it, the FAB always shows `icon`.
   */
  expandedIcon?: ReactElement;
  /**
   * How the FAB hands over between `icon` and `expandedIcon`: `swap` halfway through the
   * toolbar's expand / collapse spring, or `rotate`, where the outgoing icon turns 90° and
   * fades out while the incoming one turns in and fades in. `rotate` goes beyond the M3
   * spec; it matches Google's Expressive showcase motion. It mirrors in RTL, and reduced
   * motion keeps only the crossfade. Only used with `expandedIcon`. @default "swap"
   */
  iconTransition?: IconTransition;
  /**
   * The FAB's colour scheme. Defaults to the toolbar's colour: `primary-container`
   * (standard) or `tertiary-container` (vibrant).
   * @default the toolbar's color, or "standard" outside a toolbar
   */
  color?: FloatingToolbarColor;
  /**
   * Shows `aria-label` in a plain tooltip on hover and keyboard focus, as M3 asks of FABs
   * on the web. @default true
   */
  tooltip?: boolean;
  /**
   * As on `Fab`: level 2 by default (hover 3), `lowered` level 1, or `flat` level 0.
   * @default "default"
   */
  elevation?: FabElevation;
  /** Classes for each part, by slot. */
  classNames?: ToolbarFabClassNames;
}

type OmitToolbarFab<T> = Omit<
  T,
  keyof ToolbarFabOwnProps | 'children' | 'disabled' | 'toggle' | 'aria-label' | 'aria-labelledby'
>;

export type ToolbarFabProps = ToolbarFabOwnProps &
  AccessibleName &
  (OmitToolbarFab<ButtonBaseActionProps> | OmitToolbarFab<ButtonBaseLinkProps>);

/**
 * The FAB of a {@link FloatingToolbar} (Compose's `StandardFloatingActionButton` /
 * `VibrantFloatingActionButton`): it fills the toolbar's FAB box, 56px or 80px while the
 * toolbar is collapsed, with 16px corners at level 2. With `expandedIcon` it shows that
 * icon while the toolbar is expanded and `icon` while it is collapsed.
 */
export function ToolbarFab({
  icon,
  expandedIcon,
  iconTransition,
  color,
  tooltip = true,
  elevation,
  classNames,
  className,
  ...base
}: ToolbarFabProps) {
  const toolbar = useContext(ToolbarContext);
  const styles = toolbarFabStyles({ color: color ?? toolbar?.color ?? 'standard', elevation });
  const baseProps = {
    ...base,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;
  const fab = (
    <ButtonBase {...baseProps}>
      <span
        aria-hidden="true"
        className={styles.icon({
          class: cn(expandedIcon && iconFacesStyles().cell(), classNames?.icon),
        })}
      >
        {expandedIcon ? (
          <IconFaces
            icon={icon}
            alternateIcon={expandedIcon}
            alternate={toolbar?.expanded ?? true}
            transition={iconTransition}
          />
        ) : (
          icon
        )}
      </span>
    </ButtonBase>
  );
  const label = base['aria-label'];
  if (!tooltip || !label) return fab;
  return (
    <TooltipTrigger>
      {fab}
      <LazyTooltip classNames={{ panel: classNames?.tooltip }}>{label}</LazyTooltip>
    </TooltipTrigger>
  );
}
