'use client';

import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type RefObject,
  type CSSProperties,
  type DOMAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  useDialog,
  useFocusRing,
  useModalOverlay,
  useObjectRef,
  useOverlayTrigger,
  type AriaDialogProps,
} from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import {
  TriggerContext,
  useTriggerProps,
  type TriggerContextValue,
} from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { firstTabbable } from '../../utils/focus';
import { useWarnOnce } from '../../utils/warn-once';
import { IconButton } from '../icon-button/IconButton';
import { DIALOG_ROOT_STYLE, dialogStyles } from './dialog-styles';

/** Material Symbols "close" (Apache-2.0). */
function CloseIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

/**
 * When a dialog fills the window (the M3 full-screen dialog): `never`, `always`, or
 * `compact` for windows narrower than 600px only, the M3 recommendation.
 */
export type DialogFullScreen = 'never' | 'always' | 'compact';

/**
 * How a basic dialog enters and leaves: `reveal`, the M3 dialog motion, or `scale`, the
 * original pop (a fade with a scale from 90%).
 */
export type DialogTransition = 'reveal' | 'scale';

/** Where a basic dialog sits in the window, keeping the spec's 56px margin on wider windows. */
export type DialogPlacement = 'center' | 'top' | 'bottom' | 'start' | 'end';

/**
 * What a full-screen dialog grows out of (a container transform): `"trigger"` for the
 * `DialogTrigger`'s button, an element such as a FAB, or a box in window coordinates.
 */
export type DialogOrigin = 'trigger' | Element | DOMRectReadOnly;

interface DialogTriggerContextValue {
  state: OverlayTriggerState;
  /** Links the dialog to its trigger (`aria-controls`). */
  overlayProps: { id?: string };
  /** The trigger, for `origin="trigger"`. */
  triggerRef: RefObject<HTMLElement | null>;
}

/** Where a container transform starts, measured from its origin. */
interface OriginBox {
  /** The origin's box and corners as a `clip-path` of the window. */
  clip: string;
  /** The origin's container colour, or the dialog's own when it has none. */
  color: string;
}

/** How browsers serialise a computed `transparent`. */
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** A corner radius in px; a percentage resolves against the origin's shorter side. */
function cornerRadius(value: string, rect: DOMRectReadOnly): string {
  if (!value.endsWith('%')) return value || '0px';
  return `${(parseFloat(value) / 100) * Math.min(rect.width, rect.height)}px`;
}

/** The origin's box as insets from the window (the full-screen dialog's box). */
function measureOrigin(origin: Element | DOMRectReadOnly): OriginBox {
  const isElement = origin instanceof Element;
  const rect = isElement ? origin.getBoundingClientRect() : origin;
  const style = isElement ? getComputedStyle(origin) : null;
  const radius = cornerRadius(style?.borderTopLeftRadius ?? '0px', rect);
  const top = rect.top;
  const left = rect.left;
  const right = window.innerWidth - rect.right;
  const bottom = window.innerHeight - rect.bottom;
  const background = style?.backgroundColor ?? TRANSPARENT;
  return {
    clip: `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius})`,
    color: background === TRANSPARENT ? 'var(--md-sys-color-surface-container-high)' : background,
  };
}

const DialogTriggerContext = createContext<DialogTriggerContextValue | null>(null);

/**
 * Calls `onOpened` once the enter motion has finished: every CSS transition running on the
 * scrim, the motion wrapper, the panel and the panel's parts when they first render. Styles
 * are read on the first frame, so the `@starting-style` transitions have begun. A transition
 * cut short (the dialog closes while entering) never finishes, so a dialog that closes early
 * doesn't report opening.
 */
function useOpened(
  scrimRef: RefObject<HTMLElement | null>,
  motionRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  onOpened: (() => void) | undefined,
) {
  const latest = useRef(onOpened);
  useLayoutEffect(() => {
    latest.current = onOpened;
  });
  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      const elements = [scrimRef.current, motionRef.current, panel, ...(panel?.children ?? [])];
      const transitions = elements.flatMap((element) => {
        if (!element || typeof element.getAnimations !== 'function') return [];
        // Reading a style starts the transitions that haven't started yet.
        void getComputedStyle(element).opacity;
        return element.getAnimations().filter((animation) => 'transitionProperty' in animation);
      });
      Promise.all(transitions.map((transition) => transition.finished)).then(
        () => {
          if (active) latest.current?.();
        },
        () => undefined,
      );
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [scrimRef, motionRef, panelRef]);
}

