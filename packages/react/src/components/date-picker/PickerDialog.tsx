'use client';

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { mergeProps, useDialog, useModalOverlay } from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import { TriggerContext } from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { Button } from '../button/Button';
import { dialogStyles } from '../dialog/dialog-styles';
import { IconButton } from '../icon-button/IconButton';
import { PickerDialogContext } from './picker-dialog-context';
import { pickerDialogStyles } from './picker-dialog-styles';
import { CloseIcon } from './picker-icons';
import { COMPACT_WINDOW, useMediaQuery } from './use-media-query';

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

export interface PickerDialogClassNames {
  scrim?: string;
  panel?: string;
  /** The full-screen top row with the close and Save buttons. */
  header?: string;
  /** The full-screen close (x) icon button. */
  close?: string;
  actions?: string;
}

/** Words of a {@link PickerDialog}, for localisation. */
export interface PickerDialogStrings {
  /** The full-screen close (x) button. @default "Close" */
  close?: string;
  /** The full-screen confirm button. @default "Save" */
  save?: string;
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
  /**
   * Saves the picked value. With it, Enter on a day (or in a typed date) confirms and
   * closes the dialog (the M3 date picker keyboard table), and the full-screen form gets
   * its Save button. Called after the picker's latest value has rendered.
   */
  onConfirm?: () => void;
  /** The confirm button (last, at the end), e.g. `<Button variant="text">OK</Button>`. */
  confirmButton: ReactNode;
  /** The dismiss button, before the confirm button. */
  dismissButton?: ReactNode;
  /** A control at the start of the actions row, e.g. the time picker's mode toggle. */
  modeToggleButton?: ReactNode;
  /**
   * Fill the window, with a close (x) icon button and a Save button at the top instead of
   * the actions (M3: a full-screen modal date picker is recommended on compact windows).
   * `compact` does so below 600px wide. @default "never"
   */
  fullScreen?: 'never' | 'always' | 'compact';
  /** Icon of the full-screen close button. */
  closeIcon?: ReactElement;
  /** Pressing outside closes the dialog. @default true */
  dismissable?: boolean;
  strings?: PickerDialogStrings;
  /** The picker. */
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  className?: string;
  classNames?: PickerDialogClassNames;
}

export type PickerDialogProps = PickerDialogOwnProps & Naming;

/**
 * The modal dialog for a date or time picker (Compose's `DatePickerDialog` /
 * `TimePickerDialog`): the picker on a `surface-container-high` panel with 28px corners at
 * level 3, and its actions; or, full screen, edge to edge with close and Save at the top.
 *
 * @example
 * <PickerDialog aria-label="Select date" open={open} onOpenChange={setOpen}
 *   onConfirm={() => setDate(draft)}
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
  onConfirm,
  confirmButton,
  dismissButton,
  modeToggleButton,
  fullScreen = 'never',
  closeIcon,
  dismissable = true,
  strings = {},
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
  const compact = useMediaQuery(COMPACT_WINDOW);
  const full = fullScreen === 'always' || (fullScreen === 'compact' && compact);
  const shell = dialogStyles({ fullScreen: full ? 'always' : 'never' });
  const styles = pickerDialogStyles({ variant, fullScreen: full });
  const exiting = isExiting || undefined;

  // Enter on a day selects it first; confirm once the consumer has the new value, so the
  // latest `onConfirm` (reading that value) runs.
  const latest = useRef({ onConfirm, close: state.close });
  useLayoutEffect(() => {
    latest.current = { onConfirm, close: state.close };
  });
  const [requestConfirm] = useState(() => () => {
    setTimeout(() => {
      latest.current.onConfirm?.();
      latest.current.close();
    });
  });
  const canConfirm = onConfirm !== undefined;
  const context = useMemo(
    () => (canConfirm ? { requestConfirm } : null),
    [canConfirm, requestConfirm],
  );

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
            // The picker's component tokens (date-picker-tokens.ts, time-picker-tokens.ts)
            // paint the panel; `data-variant` is also a public styling hook.
            data-tokens={variant === 'time' ? 'md-comp-time-picker' : 'md-comp-date-picker-modal'}
            data-variant={variant}
            data-full-screen={full || undefined}
            className={styles.panel({ class: cn(classNames?.panel, className) })}
          >
            <TriggerContext value={null}>
              {full && (
                <div className={styles.header({ class: classNames?.header })}>
                  <IconButton
                    variant="standard"
                    icon={closeIcon ?? <CloseIcon />}
                    aria-label={strings.close ?? 'Close'}
                    onPress={state.close}
                    className={styles.close({ class: classNames?.close })}
                  />
                  <div className={styles.buttons()}>
                    {modeToggleButton}
                    {onConfirm ? (
                      <Button variant="text" onPress={requestConfirm}>
                        {strings.save ?? 'Save'}
                      </Button>
                    ) : (
                      confirmButton
                    )}
                  </div>
                </div>
              )}
              {variant === 'time' && title != null && (
                <h2 {...titleProps} className={styles.title()}>
                  {title}
                </h2>
              )}
              <PickerDialogContext value={context}>
                <div className={styles.content()}>
                  {typeof children === 'function' ? children({ close: state.close }) : children}
                </div>
              </PickerDialogContext>
              {!full && (
                <div className={styles.actions({ class: classNames?.actions })}>
                  {modeToggleButton}
                  <div className={styles.buttons()}>
                    {dismissButton}
                    {confirmButton}
                  </div>
                </div>
              )}
            </TriggerContext>
          </div>
        </div>
      </div>
    </>
  );
}
