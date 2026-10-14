'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Radio,
  RadioGroup,
} from '@windmorph/react';

const RINGTONES = ['Callisto', 'Ganymede', 'Luna', 'Oberon', 'Phobos', 'Titania', 'Umbriel'];

/**
 * A choice in a basic dialog. `dividers` on `DialogContent` draws the spec's optional
 * dividers above and below the list. The confirming action stays disabled until a choice
 * is made; the dismissive action never is. Long content scrolls, and the keyboard can
 * reach and scroll it.
 */
export function DialogDividers() {
  const [choice, setChoice] = useState('');
  return (
    <DialogTrigger onOpenChange={(open) => open && setChoice('')}>
      <Button variant="tonal">Phone ringtone</Button>
      <Dialog classNames={{ panel: 'max-h-[70vh]' }}>
        {({ close }) => (
          <>
            <DialogTitle>Phone ringtone</DialogTitle>
            <DialogContent dividers>
              <RadioGroup aria-label="Ringtone" value={choice} onChange={setChoice}>
                {RINGTONES.map((name) => (
                  <Radio key={name} value={name}>
                    {name}
                  </Radio>
                ))}
              </RadioGroup>
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" disabled={choice === ''} onPress={close}>
                OK
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
