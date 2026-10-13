'use client';

import { useContext, useId, type ComponentPropsWithRef, type ReactNode, type Ref } from 'react';
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
import { sideSheetStyles } from './sheet-styles';
import { SheetTriggerContext } from './SheetTrigger';

export interface SideSheetClassNames {
  scrim?: string;
  panel?: string;
  header?: string;
  title?: string;
  content?: string;
}

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
  /** Float 16px from the window edges with corners all round (modal). @default false */
  detached?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The headline. It names the sheet. */
  title?: ReactNode;
  /** Header controls after the title, e.g. a close `IconButton`. */
  actions?: ReactNode | ((props: SideSheetRenderProps) => ReactNode);
  /** Pressing the scrim closes a modal sheet. @default true */
  dismissable?: boolean;
  children?: ReactNode | ((props: SideSheetRenderProps) => ReactNode);
  classNames?: SideSheetClassNames;
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
 * in the layout and opens and closes its width.
 *
 * @example
 * <SheetTrigger>
 *   <Button>Filters</Button>
 *   <SideSheet title="Filters" actions={({ close }) => (
 *     <IconButton icon={<CloseIcon />} aria-label="Close" onPress={close} />)}>…</SideSheet>
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

function SheetBody({
  title,
  titleId,
  actions,
  children,
  close,
  styles,
  classNames,
}: {
  title?: ReactNode;
  titleId: string;
  actions: SideSheetOwnProps['actions'];
  children: SideSheetOwnProps['children'];
  close: () => void;
  styles: ReturnType<typeof sideSheetStyles>;
  classNames?: SideSheetClassNames;
}) {
  const renderProps = { close };
  return (
    <>
      {(title != null || actions != null) && (
        <div className={styles.header({ class: classNames?.header })}>
          {title != null && (
            <h2 id={titleId} className={styles.title({ class: classNames?.title })}>
              {title}
            </h2>
          )}
          {typeof actions === 'function' ? actions(renderProps) : actions}
        </div>
      )}
      <div className={styles.content({ class: classNames?.content })}>
        {typeof children === 'function' ? children(renderProps) : children}
      </div>
    </>
  );
}

function ModalSideSheet({
  state,
  isExiting,
  exitProps,
  triggerOverlayProps,
  detached = false,
  dismissable = true,
  title,
  actions,
  children,
  className,
  classNames,
  style,
  ref,
  ...rest
}: InnerProps & {
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  triggerOverlayProps?: { id?: string };
}) {
  const panelRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const titleId = useId();
  const styles = sideSheetStyles({ variant: 'modal', detached });
  const { modalProps, underlayProps } = useModalOverlay(
    { isDismissable: dismissable && !isExiting },
    state,
    panelRef,
  );
  const labelling = rest as { 'aria-label'?: string; 'aria-labelledby'?: string };
  const { dialogProps } = useDialog(
    {
      ...(rest as AriaDialogProps),
      'aria-labelledby':
        labelling['aria-labelledby'] ??
        (labelling['aria-label'] == null && title != null ? titleId : undefined),
    },
    panelRef,
  );
  const exiting = isExiting || undefined;
  return (
    <>
      <div
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div {...underlayProps} className="fixed inset-0 z-(--md-sys-z-sheet)">
        <div {...exitProps} data-exiting={exiting} className={styles.motion()}>
          <div
            {...mergeProps(rest, triggerOverlayProps ?? {}, modalProps, dialogProps)}
            ref={panelRef}
            style={style}
            data-exiting={exiting}
            className={styles.panel({ class: cn(classNames?.panel, className) })}
          >
            <TriggerContext value={null}>
              <SheetBody
                title={title}
                titleId={titleId}
                actions={actions}
                close={state.close}
                styles={styles}
                classNames={classNames}
              >
                {children}
              </SheetBody>
            </TriggerContext>
          </div>
        </div>
      </div>
    </>
  );
}

function StandardSideSheet({
  state,
  title,
  actions,
  children,
  className,
  classNames,
  style,
  ref,
  detached: _detached,
  dismissable: _dismissable,
  ...rest
}: InnerProps) {
  const titleId = useId();
  const styles = sideSheetStyles({ variant: 'standard' });
  const labelling = rest as { 'aria-label'?: string; 'aria-labelledby'?: string };
  const closed = !state.isOpen || undefined;
  return (
    <div
      {...rest}
      ref={ref}
      style={style}
      data-closed={closed}
      inert={!state.isOpen}
      aria-labelledby={
        labelling['aria-labelledby'] ??
        (labelling['aria-label'] == null && title != null ? titleId : undefined)
      }
      className={styles.standard({ class: cn(classNames?.panel, className) })}
    >
      <div className={styles.standardClip()}>
        <div className={styles.panel()}>
          <SheetBody
            title={title}
            titleId={titleId}
            actions={actions}
            close={state.close}
            styles={styles}
            classNames={classNames}
          >
            {children}
          </SheetBody>
        </div>
      </div>
    </div>
  );
}