interface DialogPartsContextValue {
  titleProps: DOMAttributes<HTMLElement>;
  /** The id an alert dialog's description (`DialogContent`) takes. */
  contentProps: DOMAttributes<HTMLElement>;
  hasIcon: boolean;
  fullScreen: DialogFullScreen;
  close: () => void;
  /** `DialogContent` reports that it's there, so the dialog is described by it. */
  setHasContent: (has: boolean) => void;
  /** `DialogHeader` reports whether it holds the confirming action. */
  setHeaderAction: (has: boolean) => void;
  /** Full screen without a header action: `DialogActions` become a bottom bar. */
  bottomBar: boolean;
}

const DialogPartsContext = createContext<DialogPartsContextValue>({
  titleProps: {},
  contentProps: {},
  hasIcon: false,
  fullScreen: 'never',
  close: () => undefined,
  setHasContent: () => undefined,
  setHeaderAction: () => undefined,
  bottomBar: false,
});

export interface DialogTriggerProps {
  /** The trigger (a Button, IconButton, …) followed by the `Dialog`. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Opens a `Dialog` from a button. The first child is the trigger (any button-like
 * component); the rest is the dialog.
 *
 * @example
 * <DialogTrigger>
 *   <Button>Delete</Button>
 *   <Dialog>…</Dialog>
 * </DialogTrigger>
 */
export function DialogTrigger({ children, open, defaultOpen, onOpenChange }: DialogTriggerProps) {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, triggerRef);
  const triggerValue = useTriggerProps({
    ...(triggerProps as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...dialog] = Children.toArray(children);
  return (
    <DialogTriggerContext value={{ state, overlayProps, triggerRef }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {dialog}
    </DialogTriggerContext>
  );
}

export interface DialogClassNames {
  /** The dimmed layer behind the dialog. */
  scrim?: string;
  /**
   * The fixed, full-window flex box that places the dialog. It pads 24px on compact windows
   * and 56px from the medium breakpoint, and `placement` sets its alignment, so alignment
   * classes here (`items-*`, `justify-*`) position the dialog anywhere within the spec's
   * margin, and padding classes change that margin.
   */
  positioner?: string;
  /** The dialog's surface: its colour, corners, padding, size and shadow. */
  panel?: string;
  /** The icon above the title. */
  icon?: string;
}

export interface DialogRenderProps {
  /** Closes the dialog. */
  close: () => void;
}

export interface DialogProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'>, Omit<AriaDialogProps, 'role'> {
  /** Controlled open state, when not inside a `DialogTrigger`. */
  open?: boolean;
  /** Initial open state when uncontrolled, when not inside a `DialogTrigger`. @default false */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Basic dialogs are alert dialogs on the web (the spec): they need a decision, are
   * described by their `DialogContent`, and aren't dismissed by pressing outside. A dialog
   * that can be full screen is a `dialog`.
   * @default "alertdialog", or "dialog" when fullScreen isn't "never"
   */
  role?: 'dialog' | 'alertdialog';
  /** Closes when pressing outside the dialog. @default true, or false for an alertdialog */
  dismissable?: boolean;
  /** Prevents Escape from closing the dialog. @default false */
  keyboardDismissDisabled?: boolean;
  /** Icon above the title (which is then centred). Decorative. Not shown in full screen. */
  icon?: ReactNode;
  /**
   * Fills the window, with a `DialogHeader` holding the close button, title and confirming
   * action instead of `DialogActions` (or with them as a bottom bar when the header has no
   * action). `compact`, the spec's recommendation, does so only below 600px; `always` fills
   * every window. @default "never"
   */
  fullScreen?: DialogFullScreen;
  /**
   * Grows the full-screen dialog out of this origin and shrinks it back into it on close,
   * the spec's container transform from a FAB: `"trigger"` (the `DialogTrigger`'s button),
   * an element, or a box in window coordinates. The clip, corners and container colour
   * move from the origin to the window on the slow spatial spring and the content fades
   * in; reduced motion keeps only the fades. Used only while the dialog is full screen.
   */
  origin?: DialogOrigin;
  /**
   * Where a basic dialog sits: centred (the spec's default) or against one side of the
   * window, keeping 24px from its edges on compact windows and 56px on wider ones. For any
   * other position, align it with `classNames.positioner` (for example
   * `"items-start justify-end"` for the top end corner). It also sets the motion's
   * direction: centred or at the top the dialog slides down and grows downward as it
   * enters, at the bottom up, and at the start or end along the x axis (mirrored in
   * right-to-left layouts).
   * @default "center"
   */
  placement?: DialogPlacement;
  children?: ReactNode | ((props: DialogRenderProps) => ReactNode);
  /**
   * Classes for the dialog's parts, merged over the library's: `scrim`, `positioner` (the
   * full-window box that places the dialog; align it anywhere with `items-*` and
   * `justify-*`), `panel` (the surface) and `icon`.
   */
  classNames?: DialogClassNames;
  /** Goes on the outermost element, with `className`. */
  style?: CSSProperties;
  /**
   * How a basic dialog enters and leaves. `reveal` is the M3 dialog motion: it slides 50px
   * away from the edge it sits against while its container grows from that edge, and its
   * headline and content, then its actions, fade in. `scale` is the library's original pop,
   * an extension beyond the M3 motion: the dialog fades in while it scales up from 90%, and
   * fades out while it scales to 95%, from the centre (`placement="center"`) or from the edge
   * it sits against. Either way reduced motion keeps only the fades and `quick` turns the
   * motion off. A full-screen dialog keeps its own motion and ignores it.
   * @default "reveal"
   */
  transition?: DialogTransition;
  /**
   * Skips the enter and exit motion: the dialog, its parts and the scrim appear and leave at
   * once, and the dialog leaves the document as soon as it closes. Reduced motion already
   * keeps only the fades. @default false
   */
  quick?: boolean;
  /**
   * Called when the dialog has finished opening: once its enter motion (the slide, the
   * container's growth and every part's fade) has ended, or right after it opens with
   * `quick`. Not called when it closes before then.
   */
  onOpened?: () => void;
  /**
   * Called when the dialog has finished closing: once its exit motion has ended and it has
   * left the document, or right after it closes with `quick`.
   */
  onClosed?: () => void;
}

/**
 * M3 basic dialog: a modal panel over a scrim, rendered in a portal that keeps the
 * surrounding theme. It's an alert dialog (described by its `DialogContent`). Focus moves
 * to its first interactive element (or one marked `autoFocus`), is contained, and is
 * restored on close; Escape closes it; the page behind does not scroll and is hidden from
 * assistive tech. Name it with a `DialogTitle` (or `aria-label`).
 *
 * It enters with the M3 dialog motion: it slides 50px away from the window edge it sits
 * against while its container grows from that edge, then its headline and content fade in,
 * then its actions; it leaves by fading its parts, sliding back and shrinking, then fading.
 * Any children take part: the actions phase is for `DialogActions` (or any child with
 * `data-slot="actions"`), and every other child fades in with the content. `onOpened` and
 * `onClosed` report the end of each motion; `quick` turns it off.
 *
 * `className` and `style` go on the outermost element, a full-window layer around the
 * positioner whose inline placement they can't move, so a layout class (`static`,
 * `overflow-hidden`, a transform) never hides, clips or stretches the dialog; style the
 * surface with `classNames.panel`. `ref` and other attributes go on the dialog panel.
 *
 * @example
 * <Dialog icon={<DeleteIcon />}>
 *   {({ close }) => (
 *     <>
 *       <DialogTitle>Delete 3 files?</DialogTitle>
 *       <DialogContent>They will be removed from all devices.</DialogContent>
 *       <DialogActions>
 *         <Button variant="text" onPress={close}>Cancel</Button>
 *         <Button variant="text" onPress={remove}>Delete</Button>
 *       </DialogActions>
 *     </>
 *   )}
 * </Dialog>
 */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  origin,
  onClosed,
  ...props
}: DialogProps) {
  const trigger = useContext(DialogTriggerContext);
  const ownState = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const state = trigger?.state ?? ownState;
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen, 'opacity', !props.quick);
  const onClosedRef = useRef(onClosed);
  useLayoutEffect(() => {
    onClosedRef.current = onClosed;
  });
  const wasPresent = useRef(isPresent);
  useEffect(() => {
    if (wasPresent.current && !isPresent) onClosedRef.current?.();
    wasPresent.current = isPresent;
  }, [isPresent]);
  const usesOrigin = origin !== undefined && (props.fullScreen ?? 'never') !== 'never';
  // The origin is measured before the dialog is in the document (a layout effect, then a
  // synchronous re-render before paint), so the dialog's first style already starts on the
  // origin; and again as it closes, in case the origin moved. `box` is null when there's
  // nothing to measure (`"trigger"` outside a `DialogTrigger`).
  const [measured, setMeasured] = useState<{ box: OriginBox | null } | null>(null);
  if (!isPresent && measured !== null) setMeasured(null);
  const triggerRef = trigger?.triggerRef;
  const isOpen = state.isOpen;
  useLayoutEffect(() => {
    if (!usesOrigin || !isPresent) return;
    const target = origin === 'trigger' ? triggerRef?.current : origin;
    setMeasured({ box: target ? measureOrigin(target) : null });
  }, [usesOrigin, origin, triggerRef, isOpen, isPresent]);
  if (!isPresent || (usesOrigin && measured === null)) return null;
  return (
    <Overlay isExiting={isExiting}>
      <DialogModal
        {...props}
        state={state}
        isExiting={isExiting}
        exitProps={exitProps}
        triggerOverlayProps={trigger?.overlayProps}
        originBox={usesOrigin ? (measured?.box ?? null) : null}
      />
    </Overlay>
  );
}

