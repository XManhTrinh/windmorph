import { Button, DialogActions, DialogContent, DialogTitle, dialogStyles } from '@windmorph/react';
import type { ReactNode } from 'react';

/**
 * A basic dialog's panel shown in place, for a side-by-side comparison: the dialog's own
 * panel styles and component tokens with its real title, content and actions, without the
 * modal overlay a `Dialog` opens in.
 */
function Panel({ children }: { children: ReactNode }) {
  return (
    <div
      data-tokens="md-comp-dialog"
      className={dialogStyles().panel({ class: 'w-full max-w-80 min-w-0' })}
    >
      {children}
    </div>
  );
}

/** Do: a specific question, with actions that say what they do. */
export function DialogDoSpecific() {
  return (
    <Panel>
      <DialogTitle>Delete 3 photos?</DialogTitle>
      <DialogContent>They&apos;ll be removed from this device and your albums.</DialogContent>
      <DialogActions>
        <Button variant="text">Cancel</Button>
        <Button variant="text">Delete</Button>
      </DialogActions>
    </Panel>
  );
}

/** Don't: an ambiguous question with vague actions. */
export function DialogDontAmbiguous() {
  return (
    <Panel>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>This can&apos;t be undone.</DialogContent>
      <DialogActions>
        <Button variant="text">No</Button>
        <Button variant="text">OK</Button>
      </DialogActions>
    </Panel>
  );
}

/** Do: the dismissive action first, the confirming action last. */
export function DialogDoActionOrder() {
  return (
    <Panel>
      <DialogTitle>Discard draft?</DialogTitle>
      <DialogActions>
        <Button variant="text">Cancel</Button>
        <Button variant="text">Discard</Button>
      </DialogActions>
    </Panel>
  );
}

/** Don't: the confirming action before the dismissive one. */
export function DialogDontActionOrder() {
  return (
    <Panel>
      <DialogTitle>Discard draft?</DialogTitle>
      <DialogActions>
        <Button variant="text">Discard</Button>
        <Button variant="text">Cancel</Button>
      </DialogActions>
    </Panel>
  );
}
