'use client';

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type DOMAttributes,
  type FocusEvent,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  mergeProps,
  useDialog,
  useLongPress,
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
  type TooltipTriggerState,
} from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import {
  TriggerContext,
  useTriggerProps,
  type TriggerContextValue,
} from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { richTooltipStyles, tooltipStyles } from './tooltip-styles';

/**
 * Where a tooltip sits against its anchor. `start` / `end` follow the text direction; a
 * second word aligns the tooltip with that edge of the anchor (`bottom start` sits below,
 * extending towards the end). Tooltips flip when there's no room.
 */
export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'start'
  | 'end'
  | 'top start'
  | 'top end'
  | 'bottom start'
  | 'bottom end';

/**
 * The spec: 4px from an anchor with a visual boundary (a button), 8px from one without (text).
 * A caret (8px) sits in the gap.
 */
const DEFAULT_OFFSET = 4;
const offsetFor = (offset: number, caret: boolean) => offset + (caret ? 8 : 0);

/** Tooltips move off the screen edge in 8px steps (the spec), so keep 8px from it. */
const CONTAINER_PADDING = 8;

/** "Both plain and rich tooltips disappear 1.5 seconds after navigating away." */
const CLOSE_DELAY = 1500;

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
 * The spec's touch trigger: "tap and hold the element on mobile". A touch long press opens
 * the tooltip (without pressing the button), and it closes 1.5s after the finger lifts.
 */
function useTouchLongPress(
  open: () => void,
  close: () => void,
  isDisabled: boolean | undefined,
): DOMAttributes<HTMLElement> {
  const release = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      if (release.current) window.removeEventListener('pointerup', release.current);
    },
    [],
  );
  const { longPressProps } = useLongPress({
    isDisabled,
    pointerType: 'touch',
    onLongPress: () => {
      open();
      if (release.current) window.removeEventListener('pointerup', release.current);
      const onRelease = () => {
        release.current = null;
        close();
      };
      release.current = onRelease;
      window.addEventListener('pointerup', onRelease, { once: true });
    },
  });
  // Only the pointer side: its keyboard handling would compete with the trigger's own.
  return { onPointerDown: longPressProps.onPointerDown };
}