function DialogModal({
  state,
  isExiting,
  exitProps,
  triggerOverlayProps,
  originBox,
  role: roleProp,
  dismissable,
  keyboardDismissDisabled,
  icon,
  fullScreen = 'never',
  placement = 'center',
  quick = false,
  transition = 'reveal',
  onOpened,
  children,
  className,
  classNames,
  style,
  ref,
  ...rest
}: Omit<DialogProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'onClosed'> & {
  state: OverlayTriggerState;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  triggerOverlayProps?: { id?: string };
  originBox: OriginBox | null;
}) {
  const role = roleProp ?? (fullScreen === 'never' ? 'alertdialog' : 'dialog');
  const panelRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const motionRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  useOpened(scrimRef, motionRef, panelRef, onOpened);
  const [hasContent, setHasContent] = useState(false);
  const [headerAction, setHeaderAction] = useState(false);
  const { modalProps, underlayProps } = useModalOverlay(
    {
      isDismissable: (dismissable ?? role !== 'alertdialog') && !isExiting,
      isKeyboardDismissDisabled: keyboardDismissDisabled,
    },
    state,
    panelRef,
  );
  const { dialogProps, titleProps, contentProps } = useDialog({ ...rest, role }, panelRef);
  // An alert dialog is described by its content; leave the reference out when there's none.
  const describedBy =
    rest['aria-describedby'] ?? (hasContent ? dialogProps['aria-describedby'] : undefined);

  // The spec: "focus should automatically land on the first interactive element within the
  // dialog". `useDialog` focuses the panel itself unless something inside took focus
  // (`autoFocus`); move on from the panel to its first interactive element. A scrolling
  // `DialogContent` is focusable (so the keyboard can scroll it) but isn't a control.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || document.activeElement !== panel) return;
    firstTabbable(panel, (el) => el.hasAttribute('data-scrollable'))?.focus();
  }, [panelRef]);

  const hasIcon = fullScreen !== 'always' && icon !== undefined && icon !== null;
  const bottomBar = fullScreen !== 'never' && !headerAction;
  const origin = originBox !== null;
  const styles = dialogStyles({
    hasIcon,
    fullScreen,
    placement,
    bottomBar,
    origin,
    quick,
    transition,
  });
  const exiting = isExiting || undefined;

  return (
    <>
      <div
        ref={scrimRef}
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div style={{ ...style, ...DIALOG_ROOT_STYLE }} className={styles.root({ class: className })}>
        <div {...underlayProps} className={styles.positioner({ class: classNames?.positioner })}>
          <div
            {...exitProps}
            ref={motionRef}
            data-exiting={exiting}
            style={
              originBox
                ? ({
                    '--m3-dialog-origin': originBox.clip,
                    '--m3-dialog-origin-color': originBox.color,
                  } as CSSProperties)
                : undefined
            }
            className={styles.motion()}
          >
            <div
              {...mergeProps(rest, triggerOverlayProps ?? {}, modalProps, dialogProps)}
              aria-describedby={describedBy}
              ref={panelRef}
              data-exiting={exiting}
              // The component tokens' hook (dialog-tokens.ts).
              data-tokens="md-comp-dialog"
              data-full-screen={fullScreen === 'never' ? undefined : fullScreen}
              data-origin={origin || undefined}
              className={styles.panel({
                class: [transition === 'reveal' && styles.parts(), classNames?.panel],
              })}
            >
              <TriggerContext value={null}>
                <DialogPartsContext
                  value={{
                    titleProps,
                    contentProps,
                    hasIcon,
                    fullScreen,
                    close: state.close,
                    setHasContent,
                    setHeaderAction,
                    bottomBar,
                  }}
                >
                  {hasIcon && (
                    <span
                      aria-hidden="true"
                      data-slot="icon"
                      className={styles.icon({
                        class: cn(
                          fullScreen === 'compact' && 'max-medium:hidden',
                          classNames?.icon,
                        ),
                      })}
                    >
                      {icon}
                    </span>
                  )}
                  {typeof children === 'function' ? children({ close: state.close }) : children}
                </DialogPartsContext>
              </TriggerContext>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export type DialogTitleProps = ComponentPropsWithRef<'h2'>;

/**
 * The dialog's headline; it also names the dialog for assistive tech. In a dialog that can
 * be full screen, use `DialogHeader` instead.
 */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const { titleProps, hasIcon } = useContext(DialogPartsContext);
  return (
    <h2
      {...mergeProps(titleProps, props)}
      data-slot="title"
      className={dialogStyles({ hasIcon }).title({ class: className })}
    />
  );
}

