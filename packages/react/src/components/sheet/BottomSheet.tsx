'use client';

import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  useDialog,
  useFocusRing,
  useModalOverlay,
  useObjectRef,
  type AriaDialogProps,
} from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import { TriggerContext } from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { IconButton } from '../icon-button/IconButton';
import { CloseIcon, CollapseIcon } from './sheet-icons';
import { settleTarget } from './sheet-settle';
import { bottomSheetStyles } from './sheet-styles';
import { SheetTriggerContext } from './SheetTrigger';

export interface BottomSheetClassNames {
  /** The library-owned wrapper that positions and moves the sheet. */
  container?: string;
  scrim?: string;
  panel?: string;
  handle?: string;
  /** The row holding the close (modal) or collapse (standard) button. */
  closeRow?: string;
  closeButton?: string;
  content?: string;
}

/** Words the bottom sheet announces. */
export interface BottomSheetLabels {
  /** The drag handle while the sheet is half open or collapsed (it expands the sheet). */
  expand: string;
  /** The drag handle and collapse button of a fully open standard sheet. */
  collapse: string;
  /** The drag handle of a fully open modal sheet (it closes the sheet). */
  dismiss: string;
  /** The close button of a modal sheet that fills the window height. */
  close: string;
}

const DEFAULT_LABELS: BottomSheetLabels = {
  expand: 'Expand sheet',
  collapse: 'Collapse sheet',
  dismiss: 'Close sheet',
  close: 'Close',
};

/** The interactive strip at the top of a sheet without a drag handle (m3.material.io). */
const DRAG_ZONE = 48;
/** How far a pointer moves before a press becomes a drag. */
const DRAG_SLOP = 4;

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface BottomSheetOwnProps {
  /**
   * `modal` opens over a scrim as a dialog that blocks the page; `standard` sits over the
   * page without a scrim, so both can be used at once, and rests collapsed at
   * `peekHeight`. @default "modal"
   */
  variant?: 'modal' | 'standard';
  open?: boolean;
  /** @default false (modal), true (standard) */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show the drag handle. Without it, the top 48px of the sheet still drags. @default true */
  dragHandle?: boolean;
  /**
   * Open fully instead of to half the window when the content is taller than half the
   * window (modal). @default false
   */
  skipPartiallyExpanded?: boolean;
  /** Height of a collapsed standard sheet, px. @default 56 */
  peekHeight?: number;
  /** Pressing the scrim closes the sheet (modal). @default true */
  dismissable?: boolean;
  /**
   * While the sheet fills the window height, show a close button (modal) or a collapse
   * button (standard) at its top end. @default true
   */
  closeButton?: boolean;
  /** Replaces the close button's icon. */
  closeIcon?: ReactElement;
  /** Replaces the collapse button's icon. */
  collapseIcon?: ReactElement;
  /** Words the sheet announces, with English defaults. */
  labels?: Partial<BottomSheetLabels>;
  children?: ReactNode | ((props: { close: () => void }) => ReactNode);
  classNames?: BottomSheetClassNames;
}

export type BottomSheetProps = BottomSheetOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof BottomSheetOwnProps | 'aria-label' | 'aria-labelledby'>;

/**
 * M3 bottom sheet. A `modal` sheet slides up over a scrim, opening to half the window when
 * its content is taller (drag the handle up, or press it, to expand), and closes on a drag
 * down, a press on the scrim or Escape (which first returns a fully open sheet to half). A
 * `standard` sheet sits over the page without a scrim, collapsed to `peekHeight` until it
 * is expanded.
 *
 * @example
 * <SheetTrigger>
 *   <Button>Share</Button>
 *   <BottomSheet aria-label="Share">{({ close }) => <ShareOptions onPick={close} />}</BottomSheet>
 * </SheetTrigger>
 */
export function BottomSheet({
  variant = 'modal',
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: BottomSheetProps) {
  const trigger = useContext(SheetTriggerContext);
  const ownState = useOverlayTriggerState({
    isOpen: open,
    defaultOpen: defaultOpen ?? (variant === 'standard' ? true : undefined),
    onOpenChange,
  });
  const state = (variant === 'modal' ? trigger?.state : undefined) ?? ownState;
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen, 'translate');
  if (!isPresent) return null;
  if (variant === 'standard')
    return (
      <BottomSheetPanel
        {...props}
        variant="standard"
        state={state}
        isExiting={isExiting}
        exitProps={exitProps}
      />
    );
  return (
    <Overlay isExiting={isExiting}>
      <ModalBottomSheet
        {...props}
        state={state}
        isExiting={isExiting}
        exitProps={exitProps}
        triggerOverlayProps={trigger?.overlayProps}
      />
    </Overlay>
  );
}

