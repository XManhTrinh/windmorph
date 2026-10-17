'use client';

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type CSSProperties,
  type Ref,
} from 'react';
import { mergeProps, useDialog, useModalOverlay, useObjectRef } from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import { TriggerContext } from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { Button } from '../button/Button';
import { DIALOG_ROOT_STYLE, dialogStyles } from '../dialog/dialog-styles';
import type { DialogTransition } from '../dialog/Dialog';
import { IconButton } from '../icon-button/IconButton';
import { PickerDialogContext } from './picker-dialog-context';
import { pickerDialogStyles } from './picker-dialog-styles';
import { CloseIcon } from './picker-icons';
import { COMPACT_WINDOW, useMediaQuery } from './use-media-query';
import { closedByOverlayOptions, type ClosedBy } from '../../utils/closed-by';

type Naming =
  | {
      /** Accessible name of the dialog when there's no visible title. */
      'aria-label': string;
    }
  | {
      /** Id of a visible element that names the dialog. */
      'aria-labelledby': string;
    };

export interface PickerDialogClassNames {
  /** The dimmed layer behind the dialog. */
  scrim?: string;
  /** The dialog's surface: its colour, corners, padding and shadow. */
  panel?: string;
  /** The full-screen top row with the close and Save buttons. */
  header?: string;
  /** The full-screen close (x) icon button. */
  close?: string;
  /** The time picker dialog's `title` ("Select time"). */
  title?: string;
  /** The bottom row of actions: mode toggle, dismiss and confirm buttons. */
  actions?: string;
}

/** Words of a {@link PickerDialog}, for localisation. */
export interface PickerDialogLabels {
  /** The full-screen close (x) button. @default "Close" */
  close: string;
  /** The full-screen confirm button. @default "Save" */
  save: string;
}

interface PickerDialogOwnProps {
  /** Whether the dialog is open (controlled). */
  open?: boolean;
  /** Whether the dialog starts open when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the dialog opens or closes. */
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
  /**
   * How the dialog enters and leaves, as `Dialog`'s `transition`: `reveal`, the M3 dialog
   * motion (it slides down while its container grows, then the picker and the actions fade
   * in), or `scale`, the original pop (a fade with a scale from 90%). Reduced motion keeps only
   * the fades. Ignored while the dialog is full screen.
   * @default "reveal"
   */
  transition?: DialogTransition;
  /**
   * How the user can close the dialog, as HTML's `<dialog closedby>`: `any` (Escape or a
   * press outside), `closerequest` (Escape only) or `none` (only its actions or the app).
   * @default "any"
   */
  closedBy?: ClosedBy;
  /** Words the full-screen form shows and announces, with English defaults. */
  labels?: Partial<PickerDialogLabels>;
  /** The picker. */
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  /**
   * Goes on the outermost element, a full-window layer whose inline placement it can't
   * move, so a layout class (`static`, `overflow-hidden`, a transform) never hides or clips
   * the dialog. Style the surface with `classNames.panel`.
   */
  className?: string;
  /** Inline styles for the outermost element, with `className`. */
  style?: CSSProperties;
  /** The dialog's id (on the panel, the `dialog` element). */
  id?: string;
  /** Ref to the panel, the `dialog` element. */
  ref?: Ref<HTMLDivElement>;
  /** Classes for each part, by slot. */
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
    <Overlay exiting={isExiting}>
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
  closedBy = 'any',
  transition = 'reveal',
  labels = {},
  children,
  className,
  style,
  ref,
  classNames,
  ...labelling
}: Omit<PickerDialogProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  state: OverlayTriggerState;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
}) {
  const panelRef = useObjectRef(ref);
  const { modalProps, underlayProps } = useModalOverlay(
    closedByOverlayOptions(closedBy, isExiting),
    state,
    panelRef,
  );
  const { dialogProps, titleProps } = useDialog(labelling, panelRef);
  const compact = useMediaQuery(COMPACT_WINDOW);
  const full = fullScreen === 'always' || (fullScreen === 'compact' && compact);
  const shell = dialogStyles({ fullScreen: full ? 'always' : 'never', transition });
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
      <div style={{ ...style, ...DIALOG_ROOT_STYLE }} className={shell.root({ class: className })}>
        <div {...underlayProps} className={shell.positioner()}>
          <div
            {...exitProps}
            data-exiting={exiting}
            className={shell.motion({ class: styles.motion() })}
          >
            <div
              {...mergeProps(modalProps, dialogProps)}
              ref={panelRef}
              data-exiting={exiting}
              // The picker's component tokens (date-picker-tokens.ts, time-picker-tokens.ts)
              // paint the panel; `data-variant` is also a public styling hook.
              data-tokens={variant === 'time' ? 'md-comp-time-picker' : 'md-comp-date-picker-modal'}
              data-variant={variant}
              data-full-screen={full || undefined}
              className={styles.panel({
                class: [transition === 'reveal' && shell.parts(), classNames?.panel],
              })}
            >
              <TriggerContext value={null}>
                {full && (
                  <div className={styles.header({ class: classNames?.header })}>
                    <IconButton
                      variant="standard"
                      density={0}
                      icon={closeIcon ?? <CloseIcon />}
                      aria-label={labels.close ?? 'Close'}
                      onPress={state.close}
                      className={styles.close({ class: classNames?.close })}
                    />
                    <div className={styles.buttons()}>
                      {modeToggleButton}
                      {onConfirm ? (
                        <Button variant="text" onPress={requestConfirm}>
                          {labels.save ?? 'Save'}
                        </Button>
                      ) : (
                        confirmButton
                      )}
                    </div>
                  </div>
                )}
                {variant === 'time' && title != null && (
                  <h2 {...titleProps} className={styles.title({ class: classNames?.title })}>
                    {title}
                  </h2>
                )}
                <PickerDialogContext value={context}>
                  <div className={styles.content()}>
                    {typeof children === 'function' ? children({ close: state.close }) : children}
                  </div>
                </PickerDialogContext>
                {!full && (
                  <div
                    data-slot="actions"
                    className={styles.actions({ class: classNames?.actions })}
                  >
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
      </div>
    </>
  );
}
