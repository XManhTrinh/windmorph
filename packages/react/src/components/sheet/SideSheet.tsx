'use client';

import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  useDialog,
  useModalOverlay,
  useObjectRef,
  type AriaDialogProps,
} from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import { TriggerContext } from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { closedByOverlayOptions, type ClosedBy } from '../../utils/closed-by';
import { cn } from '../../utils/cn';
import { focusFirstInteractive, tabbables } from '../../utils/focus';
import { DensityZeroButtons } from '../button/DensityZeroButtons';
import { IconButton } from '../icon-button/IconButton';
import { BackIcon, CloseIcon } from './sheet-icons';
import { SHEET_EXIT_PROPERTIES, sideSheetStyles } from './sheet-styles';
import { SheetTriggerContext } from './SheetTrigger';
import { useSideSwipe } from './use-side-swipe';
import { mergeDataTokens } from '../../utils/merge-data-tokens';

export interface SideSheetClassNames {
  /**
   * The outermost element, which places the sheet (where `className` and `style` go too):
   * a modal sheet's box `fixed` to the window's `edge`, or a standard sheet's layout box.
   */
  container?: string;
  /** The dimmed layer behind a modal sheet. */
  scrim?: string;
  /** The sheet's surface: its colour, corners, width and shadow. */
  panel?: string;
  /** The header row: back button, title, actions and close button. */
  header?: string;
  /** The back button. */
  back?: string;
  /** The headline. */
  title?: string;
  /** The end of the header: `actions` and the close button. */
  headerActions?: string;
  /** The close button. */
  close?: string;
  /** The scrollable content area. */
  content?: string;
  /** The bottom row of action buttons. */
  footer?: string;
}

/** Words the side sheet announces. */
export interface SideSheetLabels {
  /** The close button. @default "Close" */
  close: string;
  /** The back button (with `onBack`). @default "Back" */
  back: string;
}

const DEFAULT_LABELS: SideSheetLabels = { close: 'Close', back: 'Back' };

interface SideSheetRenderProps {
  /** Closes a modal sheet, or reports `onOpenChange(false)` for a standard one. */
  close: () => void;
}

interface SideSheetOwnProps {
  /**
   * `modal` opens over a scrim as a dialog; `standard` sits in the layout beside the
   * content and opens and closes its width. @default "modal"
   */
  variant?: 'modal' | 'standard';
  /** Float 16px from the edges with corners all round. @default false */
  detached?: boolean;
  /**
   * The window edge the sheet is anchored to: `end` (the right in a left-to-right page, the
   * left in RTL, as M3 asks) or `start`. A modal sheet slides in from it and swipes out toward
   * it; a standard sheet faces it, with its divider on the other side. The root's `data-edge`
   * says which.
   * @default "end"
   */
  edge?: 'start' | 'end';
  /**
   * Whether a touch or pen swipe toward the sheet's edge closes a modal sheet (past half its
   * width, or a fling). The close button, Escape and the scrim still close it either way, and
   * a mouse drag never moves it. Off when `closedBy` is `"none"`; a standard sheet ignores
   * it. To keep the sheet open after a swipe (unsaved changes), control `open` and leave it
   * `true`: the sheet springs back.
   * @default true
   */
  swipeable?: boolean;
  /** Whether the sheet is open (controlled). */
  open?: boolean;
  /** Whether the sheet starts open when uncontrolled. @default false, or true when standard */
  defaultOpen?: boolean;
  /** Called when the sheet opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The headline. It names the sheet. */
  title?: ReactNode;
  /** Shows a back button before the title, for a sheet with several levels. */
  onBack?: () => void;
  /** Header controls before the close button. */
  actions?: ReactNode | ((props: SideSheetRenderProps) => ReactNode);
  /** Bottom action buttons, start-aligned, e.g. Save and Cancel. */
  footer?: ReactNode | ((props: SideSheetRenderProps) => ReactNode);
  /** A divider between the content and `footer`. @default false */
  footerDivider?: boolean;
  /** A divider between a standard sheet and the content beside it. @default true */
  divider?: boolean;
  /**
   * How the user can close a modal sheet, as HTML's `<dialog closedby>`: `any` (Escape, a
   * press on the scrim or a swipe), `closerequest` (Escape or a swipe) or `none` (only its
   * buttons or the app).
   * @default "any"
   */
  closedBy?: ClosedBy;
  /** Replaces the close button's icon. */
  closeIcon?: ReactElement;
  /** Replaces the back button's icon. */
  backIcon?: ReactElement;
  /** Words the sheet announces, with English defaults. */
  labels?: Partial<SideSheetLabels>;
  children?: ReactNode | ((props: SideSheetRenderProps) => ReactNode);
  /** Classes for each part, by slot. */
  classNames?: SideSheetClassNames;
  /**
   * Goes with `style` on the outermost element, the box that places the sheet, so a layout class
   * moves the whole sheet and never clips or stretches its surface. Style the surface with
   * `classNames.panel`; `ref`, `data-*` and other attributes go on the panel (a standard
   * sheet's are on its outer box).
   */
  className?: string;
  /** Goes on the outermost element, with `className`. */
  style?: CSSProperties;
  /** Ref to the panel, the sheet's surface (`role="dialog"`); a standard sheet's outer box. */
  ref?: Ref<HTMLDivElement>;
}

