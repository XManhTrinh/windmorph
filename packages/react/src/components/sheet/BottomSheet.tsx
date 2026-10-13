'use client';

import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
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
import { settleTarget } from './sheet-settle';
import { bottomSheetStyles } from './sheet-styles';
import { SheetTriggerContext } from './SheetTrigger';

export interface BottomSheetClassNames {
  scrim?: string;
  panel?: string;
  handle?: string;
  content?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface BottomSheetOwnProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show the drag handle. @default true */
  dragHandle?: boolean;
  /**
   * Open fully instead of to half the window when the content is taller than half the
   * window. @default false
   */
  skipPartiallyExpanded?: boolean;
  /** Pressing the scrim closes the sheet. @default true */
  dismissable?: boolean;
  /** Label of the drag handle while the sheet is half open (it expands the sheet). */
  expandLabel?: string;
  /** Label of the drag handle while the sheet is fully open (it closes the sheet). */
  dismissLabel?: string;
  children?: ReactNode | ((props: { close: () => void }) => ReactNode);
  classNames?: BottomSheetClassNames;
}

export type BottomSheetProps = BottomSheetOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof BottomSheetOwnProps | 'aria-label' | 'aria-labelledby'>;

/**
 * M3 modal bottom sheet: slides up over a scrim, opening to half the window when its
 * content is taller (drag the handle up, or press it, to expand), and closes on a drag
 * down, a press on the scrim or Escape (which first returns a fully open sheet to half).
 *
 * @example
 * <SheetTrigger>
 *   <Button>Share</Button>
 *   <BottomSheet aria-label="Share">{({ close }) => <ShareOptions onPick={close} />}</BottomSheet>
 * </SheetTrigger>
 */
export function BottomSheet({ open, defaultOpen, onOpenChange, ...props }: BottomSheetProps) {
  const trigger = useContext(SheetTriggerContext);
  const ownState = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const state = trigger?.state ?? ownState;
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen, 'translate');
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting}>
      <BottomSheetModal
        {...props}
        state={state}
        isExiting={isExiting}
        exitProps={exitProps}
        triggerOverlayProps={trigger?.overlayProps}
      />
    </Overlay>
  );
}

function BottomSheetModal({
  state,
  isExiting,
  exitProps,
  triggerOverlayProps,
  dragHandle = true,
  skipPartiallyExpanded = false,
  dismissable = true,
  expandLabel = 'Expand sheet',
  dismissLabel = 'Close sheet',
  children,
  className,
  classNames,
  style,
  ref,
  ...rest
}: Omit<BottomSheetProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  state: OverlayTriggerState;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  triggerOverlayProps?: { id?: string };
}) {
  const panelRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const motionRef = useRef<HTMLDivElement>(null);
  const styles = bottomSheetStyles();
  const [height, setHeight] = useState(0);
  const [viewport, setViewport] = useState(0);
  const [detent, setDetent] = useState<'expanded' | 'partial' | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const dragStart = useRef({ y: 0, offset: 0, samples: [] as { y: number; t: number }[] });

  // Compose: a partially expanded anchor at half the window exists when the sheet is taller.
  const hasPartial = !skipPartiallyExpanded && height > viewport / 2;
  const partialOffset = height - viewport / 2;
  const current = detent ?? (hasPartial ? 'partial' : 'expanded');
  const restingOffset = current === 'partial' && hasPartial ? partialOffset : 0;
  const offset = drag ?? restingOffset;

  useLayoutEffect(() => {
    const element = motionRef.current;
    if (!element) return;
    const measure = () => {
      setHeight(element.offsetHeight);
      setViewport(window.innerHeight);
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
  const { modalProps, underlayProps } = useModalOverlay(
    {
      isDismissable: dismissable && !isExiting,
      // Escape first returns a fully open sheet to half (Compose's settleToDismiss).
      isKeyboardDismissDisabled: true,
    },
    state,
    panelRef,
  );
  const { dialogProps } = useDialog(rest as AriaDialogProps, panelRef);

  const anchors = hasPartial ? [0, partialOffset, height] : [0, height];

  const settle = (target: number) => {
    setDrag(null);
    if (target >= height - 0.5) close();
    else setDetent(target === 0 ? 'expanded' : 'partial');
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStart.current = {
      y: event.clientY,
      offset: restingOffset,
      samples: [{ y: event.clientY, t: event.timeStamp }],
    };
    setDrag(restingOffset);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (drag === null) return;
    const start = dragStart.current;
    start.samples = [...start.samples, { y: event.clientY, t: event.timeStamp }].filter(
      (sample) => event.timeStamp - sample.t < 100,
    );
    setDrag(Math.min(height, Math.max(0, start.offset + event.clientY - start.y)));
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag === null) return;
    const start = dragStart.current;
    const moved = Math.abs(event.clientY - start.y);
    if (moved < 4) {
      // A press: expand a half-open sheet, close a fully open one (Compose's handle click).
      setDrag(null);
      if (current === 'partial' && hasPartial) setDetent('expanded');
      else close();
      return;
    }
    const first = start.samples[0]!;
    const elapsed = (event.timeStamp - first.t) / 1000;
    const velocity = elapsed > 0 ? (event.clientY - first.y) / elapsed : 0;
    settle(settleTarget(anchors, start.offset, drag, velocity));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || isExiting) return;
    event.stopPropagation();
    if (current === 'expanded' && hasPartial) setDetent('partial');
    else close();
  };

  const { focusProps: handleFocusProps, isFocusVisible: handleFocusVisible } = useFocusRing();
  const exiting = isExiting || undefined;
  const handleLabel = current === 'partial' && hasPartial ? expandLabel : dismissLabel;

  return (
    <>
      <div
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div {...underlayProps} className="fixed inset-0 z-(--md-sys-z-sheet)">
        <div
          {...exitProps}
          ref={motionRef}
          data-exiting={exiting}
          data-dragging={drag !== null || undefined}
          style={{ '--m3-sheet-offset': `${offset}px` } as CSSProperties}
          className={styles.motion()}
        >
          <div
            {...mergeProps(rest, triggerOverlayProps ?? {}, modalProps, dialogProps, { onKeyDown })}
            ref={panelRef}
            style={style}
            data-detent={current}
            data-exiting={exiting}
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
                  data-dragging={drag !== null || undefined}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      if (current === 'partial' && hasPartial) setDetent('expanded');
                      else close();
                    }
                  }}
                  className={styles.handle({ class: classNames?.handle })}
                >
                  <span className={styles.handleBar()} />
                </div>
              )}
              <div className={styles.content({ class: classNames?.content })}>
                {typeof children === 'function' ? children({ close }) : children}
              </div>
            </TriggerContext>
          </div>
        </div>
      </div>
    </>
  );
}
