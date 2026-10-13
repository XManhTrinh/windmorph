'use client';

import { useRef, type ReactNode } from 'react';
import { mergeProps, useDialog, useModalOverlay } from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import { TriggerContext } from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { dialogStyles } from '../dialog/dialog-styles';
import { pickerDialogStyles } from './picker-dialog-styles';

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

export interface PickerDialogClassNames {
  scrim?: string;
  panel?: string;
  actions?: string;
}

interface PickerDialogOwnProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * `date` holds a date picker edge to edge with the actions below (Compose's
   * `DatePickerDialog`); `time` pads the content 24px under a "Select time" style title
   * (Compose's `TimePickerDialog`). @default "date"
   */
  variant?: 'date' | 'time';
  /** Title for the time variant, e.g. "Select time". */
  title?: ReactNode;
  /** The confirm button (last, at the end), e.g. `<Button variant="text">OK</Button>`. */
  confirmButton: ReactNode;
  /** The dismiss button, before the confirm button. */
  dismissButton?: ReactNode;
  /** A control at the start of the actions row, e.g. the time picker's mode toggle. */
  modeToggleButton?: ReactNode;
  /** Pressing outside closes the dialog. @default true */
  dismissable?: boolean;
  /** The picker. */
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  className?: string;
  classNames?: PickerDialogClassNames;
}

export type PickerDialogProps = PickerDialogOwnProps & Naming;

/**
 * The modal dialog for a date or time picker (Compose's `DatePickerDialog` /
 * `TimePickerDialog`): the picker on a `surface-container-high` panel with 28px corners at
 * level 3, and its actions.
 *
 * @example
 * <PickerDialog aria-label="Select date" open={open} onOpenChange={setOpen}
 *   dismissButton={<Button variant="text" onPress={() => setOpen(false)}>Cancel</Button>}
 *   confirmButton={<Button variant="text" onPress={confirm}>OK</Button>}>
 *   <DatePicker value={draft} onChange={setDraft} />
 * </PickerDialog>
 */
export function PickerDialog({ open, defaultOpen, onOpenChange, ...props }: PickerDialogProps) {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen);
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting}>
      <PickerDialogModal {...props} state={state} isExiting={isExiting} exitProps={exitProps} />
    </Overlay>
  );
}

function PickerDialogModal({
  state,
  isExiting,
  exitProps,
  variant = 'date',
  title,
  confirmButton,
  dismissButton,
  modeToggleButton,
  dismissable = true,
  children,
  className,
  classNames,
  ...labelling
}: Omit<PickerDialogProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  state: OverlayTriggerState;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { modalProps, underlayProps } = useModalOverlay(
    { isDismissable: dismissable && !isExiting },
    state,
    panelRef,
  );
  const { dialogProps, titleProps } = useDialog(labelling, panelRef);
  const shell = dialogStyles();
  const styles = pickerDialogStyles({ variant });
  const exiting = isExiting || undefined;
  return (
    <>
      <div
        aria-hidden="true"
        data-exiting={exiting}
        className={shell.scrim({ class: classNames?.scrim })}
      />
      <div {...underlayProps} className={shell.positioner()}>
        <div {...exitProps} data-exiting={exiting} className={shell.motion()}>
          <div
            {...mergeProps(modalProps, dialogProps)}
            ref={panelRef}
            className={styles.panel({ class: cn(classNames?.panel, className) })}
          >
            <TriggerContext value={null}>
              {variant === 'time' && title != null && (
                <h2 {...titleProps} className={styles.title()}>
                  {title}
                </h2>
              )}
              <div className={styles.content()}>
                {typeof children === 'function' ? children({ close: state.close }) : children}
              </div>
              <div className={styles.actions({ class: classNames?.actions })}>
                {modeToggleButton}
                <div className={styles.buttons()}>
                  {dismissButton}
                  {confirmButton}
                </div>
              </div>
            </TriggerContext>
          </div>
        </div>
      </div>
    </>
  );
}