type Naming =
  | {
      title: ReactNode;
      /** Accessible name when there's no visible title; overrides `title` when both are set. */
      'aria-label'?: string;
    }
  | {
      /** Accessible name when there's no visible title. */
      'aria-label': string;
    }
  | {
      /** Id of a visible element that names the sheet, when there's no `title`. */
      'aria-labelledby': string;
    };

export type SideSheetProps = SideSheetOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof SideSheetOwnProps | 'aria-label' | 'aria-labelledby'>;

/**
 * M3 side sheet: supplementary content at the end edge of the window (`edge="start"` for the
 * other). A modal sheet slides in over a scrim as a dialog (Escape, a press outside or a
 * touch swipe toward its edge closes it); a standard sheet sits in the layout as a non-modal
 * dialog and opens and closes its width. Both always show a close button, as M3 requires.
 *
 * @example
 * <SheetTrigger>
 *   <Button>Filters</Button>
 *   <SideSheet title="Filters" footer={({ close }) => <Button onPress={close}>Apply</Button>}>
 *     …
 *   </SideSheet>
 * </SheetTrigger>
 */
export function SideSheet({
  variant = 'modal',
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: SideSheetProps) {
  const trigger = useContext(SheetTriggerContext);
  const ownState = useOverlayTriggerState({
    isOpen: open,
    defaultOpen: defaultOpen ?? (variant === 'standard' ? true : undefined),
    onOpenChange,
  });
  const state = (variant === 'modal' ? trigger?.state : undefined) ?? ownState;
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen, SHEET_EXIT_PROPERTIES);
  if (variant === 'standard') return <StandardSideSheet {...props} state={state} />;
  if (!isPresent) return null;
  return (
    <Overlay exiting={isExiting}>
      <ModalSideSheet
        {...props}
        state={state}
        isExiting={isExiting}
        exitProps={exitProps}
        triggerOverlayProps={trigger?.overlayProps}
      />
    </Overlay>
  );
}

type InnerProps = Omit<SideSheetProps, 'variant' | 'open' | 'defaultOpen' | 'onOpenChange'> & {
  state: OverlayTriggerState;
};

type BodyProps = Pick<
  SideSheetOwnProps,
  | 'title'
  | 'onBack'
  | 'actions'
  | 'footer'
  | 'children'
  | 'closeIcon'
  | 'backIcon'
  | 'labels'
  | 'classNames'
> & {
  titleId: string;
  close: () => void;
  styles: ReturnType<typeof sideSheetStyles>;
  contentRef?: Ref<HTMLDivElement>;
};