export interface DialogHeaderClassNames {
  /** The header row; `className` is merged here too. */
  root?: string;
  /** The close button. */
  close?: string;
  /** The headline. */
  title?: string;
}

export interface DialogHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** The headline; it names the dialog. */
  children: ReactNode;
  /** Accessible name of the close button. */
  closeLabel: string;
  /**
   * The confirming action, usually a text `Button` ("Save"). Shown in full screen only;
   * without it, a full-screen dialog shows its `DialogActions` as a bottom bar.
   */
  action?: ReactNode;
  /** A 1px `outline-variant` divider under the full-screen header. @default false */
  divider?: boolean;
  /** Classes for each part, by slot. */
  classNames?: DialogHeaderClassNames;
}

/**
 * The headline of a dialog that can be full screen. In full screen it is the M3 full-screen
 * dialog's header: a close icon button, the headline and the confirming action. Otherwise
 * it is a plain `DialogTitle`, and the dialog's `DialogActions` carry the actions.
 *
 * @example
 * <Dialog fullScreen="compact">
 *   <DialogHeader closeLabel="Close" action={<Button variant="text" onPress={save}>Save</Button>}>
 *     Edit name
 *   </DialogHeader>
 *   <DialogContent>…</DialogContent>
 *   <DialogActions>…</DialogActions>
 * </Dialog>
 */