/** The caret points at the anchor from whichever side the tooltip ended up on. */
function caretStyle(placement: string | null | undefined, arrow: HTMLAttributes<HTMLElement>) {
  const side = (placement ?? 'top').split(' ')[0];
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

interface TooltipContextValue {
  state: TooltipTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  tooltipProps: HTMLAttributes<HTMLElement>;
  placement: TooltipPlacement;
  offset: number;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export interface TooltipTriggerProps {
  /** The trigger (a library button or anything reading `TriggerContext`), then a `<Tooltip>`. */
  children: ReactNode;
  /** Milliseconds of hover before showing (Compose shows at once). @default 0 */
  delay?: number;
  /** Milliseconds before hiding after the pointer leaves or a touch lifts (the spec's 1.5s). @default 1500 */
  closeDelay?: number;
  /** @default "top" */
  placement?: TooltipPlacement;
  /** Distance from the anchor in px: 4 for an anchor with a visual boundary, 8 for text. @default 4 */
  offset?: number;
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Shows a plain {@link Tooltip} while its trigger is hovered or keyboard-focused, or after a
 * touch long press. The tooltip describes the trigger (`aria-describedby`), stays while the
 * pointer is over it and for 1.5s after it leaves, and Escape hides it.
 *
 * @example
 * <TooltipTrigger>
 *   <IconButton icon={<StarIcon />} aria-label="Favourite" />
 *   <Tooltip>Add to favourites</Tooltip>
 * </TooltipTrigger>
 */
export function TooltipTrigger({
  children,
  delay = 0,
  closeDelay = CLOSE_DELAY,
  placement = 'top',
  offset = DEFAULT_OFFSET,
  isDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
}: TooltipTriggerProps) {
  const options = { delay, closeDelay, isDisabled, isOpen, defaultOpen, onOpenChange };
  const state = useTooltipTriggerState(options);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(options, state, triggerRef);
  const longPressProps = useTouchLongPress(
    () => state.open(true),
    () => state.close(),
    isDisabled,
  );
  const triggerValue = useTriggerProps({
    ...(mergeProps(triggerProps, longPressProps) as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...tooltip] = Children.toArray(children);
  return (
    <TooltipContext value={{ state, triggerRef, tooltipProps, placement, offset }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {tooltip}
    </TooltipContext>
  );
}

export interface TooltipClassNames {
  root?: string;
  caret?: string;
}

export interface TooltipProps {
  children: ReactNode;
  /** Draw a 16×8px caret pointing at the anchor. */
  caret?: boolean;
  className?: string;
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
  const { overlayProps, arrowProps, placement } = useOverlayPosition({
    targetRef: context.triggerRef,
    overlayRef,
    placement: usePhysicalPlacement(context.placement, context.triggerRef),
    offset: offsetFor(context.offset, caret),
    containerPadding: CONTAINER_PADDING,
    isOpen: true,
  });
  const styles = tooltipStyles();
  return (
    <div
      {...mergeProps(overlayProps, tooltipProps, exitProps)}
      ref={overlayRef}
      data-placement={placement ?? undefined}
      data-exiting={isExiting || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {children}
      {caret && (
        <span
          aria-hidden="true"
          style={caretStyle(placement, arrowProps)}
          className={styles.caret({ class: classNames?.caret })}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- Rich */

type RichContextValue = {
  triggerRef: RefObject<HTMLElement | null>;
  placement: TooltipPlacement;
  offset: number;
} & (
  | { persistent: true; state: OverlayTriggerState; overlayProps: HTMLAttributes<HTMLElement> }
  | { persistent: false; state: TooltipTriggerState; tooltipProps: HTMLAttributes<HTMLElement> }
);

const RichContext = createContext<RichContextValue | null>(null);

export interface RichTooltipTriggerProps {
  /** The trigger (a library button), then a `<RichTooltip>`. */
  children: ReactNode;
  /**
   * A persistent rich tooltip opens when the trigger is pressed and stays until it's pressed
   * again, Escape or a press outside; it's a non-modal dialog whose actions keyboard users
   * can reach. A transient one (the spec's default) works like a plain tooltip: hover, focus
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
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Shows a {@link RichTooltip} for its trigger. Transient by default (hover, keyboard focus or a
 * touch long press; it stays while hovered or focused within and leaves 1.5s later), or
 * `persistent`: opened by a press and kept until pressed again, Escape or a press outside.
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
  root?: string;
  title?: string;
  text?: string;
  actions?: string;
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
  caret?: boolean;
  className?: string;
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
    <Overlay isExiting={isExiting} topLayer>
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
  const { popoverProps, arrowProps, placement } = usePopover(
    {
      triggerRef: context.triggerRef,
      popoverRef,
      placement: usePhysicalPlacement(context.placement, context.triggerRef),
      offset: offsetFor(context.offset, props.caret ?? false),
      containerPadding: CONTAINER_PADDING,
      isNonModal: true,
      isKeyboardDismissDisabled: false,
    },
    context.state,
  );
  const { dialogProps } = useDialog(
    props.title != null ? { 'aria-labelledby': titleId } : { 'aria-label': props['aria-label'] },
    popoverRef,
  );
  return (
    <RichBody
      {...props}
      ref={popoverRef}
      titleId={titleId}
      domProps={mergeProps(popoverProps, dialogProps, context.overlayProps, exitProps)}
      placement={placement}
      arrowProps={arrowProps}
      isExiting={isExiting}
    />
  );
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
  const { overlayProps, arrowProps, placement } = useOverlayPosition({
    targetRef: context.triggerRef,
    overlayRef,
    placement: usePhysicalPlacement(context.placement, context.triggerRef),
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
      domProps={mergeProps(overlayProps, tooltipProps, focusProps, exitProps)}
      placement={placement}
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
  domProps,
  placement,
  arrowProps,
  isExiting,
}: RichTooltipProps & {
  ref: RefObject<HTMLDivElement | null>;
  titleId: string;
  domProps: HTMLAttributes<HTMLElement>;
  placement: string | null | undefined;
  arrowProps: HTMLAttributes<HTMLElement>;
  isExiting: boolean;
}) {
  const styles = richTooltipStyles({ subhead: title != null, action: action != null });
  return (
    <div
      {...domProps}
      ref={ref}
      data-placement={placement ?? undefined}
      data-exiting={isExiting || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {title != null && (
        <div id={titleId} className={styles.title({ class: classNames?.title })}>
          {title}
        </div>
      )}
      <div className={styles.text({ class: classNames?.text })}>{children}</div>
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
  );
}
