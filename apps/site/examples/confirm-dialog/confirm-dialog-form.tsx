'use client';

import { Button, Dialog, DialogContent, DialogTitle, TextField } from '@windmorph/react';
import { ConfirmDialogActions } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * `ConfirmDialogActions` is the dialog's row of actions as a part, for a form in a core
 * `Dialog`: with `type="submit"` the acting button submits the form, and while `pending` it
 * shows that it's working and Cancel is disabled.
 */
export function ConfirmDialogForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('Harbour Bakery');

  return (
    <>
      <Button variant="tonal" onPress={() => setOpen(true)}>
        Rename the shop
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!saving) setOpen(next);
        }}
        role="dialog"
        closedBy={saving ? 'none' : 'closerequest'}
      >
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            setSaving(true);
            setTimeout(() => {
              setSaving(false);
              setOpen(false);
            }, 1200);
          }}
        >
          <DialogTitle>Rename the shop</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              required
              autoFocus
              className="w-full"
            />
          </DialogContent>
          <ConfirmDialogActions
            confirmLabel="Save"
            type="submit"
            pending={saving}
            onCancel={() => setOpen(false)}
          />
        </form>
      </Dialog>
    </>
  );
}