function SheetBody({
  title,
  titleId,
  onBack,
  actions,
  footer,
  children,
  closeIcon,
  backIcon,
  labels: labelsProp,
  close,
  styles,
  classNames,
  contentRef,
}: BodyProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const renderProps = { close };
  const render = (slot: SideSheetOwnProps['children']) =>
    typeof slot === 'function' ? slot(renderProps) : slot;
  return (
    <>
      <div className={styles.header({ class: classNames?.header })}>
        {onBack && (
          <IconButton
            variant="standard"
            density={0}
            icon={backIcon ?? <BackIcon />}
            aria-label={labels.back}
            onPress={onBack}
            className={classNames?.back}
          />
        )}
        {title != null && (
          <h2 id={titleId} className={styles.title({ class: classNames?.title })}>
            {title}
          </h2>
        )}
        <div className={styles.headerActions({ class: classNames?.headerActions })}>
          <DensityZeroButtons>{render(actions)}</DensityZeroButtons>
          <IconButton
            variant="standard"
            density={0}
            icon={closeIcon ?? <CloseIcon />}
            aria-label={labels.close}
            onPress={close}
            className={classNames?.close}
          />
        </div>
      </div>
      <div ref={contentRef} className={styles.content({ class: classNames?.content })}>
        {render(children)}
      </div>
      {footer != null && (
        <div className={styles.footer({ class: classNames?.footer })}>{render(footer)}</div>
      )}
    </>
  );
}

const BODY_KEYS = [
  'title',
  'onBack',
  'actions',
  'footer',
  'children',
  'closeIcon',
  'backIcon',
  'labels',
  'classNames',
] as const;

/** Splits the header, body and footer props from those of the panel element. */
function splitBodyProps<T extends Record<string, unknown>>(props: T) {
  const body: Record<string, unknown> = {};
  const rest: Record<string, unknown> = { ...props };
  for (const key of BODY_KEYS) {
    body[key] = rest[key];
    delete rest[key];
  }
  return {
    body: body as Omit<BodyProps, 'titleId' | 'close' | 'styles' | 'contentRef'>,
    rest: rest as Omit<T, (typeof BODY_KEYS)[number]>,
  };
}

/** `aria-labelledby` for the panel: the consumer's, else the title's unless `aria-label` names it. */
function labelledBy(props: Record<string, unknown>, hasTitle: boolean, titleId: string) {
  const own = props['aria-labelledby'] as string | undefined;
  return own ?? (props['aria-label'] == null && hasTitle ? titleId : undefined);
}

