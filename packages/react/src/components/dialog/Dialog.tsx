'use client';

import {
  Children,
  createContext,
  useContext,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type DOMAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  useDialog,
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
import { IconButton } from '../icon-button/IconButton';
import { dialogStyles } from './dialog-styles';

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

interface DialogTriggerContextValue {
  state: OverlayTriggerState;
  /** Links the dialog to its trigger (`aria-controls`). */
  overlayProps: { id?: string };
}

const DialogTriggerContext = createContext<DialogTriggerContextValue | null>(null);

interface DialogPartsContextValue {
  titleProps: DOMAttributes<HTMLElement>;
  hasIcon: boolean;
  fullScreen: DialogFullScreen;
  close: () => void;
}

const DialogPartsContext = createContext<DialogPartsContextValue>({
  titleProps: {},
  hasIcon: false,
  fullScreen: 'never',
  close: () => undefined,
});

export interface DialogTriggerProps {
  /** The trigger (a Button, IconButton, …) followed by the `Dialog`. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
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
    <DialogTriggerContext value={{ state, overlayProps }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {dialog}
    </DialogTriggerContext>
  );
}

export interface DialogClassNames {
  scrim?: string;
  panel?: string;
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
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * `alertdialog` for confirmations that need a decision; it is not dismissed by
   * pressing outside. @default "dialog"
   */
  role?: 'dialog' | 'alertdialog';
  /** Closes when pressing outside the dialog. @default true (false for `alertdialog`) */
  dismissable?: boolean;
  /** Prevents Escape from closing the dialog. */
  keyboardDismissDisabled?: boolean;
  /** Icon above the title (which is then centred). Decorative. Not shown in full screen. */
  icon?: ReactNode;
  /**
   * Fills the window, with a `DialogHeader` holding the close button, title and confirming
   * action instead of `DialogActions`. `compact` does so only below 600px. @default "never"
   */
  fullScreen?: DialogFullScreen;
  children?: ReactNode | ((props: DialogRenderProps) => ReactNode);
  classNames?: DialogClassNames;
  style?: CSSProperties;
}

/**
 * M3 basic dialog: a modal panel over a scrim, rendered in a portal that keeps the
 * surrounding theme. Focus is moved in and contained, restored on close; Escape and
 * pressing outside close it; the page behind does not scroll and is hidden from
 * assistive tech. Name it with a `DialogTitle` (or `aria-label`).
 *
 * `className`, `style`, `ref` and other attributes go on the dialog panel.
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
export function Dialog({ open, defaultOpen, onOpenChange, ...props }: DialogProps) {
  const trigger = useContext(DialogTriggerContext);
  const ownState = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const state = trigger?.state ?? ownState;
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen);
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting}>
      <DialogModal
        {...props}
        state={state}
        isExiting={isExiting}
        exitProps={exitProps}
        triggerOverlayProps={trigger?.overlayProps}
      />
    </Overlay>
  );
}

function DialogModal({
  state,
  isExiting,
  exitProps,
  triggerOverlayProps,
  role = 'dialog',
  dismissable,
  keyboardDismissDisabled,
  icon,
  fullScreen = 'never',
  children,
  className,
  classNames,
  style,
  ref,
  ...rest
}: Omit<DialogProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  state: OverlayTriggerState;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  triggerOverlayProps?: { id?: string };
}) {
  const panelRef = useObjectRef(ref as Ref<HTMLDivElement>);
  const { modalProps, underlayProps } = useModalOverlay(
    {
      isDismissable: (dismissable ?? role !== 'alertdialog') && !isExiting,
      isKeyboardDismissDisabled: keyboardDismissDisabled,
    },
    state,
    panelRef,
  );
  const { dialogProps, titleProps } = useDialog({ ...rest, role }, panelRef);
  const hasIcon = fullScreen !== 'always' && icon !== undefined && icon !== null;
  const styles = dialogStyles({ hasIcon, fullScreen });
  const exiting = isExiting || undefined;

  return (
    <>
      <div
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div {...underlayProps} className={styles.positioner()}>
        <div {...exitProps} data-exiting={exiting} className={styles.motion()}>
          <div
            {...mergeProps(rest, triggerOverlayProps ?? {}, modalProps, dialogProps)}
            ref={panelRef}
            style={style}
            data-exiting={exiting}
            data-full-screen={fullScreen === 'never' ? undefined : fullScreen}
            className={styles.panel({ class: cn(classNames?.panel, className) })}
          >
            <TriggerContext value={null}>
              <DialogPartsContext value={{ titleProps, hasIcon, fullScreen, close: state.close }}>
                {hasIcon && (
                  <span
                    aria-hidden="true"
                    className={styles.icon({
                      class: cn(fullScreen === 'compact' && 'max-medium:hidden', classNames?.icon),
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
      className={dialogStyles({ hasIcon }).title({ class: className })}
    />
  );
}

export interface DialogHeaderClassNames {
  root?: string;
  close?: string;
  title?: string;
}

export interface DialogHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** The headline; it names the dialog. */
  children: ReactNode;
  /** Accessible name of the close button. */
  closeLabel: string;
  /** The confirming action, usually a text `Button` ("Save"). Shown in full screen only. */
  action?: ReactNode;
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
  className,
  classNames,
  ...props
}: DialogHeaderProps) {
  const { titleProps, hasIcon, fullScreen, close } = useContext(DialogPartsContext);
  const styles = dialogStyles({ hasIcon, fullScreen });
  return (
    <div {...props} className={styles.header({ class: cn(classNames?.root, className) })}>
      {fullScreen !== 'never' && (
        <IconButton
          icon={<CloseIcon />}
          aria-label={closeLabel}
          onPress={close}
          className={styles.headerButton({ class: classNames?.close })}
        />
      )}
      <h2 {...titleProps} className={styles.title({ class: classNames?.title })}>
        {children}
      </h2>
      {fullScreen !== 'never' && action !== undefined && (
        <div className={styles.headerButton()}>{action}</div>
      )}
    </div>
  );
}

export type DialogContentProps = ComponentPropsWithRef<'div'>;

/** The dialog's supporting text or content; scrolls when the dialog is too tall. */
export function DialogContent({ className, ...props }: DialogContentProps) {
  const { fullScreen } = useContext(DialogPartsContext);
  return <div {...props} className={dialogStyles({ fullScreen }).content({ class: className })} />;
}

export type DialogActionsProps = ComponentPropsWithRef<'div'>;

/**
 * Row of actions at the end of the dialog, 8px apart. Put the confirming action last:
 * when the actions do not fit on one line they stack with it on top. Hidden while the
 * dialog is full screen, where `DialogHeader` carries the confirming action.
 */
export function DialogActions({ className, ...props }: DialogActionsProps) {
  const { fullScreen } = useContext(DialogPartsContext);
  return <div {...props} className={dialogStyles({ fullScreen }).actions({ class: className })} />;
}
