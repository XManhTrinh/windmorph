'use client';

import {
  Children,
  useContext,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  mergeProps,
  useInteractOutside,
  useOverlayPosition,
  useOverlayTrigger,
  usePopover,
  useTooltip,
  useTooltipTrigger,
  type Placement,
} from 'react-aria';
import {
  useOverlayTriggerState,
  useTooltipTriggerState,
  type OverlayTriggerState,
} from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import {
  TriggerContext,
  useTriggerProps,
  type TriggerContextValue,
} from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { tabbables } from '../../utils/focus';
import { richTooltipStyles, tooltipStyles } from './tooltip-styles';
import { TooltipPlacementContext, type TooltipPlacement } from './tooltip-placement';
import {
  CLOSE_DELAY,
  DEFAULT_OFFSET,
  RichContext,
  TooltipContext,
  TooltipTrigger,
  useInTooltipTrigger,
  useTouchLongPress,
  type RichContextValue,
  type TooltipContextValue,
  type TooltipTriggerProps,
} from './tooltip-trigger';

export {
  TooltipPlacementContext,
  TooltipTrigger,
  useInTooltipTrigger,
  type TooltipPlacement,
  type TooltipTriggerProps,
};

/** A caret (8px) sits in the gap between the anchor and the tooltip. */
const offsetFor = (offset: number, caret: boolean) => offset + (caret ? 8 : 0);

/** Tooltips move off the screen edge in 8px steps (the spec), so keep 8px from it. */
const CONTAINER_PADDING = 8;

const subscribeToNothing = () => () => {};

/**
 * React Aria resolves `start` / `end` from its locale, not the DOM; read the anchor's laid-out
 * direction and turn them into physical sides.
 */
function usePhysicalPlacement(
  placement: TooltipPlacement,
  triggerRef: RefObject<HTMLElement | null>,
): Placement {
  const direction = useSyncExternalStore(
    subscribeToNothing,
    () => (triggerRef.current ? getComputedStyle(triggerRef.current).direction : 'ltr'),
    () => 'ltr',
  );
  const rtl = direction === 'rtl';
  return placement
    .replace('start', rtl ? 'right' : 'left')
    .replace('end', rtl ? 'left' : 'right') as Placement;
}

/**
 * The side to reveal from: React Aria's resolved one, or until it has measured (its first
 * render reports none) the requested side, so the element is inserted with a placement and
 * its `@starting-style` clip applies.
 */
function revealSide(resolved: string | null | undefined, requested: Placement): string {
  return resolved ?? requested.split(' ')[0] ?? requested;
}

/** The caret points at the anchor from whichever side the tooltip ended up on. */
function caretStyle(placement: string, arrow: HTMLAttributes<HTMLElement>) {
  const side = placement.split(' ')[0];
  const rotation =
    { top: 0, bottom: 180, left: -90, right: 90 }[side as 'top' | 'bottom' | 'left' | 'right'] ?? 0;
  const style: CSSProperties = {
    ...arrow.style,
    position: 'absolute',
    rotate: `${rotation}deg`,
  };
  if (side === 'top') style.top = '100%';
  if (side === 'bottom') style.bottom = '100%';
  if (side === 'left') style.left = 'calc(100% - 4px)';
  if (side === 'right') style.right = 'calc(100% - 4px)';
  // Centre the 16px caret on the arrow position React Aria computed.
  if (side === 'top' || side === 'bottom') style.marginInlineStart = -8;
  else style.marginTop = -4;
  return style;
}

/* ------------------------------------------------------------------ Plain */

export interface TooltipClassNames {
  /** The visible surface: its colour, corners, padding and size. */
  panel?: string;
  /** The caret pointing at the anchor. */
  caret?: string;
}

export interface TooltipProps {
  children: ReactNode;
  /** Draw a 16×8px caret pointing at the anchor. @default false */
  caret?: boolean;
  /**
   * Goes on the outermost element, which React Aria places against the anchor; the surface
   * inside keeps its size whatever layout class lands here. Style the surface with
   * `classNames.panel`.
   */
  className?: string;
  /** Classes for each part, by slot. */
  classNames?: TooltipClassNames;
}

/** M3 plain tooltip: a short label in `inverse-surface`, inside a {@link TooltipTrigger}. */
export function Tooltip(props: TooltipProps) {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('Tooltip must be rendered inside a TooltipTrigger');
  const { isPresent, isExiting, exitProps } = usePresence(context.state.isOpen);
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting} topLayer>
      <TooltipPopup {...props} context={context} isExiting={isExiting} exitProps={exitProps} />
    </Overlay>
  );
}

