'use client';

import {
  useContext,
  useId,
  type ComponentPropsWithRef,
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
import { IconButton } from '../icon-button/IconButton';
import { BackIcon, CloseIcon } from './sheet-icons';
import { sideSheetStyles } from './sheet-styles';
import { SheetTriggerContext } from './SheetTrigger';

export interface SideSheetClassNames {
  scrim?: string;
  /** The sheet's surface: its colour, corners, width and shadow. */
  panel?: string;
  header?: string;
  backButton?: string;
  title?: string;
  /** The end of the header: `actions` and the close button. */
  headerActions?: string;
  closeButton?: string;
  content?: string;
  footer?: string;
}

/** Words the side sheet announces. */
export interface SideSheetLabels {
  /** The close button. */
  close: string;
  /** The back button (with `onBack`). */
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
  open?: boolean;
  /** @default false (modal), true (standard) */
  defaultOpen?: boolean;
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
  | { title: ReactNode; 'aria-label'?: string }
  | { 'aria-label': string }
  | { 'aria-labelledby': string };

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
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen, 'translate');
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
          {render(actions)}
          <IconButton
            variant="standard"
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
  const exiting = isExiting || undefined;
  return (
    <>
      <div
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: body.classNames?.scrim })}
      />
      <div {...underlayProps} className="fixed inset-0 z-(--md-sys-z-sheet)">
        <div style={style} className={styles.container({ class: className })}>
          <div {...exitProps} data-exiting={exiting} className={styles.motion()}>
            <div
              {...mergeProps(rest, triggerOverlayProps ?? {}, modalProps, dialogProps)}
              ref={panelRef}
              // The component tokens' hooks (sheet-tokens.ts); `data-variant` is also public.
              data-tokens="md-comp-sheet-side"
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
  // A non-modal dialog (m3.material.io: the side sheet's role is dialog); focus isn't moved.
  return (
    <div
      {...rest}
      ref={ref}
      role="dialog"
      style={style}
      // The component tokens' hooks (sheet-tokens.ts), read by the panel inside.
      data-tokens="md-comp-sheet-side"
      data-variant="standard"
      data-detached={detached || undefined}
      data-closed={closed}
      inert={!state.isOpen}
      aria-labelledby={labelledBy(rest, body.title != null, titleId)}
      className={styles.standard({ class: className })}
    >
      <div className={styles.standardClip()}>
        <div className={styles.standardFrame()}>
          <div data-slot="panel" className={styles.panel({ class: body.classNames?.panel })}>
            <SheetBody {...body} titleId={titleId} close={state.close} styles={styles} />
          </div>
        </div>
      </div>
    </div>
  );
}
