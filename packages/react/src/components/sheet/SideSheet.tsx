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
import { cn } from '../../utils/cn';
import { focusFirstInteractive, tabbables } from '../../utils/focus';
import { DensityZeroButtons } from '../button/DensityZeroButtons';
import { IconButton } from '../icon-button/IconButton';
import { BackIcon, CloseIcon } from './sheet-icons';
import { SHEET_EXIT_PROPERTIES, sideSheetStyles } from './sheet-styles';
import { SheetTriggerContext } from './SheetTrigger';
import { mergeDataTokens } from '../../utils/merge-data-tokens';

export interface SideSheetClassNames {
  /**
   * The outermost element, which places the sheet (where `className` and `style` go too):
   * a modal sheet's box `fixed` to the window's end edge, or a standard sheet's layout box.
   */
  container?: string;
  /** The dimmed layer behind a modal sheet. */
  scrim?: string;
  /** The sheet's surface: its colour, corners, width and shadow. */
  panel?: string;
  /** The header row: back button, title, actions and close button. */
  header?: string;
  /** The back button. */
  backButton?: string;
  /** The headline. */
  title?: string;
  /** The end of the header: `actions` and the close button. */
  headerActions?: string;
  /** The close button. */
  closeButton?: string;
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
  /** Pressing the scrim closes a modal sheet. @default true */
  dismissable?: boolean;
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
 * M3 side sheet: supplementary content at the end edge of the window. A modal sheet slides
 * in over a scrim as a dialog (Escape or a press outside closes it); a standard sheet sits
 * in the layout as a non-modal dialog and opens and closes its width. Both always show a
 * close button, as M3 requires.
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
    <Overlay isExiting={isExiting}>
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
            className={classNames?.backButton}
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
            className={classNames?.closeButton}
          />
        </div>
      </div>
      <div className={styles.content({ class: classNames?.content })}>{render(children)}</div>
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
    body: body as Omit<BodyProps, 'titleId' | 'close' | 'styles'>,
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
  dismissable = true,
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
  const titleId = useId();
  const styles = sideSheetStyles({
    variant: 'modal',
    detached,
    hasBack: body.onBack != null,
    footerDivider,
  });
  const { modalProps, underlayProps } = useModalOverlay(
    { isDismissable: dismissable && !isExiting },
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
          <div {...exitProps} data-exiting={exiting} className={styles.motion()}>
            <div
              {...mergeProps(rest, triggerOverlayProps ?? {}, modalProps, dialogProps)}
              ref={panelRef}
              // The component tokens' hooks (sheet-tokens.ts); `data-variant` is also public.
              data-tokens={mergeDataTokens('md-comp-sheet-side', rest)}
              data-variant="modal"
              data-detached={detached || undefined}
              data-exiting={exiting}
              className={styles.panel({ class: body.classNames?.panel })}
            >
              <TriggerContext value={null}>
                <SheetBody {...body} titleId={titleId} close={state.close} styles={styles} />
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
  divider = true,
  footerDivider = false,
  dismissable: _dismissable,
  className,
  style,
  ref,
  ...props
}: InnerProps) {
  const { body, rest } = splitBodyProps(props);
  const titleId = useId();
  const styles = sideSheetStyles({
    variant: 'standard',
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
