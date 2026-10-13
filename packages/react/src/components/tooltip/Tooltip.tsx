'use client';

import {
  Children,
  createContext,
  useContext,
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  mergeProps,
  useDialog,
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

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Compose: 4px from the anchor; a caret (8px) sits in the gap. */
const offsetFor = (caret: boolean) => (caret ? 12 : 4);

/** The caret points at the anchor from whichever side the tooltip ended up on. */
function caretStyle(placement: string | null | undefined, arrow: HTMLAttributes<HTMLElement>) {
  const side = (placement ?? 'top').split(' ')[0];
  const rotation = { top: 0, bottom: 180, left: -90, right: 90 }[side as TooltipPlacement] ?? 0;
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
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export interface TooltipTriggerProps {
  /** The trigger (a library button or anything reading `TriggerContext`), then a `<Tooltip>`. */
  children: ReactNode;
  /** Milliseconds of hover before showing (Compose shows at once). @default 0 */
  delay?: number;
  /** Milliseconds before hiding after the pointer leaves. @default 0 */
  closeDelay?: number;
  /** @default "top" */
  placement?: TooltipPlacement;
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Shows a plain {@link Tooltip} while its trigger is hovered or keyboard-focused. The
 * tooltip describes the trigger (`aria-describedby`), stays while the pointer is over it,
 * and Escape hides it.
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
  closeDelay = 0,
  placement = 'top',
  isDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
}: TooltipTriggerProps) {
  const options = { delay, closeDelay, isDisabled, isOpen, defaultOpen, onOpenChange };
  const state = useTooltipTriggerState(options);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(options, state, triggerRef);
  const triggerValue = useTriggerProps({
    ...(triggerProps as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...tooltip] = Children.toArray(children);
  return (
    <TooltipContext value={{ state, triggerRef, tooltipProps, placement }}>
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
    placement: context.placement as Placement,
    offset: offsetFor(caret),
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

interface RichContextValue {
  state: OverlayTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  overlayProps: HTMLAttributes<HTMLElement>;
  placement: TooltipPlacement;
}

const RichContext = createContext<RichContextValue | null>(null);

export interface RichTooltipTriggerProps {
  /** The trigger (a library button), then a `<RichTooltip>`. */
  children: ReactNode;
  /** @default "top" */
  placement?: TooltipPlacement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Opens a {@link RichTooltip} when its trigger is pressed; it stays until pressed again,
 * Escape or a press outside (Compose's persistent rich tooltip).
 */
export function RichTooltipTrigger({
  children,
  placement = 'top',
  isOpen,
  defaultOpen,
  onOpenChange,
}: RichTooltipTriggerProps) {
  const state = useOverlayTriggerState({ isOpen, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, triggerRef);
  const triggerValue = useTriggerProps({
    ...(triggerProps as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...tooltip] = Children.toArray(children);
  return (
    <RichContext value={{ state, triggerRef, overlayProps, placement }}>
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
  /** Subhead; it also names the tooltip. */
  title?: ReactNode;
  /** Action(s), usually a text `Button`. */
  action?: ReactNode;
  /** Name when there is no `title`. */
  'aria-label'?: string;
  caret?: boolean;
  className?: string;
  classNames?: RichTooltipClassNames;
}

/**
 * M3 rich tooltip: a subhead, supporting text and an optional action on
 * `surface-container`. A non-modal popover (it can hold actions), inside a
 * {@link RichTooltipTrigger}.
 *
 * @example
 * <RichTooltipTrigger>
 *   <Button variant="text">What's this?</Button>
 *   <RichTooltip title="Grouped tabs" action={<Button variant="text">Learn more</Button>}>
 *     Tabs with the same site stay together.
 *   </RichTooltip>
 * </RichTooltipTrigger>
 */
export function RichTooltip(props: RichTooltipProps) {
  const context = useContext(RichContext);
  if (!context) throw new Error('RichTooltip must be rendered inside a RichTooltipTrigger');
  const { isPresent, isExiting, exitProps } = usePresence(context.state.isOpen);
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting} topLayer>
      <RichPopup {...props} context={context} isExiting={isExiting} exitProps={exitProps} />
    </Overlay>
  );
}

function RichPopup({
  children,
  title,
  action,
  'aria-label': ariaLabel,
  caret = false,
  className,
  classNames,
  context,
  isExiting,
  exitProps,
}: RichTooltipProps & {
  context: RichContextValue;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { popoverProps, arrowProps, placement } = usePopover(
    {
      triggerRef: context.triggerRef,
      popoverRef,
      placement: context.placement as Placement,
      offset: offsetFor(caret),
      isNonModal: true,
      isKeyboardDismissDisabled: false,
    },
    context.state,
  );
  const { dialogProps } = useDialog(
    title != null ? { 'aria-labelledby': titleId } : { 'aria-label': ariaLabel },
    popoverRef,
  );
  const styles = richTooltipStyles({ spaced: title != null || action != null });
  return (
    <div
      {...mergeProps(popoverProps, dialogProps, context.overlayProps, exitProps)}
      ref={popoverRef}
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