export function DialogHeader({
  children,
  closeLabel,
  action,
  divider = false,
  className,
  classNames,
  ...props
}: DialogHeaderProps) {
  const { titleProps, hasIcon, fullScreen, close, setHeaderAction } =
    useContext(DialogPartsContext);
  const hasAction = action !== undefined;
  useLayoutEffect(() => {
    setHeaderAction(hasAction);
    return () => setHeaderAction(false);
  }, [hasAction, setHeaderAction]);
  const styles = dialogStyles({ hasIcon, fullScreen, divider });
  return (
    <div {...props} className={styles.header({ class: cn(classNames?.root, className) })}>
      {fullScreen !== 'never' && (
        <IconButton
          variant="standard"
          icon={<CloseIcon />}
          aria-label={closeLabel}
          onPress={close}
          className={styles.headerButton({ class: cn(styles.close(), classNames?.close) })}
        />
      )}
      <h2 {...titleProps} data-slot="title" className={styles.title({ class: classNames?.title })}>
        {children}
      </h2>
      {fullScreen !== 'never' && action !== undefined && (
        <div className={styles.headerButton()}>{action}</div>
      )}
    </div>
  );
}

export interface DialogContentProps extends ComponentPropsWithRef<'div'> {
  /**
   * The basic dialog's optional dividers: 1px `outline-variant` lines across the panel
   * above and below the content, e.g. around a scrolling list. Not drawn in full screen.
   * @default false
   */
  dividers?: boolean;
}