function ModalBottomSheet({
  state,
  isExiting,
  triggerOverlayProps,
  dismissable = true,
  classNames,
  ref,
  ...props
}: Omit<PanelProps, 'variant' | 'panelProps'> & { triggerOverlayProps?: { id?: string } }) {
  const panelRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const { modalProps, underlayProps } = useModalOverlay(
    {
      isDismissable: dismissable && !isExiting,
      // Escape first returns a fully open sheet to half (Compose's settleToDismiss).
      isKeyboardDismissDisabled: true,
    },
    state,
    panelRef,
  );
  const { dialogProps } = useDialog(props as AriaDialogProps, panelRef);
  const styles = bottomSheetStyles();
  return (
    <>
      <div
        aria-hidden="true"
        data-exiting={isExiting || undefined}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div {...underlayProps} className="fixed inset-0 z-(--md-sys-z-sheet)">
        <BottomSheetPanel
          {...props}
          variant="modal"
          state={state}
          isExiting={isExiting}
          classNames={classNames}
          ref={panelRef}
          panelProps={mergeProps(triggerOverlayProps ?? {}, modalProps, dialogProps)}
        />
      </div>
    </>
  );
}

type PanelProps = Omit<BottomSheetProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'variant'> & {
  variant: 'modal' | 'standard';
  state: OverlayTriggerState;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  /** Props from the modal overlay and dialog hooks. */
  panelProps?: HTMLAttributes<HTMLElement>;
};