function TooltipPopup({
  children,
  caret = false,
  className,
  classNames,
  context,
  isExiting,
  exitProps,
}: TooltipProps & {
  context: TooltipContextValue;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { tooltipProps } = useTooltip(context.tooltipProps, context.state);
  const requested = usePhysicalPlacement(context.placement, context.triggerRef);
  const { overlayProps, arrowProps, placement } = useOverlayPosition({
    targetRef: context.triggerRef,
    overlayRef,
    placement: requested,
    offset: offsetFor(context.offset, caret),
    containerPadding: CONTAINER_PADDING,
    isOpen: true,
  });
  const side = revealSide(placement, requested);
  const styles = tooltipStyles();
  return (
    <div
      {...overlayProps}
      ref={overlayRef}
      // Only React Aria's insets apply (styles/utilities.css).
      data-overlay-placement=""
      className={styles.positioner({ class: className })}
    >
      <div
        {...mergeProps(tooltipProps, exitProps)}
        // The component tokens' hook (tooltip-tokens.ts).
        data-tokens="md-comp-plain-tooltip"
        data-placement={side}
        data-exiting={isExiting || undefined}
        className={styles.panel({ class: classNames?.panel })}
      >
        {children}
        {caret && (
          <span
            aria-hidden="true"
            style={caretStyle(side, arrowProps)}
            className={styles.caret({ class: classNames?.caret })}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Rich */

export interface RichTooltipTriggerProps {
  /** The trigger (a library button), then a `<RichTooltip>`. */
  children: ReactNode;
  /**
   * A persistent rich tooltip opens when the trigger is pressed and stays, even after the
   * pointer leaves, until the trigger is pressed again, Escape, or a press anywhere outside it
   * (on another element or on empty space), or focus moving to another element. It's a
   * non-modal dialog: opening it leaves focus on the trigger, and it comes next in the Tab
   * order (trigger → its links and buttons → the rest of the page) without trapping focus.
   * A transient one (the spec's default) works like a plain tooltip: hover, focus
   * or a touch long press opens it, and it leaves 1.5s after the pointer or focus does.
   * @default false
   */
  persistent?: boolean;
  /** Bottom right of the anchor in left-to-right layouts (the spec). @default "bottom start" */
  placement?: TooltipPlacement;
  /** Distance from the anchor in px. @default 4 */
  offset?: number;
  /** Milliseconds of hover before a transient tooltip shows. @default 0 */
  delay?: number;
  /** Milliseconds before a transient tooltip hides after the pointer leaves. @default 1500 */
  closeDelay?: number;
  /** Whether the tooltip is shown (controlled). */
  isOpen?: boolean;
  /** Whether the tooltip starts shown when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the tooltip shows or hides. */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Shows a {@link RichTooltip} for its trigger. Transient by default (hover, keyboard focus or a
 * touch long press; it stays while hovered or focused within and leaves 1.5s later), or
 * `persistent`: opened by a press and kept until the trigger is pressed again, Escape, or a
 * press anywhere outside it. Focus stays on the trigger, and Tab moves on into the tooltip.
 * Use `persistent` when the tooltip holds actions keyboard users must reach.
 */
export function RichTooltipTrigger({ persistent = false, ...props }: RichTooltipTriggerProps) {
  return persistent ? <PersistentRichTrigger {...props} /> : <TransientRichTrigger {...props} />;
}

function PersistentRichTrigger({
  children,
  placement = 'bottom start',
  offset = DEFAULT_OFFSET,
  isOpen,
  defaultOpen,
  onOpenChange,
}: Omit<RichTooltipTriggerProps, 'persistent'>) {
  const state = useOverlayTriggerState({ isOpen, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, triggerRef);
  const triggerValue = useTriggerProps({
    ...(triggerProps as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...tooltip] = Children.toArray(children);
  return (
    <RichContext value={{ persistent: true, state, triggerRef, overlayProps, placement, offset }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {tooltip}
    </RichContext>
  );
}

function TransientRichTrigger({
  children,
  placement = 'bottom start',
  offset = DEFAULT_OFFSET,
  delay = 0,
  closeDelay = CLOSE_DELAY,
  isOpen,
  defaultOpen,
  onOpenChange,
}: Omit<RichTooltipTriggerProps, 'persistent'>) {
  const options = { delay, closeDelay, isOpen, defaultOpen, onOpenChange };
  const state = useTooltipTriggerState(options);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(options, state, triggerRef);
  const longPressProps = useTouchLongPress(
    () => state.open(true),
    () => state.close(),
    false,
  );
  const triggerValue = useTriggerProps({
    ...(mergeProps(triggerProps, longPressProps) as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...tooltip] = Children.toArray(children);
  return (
    <RichContext value={{ persistent: false, state, triggerRef, tooltipProps, placement, offset }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {tooltip}
    </RichContext>
  );
}

export interface RichTooltipClassNames {
  /** The visible surface: its colour, corners, padding, size and shadow. */
  panel?: string;
  /** The subhead. */
  title?: string;
  /** The supporting text. */
  text?: string;
  /** The row holding the action(s). */
  actions?: string;
  /** The caret pointing at the anchor. */
  caret?: string;
}

export interface RichTooltipProps {
  /** Supporting text. */
  children: ReactNode;
  /** Subhead; it also names a persistent tooltip. */
  title?: ReactNode;
  /** Action(s), usually a text `Button`. */
  action?: ReactNode;
  /** Name of a persistent tooltip when there is no `title`. */
  'aria-label'?: string;
  /** Draw a 16×8px caret pointing at the anchor. @default false */
  caret?: boolean;
  /**
   * Goes on the outermost element, which React Aria places against the anchor; the surface
   * inside keeps its size whatever layout class lands here. Style the surface with
   * `classNames.panel`.
   */
  className?: string;
  /** Classes for each part, by slot. */
  classNames?: RichTooltipClassNames;
}

/**
 * M3 rich tooltip: a subhead, supporting text and an optional action on
 * `surface-container`, inside a {@link RichTooltipTrigger}. A transient one is a
 * `role="tooltip"` describing its trigger; a persistent one is a non-modal popover dialog.
 *
 * @example
 * <RichTooltipTrigger>
 *   <Button variant="text">What's this?</Button>
 *   <RichTooltip title="Grouped tabs">Tabs with the same site stay together.</RichTooltip>
 * </RichTooltipTrigger>
 */
export function RichTooltip(props: RichTooltipProps) {
  const context = useContext(RichContext);
  if (!context) throw new Error('RichTooltip must be rendered inside a RichTooltipTrigger');
  const { isPresent, isExiting, exitProps } = usePresence(context.state.isOpen);
  if (!isPresent) return null;
  const shared = { isExiting, exitProps };
  return (
    // A persistent one handles its own Tab order and focus return (`useTabOrderAfterTrigger`):
    // the overlay's restoring focus scope would send Shift+Tab from its first control to
    // whatever precedes the trigger.
    <Overlay isExiting={isExiting} topLayer disableFocusManagement={context.persistent}>
      {context.persistent ? (
        <PersistentRichPopup {...props} {...shared} context={context} />
      ) : (
        <TransientRichPopup {...props} {...shared} context={context} />
      )}
    </Overlay>
  );
}

type PopupProps<Context> = RichTooltipProps & {
  context: Context;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
};

function PersistentRichPopup({
  context,
  isExiting,
  exitProps,
  ...props
}: PopupProps<Extract<RichContextValue, { persistent: true }>>) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const requested = usePhysicalPlacement(context.placement, context.triggerRef);
  const { state, triggerRef } = context;
  // The trigger toggles it itself: focus or a press moving to it isn't "outside".
  const isOutside = (element: Element | null) => !triggerRef.current?.contains(element);
  const { popoverProps, arrowProps, placement } = usePopover(
    {
      triggerRef,
      popoverRef,
      placement: requested,
      offset: offsetFor(context.offset, props.caret ?? false),
      containerPadding: CONTAINER_PADDING,
      isNonModal: true,
      isKeyboardDismissDisabled: false,
      shouldCloseOnInteractOutside: isOutside,
    },
    state,
  );
  // "They only disappear once a person interacts with another UI element": a press anywhere
  // else closes it, which a non-modal popover doesn't do on its own.
  useInteractOutside({
    ref: popoverRef,
    isDisabled: isExiting,
    onInteractOutside: (event) => {
      if (isOutside(event.target as Element | null)) state.close();
    },
  });
  useTabOrderAfterTrigger(popoverRef, triggerRef, state, isExiting);
  // A non-modal dialog (no `aria-modal`), named by its subhead. Not React Aria's `useDialog`,
  // which moves focus into it: focus stays on the trigger. `tabIndex={-1}` (not in the Tab
  // order) lets a press on its text take focus, so Escape still closes it then.
  const dialogProps = {
    role: 'dialog',
    tabIndex: -1,
    ...(props.title != null
      ? { 'aria-labelledby': titleId }
      : { 'aria-label': props['aria-label'] }),
  };
  return (
    <RichBody
      {...props}
      ref={popoverRef}
      titleId={titleId}
      positionProps={popoverProps}
      domProps={mergeProps(dialogProps, context.overlayProps, exitProps)}
      placement={revealSide(placement, requested)}
      arrowProps={arrowProps}
      isExiting={isExiting}
    />
  );
}

/**
 * Puts a persistent rich tooltip next in the Tab order after its trigger, though it's
 * portalled to the end of the document (the spec: focus goes parent element → link → button,
 * and people "move linearly through the rest of the page"). Tab from the trigger enters it,
 * Tab from its last control goes on to whatever follows the trigger, and Shift+Tab reverses
 * both. Escape on the trigger or inside closes it, putting focus back on the trigger.
 */
function useTabOrderAfterTrigger(
  popoverRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  state: OverlayTriggerState,
  isExiting: boolean,
) {
  useEffect(() => {
    if (isExiting) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const popover = popoverRef.current;
      const trigger = triggerRef.current;
      if (event.defaultPrevented || !popover || !trigger) return;
      const active = document.activeElement;
      const onTrigger = active === trigger;
      if (event.key === 'Escape' && (onTrigger || popover.contains(active))) {
        // Before any enclosing overlay (a dialog) sees it: the tooltip is on top.
        event.preventDefault();
        event.stopPropagation();
        state.close();
        trigger.focus();
        return;
      }
      if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
      const inside = tabbables(popover);
      if (inside.length === 0) return;
      // The first tabbable after the trigger in the page, leaving the tooltip out.
      const following = () =>
        tabbables(document.body, (el) => popover.contains(el) || trigger.contains(el)).find(
          (el) => trigger.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
        );
      let target: HTMLElement | undefined;
      if (!event.shiftKey) {
        if (onTrigger) target = inside[0];
        else if (active === inside.at(-1)) target = following();
      } else if (active === inside[0]) target = trigger;
      else if (active instanceof HTMLElement && active === following()) target = inside.at(-1);
      if (!target) return;
      event.preventDefault();
      target.focus();
    };
    // Capture: before the trigger's and the popover's own key handling.
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [popoverRef, triggerRef, state, isExiting]);
}

function TransientRichPopup({
  context,
  isExiting,
  exitProps,
  ...props
}: PopupProps<Extract<RichContextValue, { persistent: false }>>) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { state } = context;
  const { tooltipProps } = useTooltip(context.tooltipProps, state);
  const requested = usePhysicalPlacement(context.placement, context.triggerRef);
  const { overlayProps, arrowProps, placement } = useOverlayPosition({
    targetRef: context.triggerRef,
    overlayRef,
    placement: requested,
    offset: offsetFor(context.offset, props.caret ?? false),
    containerPadding: CONTAINER_PADDING,
    isOpen: true,
  });
  // It may hold an action: stay open while focus is inside, and leave after focus does.
  const focusProps = {
    onFocus: () => state.open(true),
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) state.close();
    },
  };
  return (
    <RichBody
      {...props}
      ref={overlayRef}
      titleId={titleId}
      positionProps={overlayProps}
      domProps={mergeProps(tooltipProps, focusProps, exitProps)}
      placement={revealSide(placement, requested)}
      arrowProps={arrowProps}
      isExiting={isExiting}
    />
  );
}

function RichBody({
  children,
  title,
  action,
  caret = false,
  className,
  classNames,
  ref,
  titleId,
  positionProps,
  domProps,
  placement,
  arrowProps,
  isExiting,
}: RichTooltipProps & {
  ref: RefObject<HTMLDivElement | null>;
  titleId: string;
  /** React Aria's placement, for the outermost element. */
  positionProps: HTMLAttributes<HTMLElement>;
  /** The surface's role, naming, focus and exit props. */
  domProps: HTMLAttributes<HTMLElement>;
  placement: string;
  arrowProps: HTMLAttributes<HTMLElement>;
  isExiting: boolean;
}) {
  const styles = richTooltipStyles({ subhead: title != null, action: action != null });
  return (
    <div
      {...positionProps}
      ref={ref}
      data-overlay-placement=""
      className={styles.positioner({ class: className })}
    >
      <div
        {...domProps}
        // The component tokens' hook (tooltip-tokens.ts).
        data-tokens="md-comp-rich-tooltip"
        data-placement={placement}
        data-exiting={isExiting || undefined}
        className={styles.panel({ class: classNames?.panel })}
      >
        {title != null && (
          <div
            id={titleId}
            data-slot="subhead"
            className={styles.title({ class: classNames?.title })}
          >
            {title}
          </div>
        )}
        <div data-slot="text" className={styles.text({ class: classNames?.text })}>
          {children}
        </div>
        {action != null && (
          <div className={styles.actions({ class: classNames?.actions })}>{action}</div>
        )}
        {caret && (
          <span
            aria-hidden="true"
            style={caretStyle(placement, arrowProps)}
            className={styles.caret({ class: classNames?.caret })}
          />
        )}
      </div>
    </div>
  );
}