/**
 * Whether an element's content is taller than its box, from a `ResizeObserver` on it and
 * its children (so it is measured only when a size changes).
 */
function useOverflows(ref: RefObject<HTMLElement | null>) {
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() =>
      setOverflows(element.scrollHeight > element.clientHeight + 1),
    );
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [ref]);
  return overflows;
}

/**
 * The dialog's supporting text or content; scrolls when the dialog is too tall. It describes
 * an alert dialog. While it scrolls it is focusable (with a focus ring), so the keyboard can
 * scroll it (`data-scrollable`); the dialog's initial focus still goes to its first control.
 */
export function DialogContent({ className, dividers = false, ref, ...props }: DialogContentProps) {
  const { fullScreen, contentProps, setHasContent } = useContext(DialogPartsContext);
  const contentRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const overflows = useOverflows(contentRef);
  const { isFocusVisible, focusProps } = useFocusRing();
  useLayoutEffect(() => {
    setHasContent(true);
    return () => setHasContent(false);
  }, [setHasContent]);
  return (
    <div
      {...mergeProps(contentProps, overflows ? focusProps : {}, props)}
      ref={contentRef}
      tabIndex={props.tabIndex ?? (overflows ? 0 : undefined)}
      data-scrollable={overflows || undefined}
      data-focus-visible={(overflows && isFocusVisible) || undefined}
      data-slot="content"
      className={dialogStyles({ fullScreen, dividers }).content({ class: className })}
    />
  );
}

export type DialogActionsProps = ComponentPropsWithRef<'div'>;

/** The elements among `children`, counting a fragment's children rather than the fragment. */
function countActions(children: ReactNode): number {
  let count = 0;
  Children.forEach(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return;
    count += child.type === Fragment ? countActions(child.props.children) : 1;
  });
  return count;
}

/**
 * Row of actions at the end of the dialog, 8px apart. Put the confirming action last:
 * when the actions do not fit on one line they stack with it on top. While the dialog is
 * full screen they're hidden when `DialogHeader` carries the confirming action, and
 * otherwise form the spec's 56px bottom action bar. Use at most two actions (the spec); in
 * development it warns once when it holds more.
 */
export function DialogActions({ className, children, ...props }: DialogActionsProps) {
  const { fullScreen, bottomBar } = useContext(DialogPartsContext);
  const actionCount = countActions(children);
  useWarnOnce(
    actionCount > 2,
    `[@windmorph/react] DialogActions holds ${actionCount} actions; M3 dialogs have at most two ` +
      '(no third such as "Learn more"). Show more inline, or before the dialog opens.',
  );
  return (
    <div
      {...props}
      data-slot="actions"
      className={dialogStyles({ fullScreen, bottomBar }).actions({ class: className })}
    >
      {children}
    </div>
  );
}