/** The sheet itself: the moving wrapper, the panel, its handle and its detents. */
function BottomSheetPanel({
  variant,
  state,
  isExiting,
  exitProps,
  panelProps: overlayPanelProps,
  dragHandle = true,
  skipPartiallyExpanded = false,
  peekHeight = 56,
  dismissable: _dismissable,
  closeButton = true,
  closeIcon,
  collapseIcon,
  labels: labelsProp,
  children,
  className,
  classNames,
  style,
  ref,
  ...rest
}: PanelProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const standard = variant === 'standard';
  const panelRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const motionRef = useRef<HTMLDivElement>(null);
  const styles = bottomSheetStyles({ variant });
  const [height, setHeight] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [detent, setDetent] = useState<'expanded' | 'lower' | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const pointer = useRef({
    pending: false,
    fromHandle: false,
    y: 0,
    offset: 0,
    id: 0,
    samples: [] as { y: number; t: number }[],
  });

  // The lower detent: a modal sheet taller than half the window opens to half (Compose's
  // PartiallyExpanded); a standard sheet collapses to its peek height (BottomSheetScaffold).
  const lowerOffset = standard ? height - peekHeight : height - viewport.height / 2;
  const hasLower = standard ? height > peekHeight : !skipPartiallyExpanded && lowerOffset > 0;
  const current = detent ?? (hasLower ? 'lower' : 'expanded');
  const restingOffset = current === 'lower' && hasLower ? lowerOffset : 0;
  const offset = drag ?? restingOffset;
  const maxOffset = standard ? Math.max(0, lowerOffset) : height;
  const detentName = current === 'expanded' ? 'expanded' : standard ? 'collapsed' : 'partial';

  useLayoutEffect(() => {
    const element = motionRef.current;
    if (!element) return;
    const measure = () => {
      setHeight(element.offsetHeight);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const close = state.close;

  const anchors = standard
    ? hasLower
      ? [0, lowerOffset]
      : [0]
    : hasLower
      ? [0, lowerOffset, height]
      : [0, height];

  const settle = (target: number) => {
    setDrag(null);
    if (!standard && target >= height - 0.5) close();
    else setDetent(target === 0 ? 'expanded' : 'lower');
  };

  /** The handle's action: expand a lower sheet, collapse a standard one, close a modal one. */
  const cycle = () => {
    if (current === 'lower' && hasLower) setDetent('expanded');
    else if (standard) setDetent('lower');
    else close();
  };

  const startPointer = (event: PointerEvent<HTMLElement>, fromHandle: boolean) => {
    if (event.button !== 0) return;
    pointer.current = {
      pending: true,
      fromHandle,
      y: event.clientY,
      offset: restingOffset,
      id: event.pointerId,
      samples: [{ y: event.clientY, t: event.timeStamp }],
    };
  };
  const movePointer = (event: PointerEvent<HTMLElement>) => {
    const start = pointer.current;
    if (!start.pending) return;
    start.samples = [...start.samples, { y: event.clientY, t: event.timeStamp }].filter(
      (sample) => event.timeStamp - sample.t < 100,
    );
    if (drag === null && Math.abs(event.clientY - start.y) <= DRAG_SLOP) return;
    if (drag === null) event.currentTarget.setPointerCapture?.(start.id);
    setDrag(Math.min(maxOffset, Math.max(0, start.offset + event.clientY - start.y)));
  };
  const endPointer = (event: PointerEvent<HTMLElement>) => {
    const start = pointer.current;
    if (!start.pending) return;
    start.pending = false;
    if (drag === null) {
      // A press on the handle cycles the sheet (Compose's handle click).
      if (start.fromHandle) cycle();
      return;
    }
    const first = start.samples[0]!;
    const elapsed = (event.timeStamp - first.t) / 1000;
    const velocity = elapsed > 0 ? (event.clientY - first.y) / elapsed : 0;
    settle(settleTarget(anchors, start.offset, drag, velocity));
  };
  const cancelPointer = () => {
    pointer.current.pending = false;
    setDrag(null);
  };

  // Without a handle the top 48px of the sheet still drags it (m3.material.io).
  const onZonePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const top = event.currentTarget.getBoundingClientRect().top;
    if (event.clientY - top <= DRAG_ZONE) startPointer(event, false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || isExiting) return;
    if (standard) {
      if (current !== 'expanded' || !hasLower) return;
      event.stopPropagation();
      setDetent('lower');
      return;
    }
    event.stopPropagation();
    if (current === 'expanded' && hasLower) setDetent('lower');
    else close();
  };

  const { focusProps: handleFocusProps, isFocusVisible: handleFocusVisible } = useFocusRing();
  const exiting = isExiting || undefined;
  const dragging = drag !== null || undefined;
  const handleLabel =
    current === 'lower' && hasLower ? labels.expand : standard ? labels.collapse : labels.dismiss;
  // The sheet fills the window up to its top margin: 72px, or 56px above 640px wide.
  const topMargin = viewport.width > 640 ? 56 : 72;
  const fillsWindow =
    current === 'expanded' && viewport.height > 0 && height >= viewport.height - topMargin - 0.5;
  const showCloseButton = closeButton && fillsWindow && (!standard || hasLower);

  // A standard sheet is a non-modal dialog: no scrim, no focus trap, the page stays usable.
  const roleProps: HTMLAttributes<HTMLElement> = standard
    ? { role: 'dialog', tabIndex: -1 }
    : (overlayPanelProps ?? {});
  const panelProps = mergeProps(rest, roleProps, { onKeyDown });
  const zone = !dragHandle;

  return (
    <div
      {...exitProps}
      ref={motionRef}
      data-exiting={exiting}
      data-dragging={dragging}
      style={{ '--m3-sheet-offset': `${offset}px` } as CSSProperties}
      className={styles.motion({ class: classNames?.container })}
    >
      <div
        {...panelProps}
        onPointerDown={(event) => {
          panelProps.onPointerDown?.(event);
          if (zone) onZonePointerDown(event);
        }}
        onPointerMove={(event) => {
          panelProps.onPointerMove?.(event);
          if (zone) movePointer(event);
        }}
        onPointerUp={(event) => {
          panelProps.onPointerUp?.(event);
          if (zone) endPointer(event);
        }}
        onPointerCancel={(event) => {
          panelProps.onPointerCancel?.(event);
          if (zone) cancelPointer();
        }}
        ref={panelRef}
        style={style}
        data-detent={detentName}
        data-exiting={exiting}
        data-dragging={dragging}
        className={styles.panel({ class: cn(classNames?.panel, className) })}
      >
        <TriggerContext value={null}>
          {dragHandle && (
            <div
              {...handleFocusProps}
              role="button"
              tabIndex={0}
              data-focus-visible={handleFocusVisible || undefined}
              aria-label={handleLabel}
              data-dragging={dragging}
              onPointerDown={(event) => startPointer(event, true)}
              onPointerMove={movePointer}
              onPointerUp={endPointer}
              onPointerCancel={cancelPointer}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  cycle();
                }
              }}
              className={styles.handle({ class: classNames?.handle })}
            >
              <span className={styles.handleBar()} />
            </div>
          )}
          {showCloseButton && (
            <div className={styles.closeRow({ class: classNames?.closeRow })}>
              <IconButton
                icon={standard ? (collapseIcon ?? <CollapseIcon />) : (closeIcon ?? <CloseIcon />)}
                aria-label={standard ? labels.collapse : labels.close}
                onPress={standard ? () => setDetent('lower') : close}
                className={classNames?.closeButton}
              />
            </div>
          )}
          <div className={styles.content({ class: classNames?.content })}>
            {typeof children === 'function' ? children({ close }) : children}
          </div>
        </TriggerContext>
      </div>
    </div>
  );
}