function ModalSideSheet({
  state,
  isExiting,
  exitProps,
  triggerOverlayProps,
  detached = false,
  edge = 'end',
  swipeable = true,
  closedBy = 'any',
  divider: _divider,
  footerDivider = false,
  className,
  style,
  ref,
  ...props
}: InnerProps & {
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  triggerOverlayProps?: { id?: string };
}) {
  const { body, rest } = splitBodyProps(props);
  const panelRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const motionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // `closedBy="none"` leaves closing to the app, so a swipe doesn't close it either.
  const canSwipe = swipeable && closedBy !== 'none';
  const styles = sideSheetStyles({
    variant: 'modal',
    edge,
    swipeable: canSwipe,
    detached,
    hasBack: body.onBack != null,
    footerDivider,
  });
  const { panelHandlers, motionProps, dragging } = useSideSwipe({
    enabled: canSwipe && !isExiting,
    edge,
    isOpen: state.isOpen,
    close: state.close,
    panelRef,
    motionRef,
    contentRef,
  });
  const { modalProps, underlayProps } = useModalOverlay(
    closedByOverlayOptions(closedBy, isExiting),
    state,
    panelRef,
  );
  const { dialogProps } = useDialog(
    {
      ...(rest as AriaDialogProps),
      'aria-labelledby': labelledBy(rest, body.title != null, titleId),
    },
    panelRef,
  );
  // M3: focus lands on the first (non-disabled) icon button, as in a Dialog, not the panel.
  useEffect(() => focusFirstInteractive(panelRef.current), [panelRef]);
  const exiting = isExiting || undefined;
  return (
    <>
      <div
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: body.classNames?.scrim })}
      />
      <div {...underlayProps} className="fixed inset-0 z-(--md-sys-z-sheet)">
        <div
          style={style}
          className={styles.container({ class: cn(body.classNames?.container, className) })}
        >
          <div
            {...mergeProps(exitProps, motionProps)}
            ref={motionRef}
            data-exiting={exiting}
            className={styles.motion()}
          >
            <div
              {...mergeProps(
                rest,
                triggerOverlayProps ?? {},
                modalProps,
                dialogProps,
                panelHandlers,
              )}
              ref={panelRef}
              // The component tokens' hooks (sheet-tokens.ts); `data-variant` and `data-edge`
              // are also public.
              data-tokens={mergeDataTokens('md-comp-sheet-side', rest)}
              data-variant="modal"
              data-edge={edge}
              data-detached={detached || undefined}
              data-dragging={dragging || undefined}
              data-exiting={exiting}
              className={styles.panel({ class: body.classNames?.panel })}
            >
              <TriggerContext value={null}>
                <SheetBody
                  {...body}
                  titleId={titleId}
                  close={state.close}
                  styles={styles}
                  contentRef={contentRef}
                />
              </TriggerContext>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StandardSideSheet({
  state,
  detached = false,
  edge = 'end',
  swipeable: _swipeable,
  divider = true,
  footerDivider = false,
  closedBy: _closedBy,
  className,
  style,
  ref,
  ...props
}: InnerProps) {
  const { body, rest } = splitBodyProps(props);
  const titleId = useId();
  const styles = sideSheetStyles({
    variant: 'standard',
    edge,
    detached,
    divider,
    hasBack: body.onBack != null,
    footerDivider,
  });
  const closed = !state.isOpen || undefined;
  const rootRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const frameRef = useRef<HTMLDivElement>(null);
  // The sheet's open width, measured, so the root's width (not a grid fraction, which takes
  // only part of the shrinking free space and left the panel floating off its edge) moves
  // between it and 0. Until it's measured (the server's HTML) the open root is `auto` wide.
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    // The layout width, not the box on screen, which a consumer transform scales or turns.
    const measure = () => setWidth(frame.offsetWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  // Focus that came from outside returns there when the sheet closes with focus inside (its
  // close button, Escape in content, or the app closing it): the closed sheet is `inert`, and
  // focus would otherwise drop to the page.
  const returnFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const active = root?.ownerDocument.activeElement;
    if (state.isOpen || !root || !(active instanceof HTMLElement) || !root.contains(active)) return;
    const saved = returnFocus.current;
    const target =
      saved?.isConnected && !root.contains(saved) && !saved.closest('[inert]')
        ? saved
        : (tabbables(root.ownerDocument.body, (el) => root.contains(el))
            .filter((el) => el.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING)
            .at(-1) ?? null);
    if (target) target.focus({ preventScroll: true });
    else active.blur();
  }, [state.isOpen, rootRef]);
  const rootStyle = {
    ...style,
    ...(width === null ? {} : { '--m3-side-sheet-width': `${width}px` }),
  } as CSSProperties;
  // A non-modal dialog (m3.material.io: the side sheet's role is dialog); focus isn't moved.
  return (
    <div
      {...rest}
      onFocus={(event: FocusEvent<HTMLDivElement>) => {
        (rest as { onFocus?: (event: FocusEvent<HTMLDivElement>) => void }).onFocus?.(event);
        const from = event.relatedTarget;
        if (from instanceof HTMLElement && !event.currentTarget.contains(from)) {
          returnFocus.current = from;
        }
      }}
      ref={rootRef}
      role="dialog"
      style={rootStyle}
      // The component tokens' hooks (sheet-tokens.ts), read by the panel inside.
      data-tokens={mergeDataTokens('md-comp-sheet-side', rest)}
      data-variant="standard"
      data-edge={edge}
      data-detached={detached || undefined}
      data-closed={closed}
      inert={!state.isOpen}
      aria-labelledby={labelledBy(rest, body.title != null, titleId)}
      className={styles.standard({ class: cn(body.classNames?.container, className) })}
    >
      <div className={styles.standardClip()}>
        <div ref={frameRef} className={styles.standardFrame()}>
          <div data-slot="panel" className={styles.panel({ class: body.classNames?.panel })}>
            <SheetBody {...body} titleId={titleId} close={state.close} styles={styles} />
          </div>
        </div>
      </div>
    </div>
  );
}
