'use client';

import { Button, TextField } from '@windmorph/react';
import { ConfirmDialog } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * Something the decision needs goes between the description and the actions. Focus starts
 * in it (`initialFocus="content"`), the action waits for it (`confirmDisabled`), and the way
 * out is renamed through `labels`.
 */
export function ConfirmDialogContent() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <>
      <Button variant="tonal" onPress={() => setOpen(true)}>
        Delete the shop
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setPassword('');
        }}
        title="Delete the shop?"
        description="The page goes offline straight away. It can be restored for 30 days."
        confirmLabel="Delete shop"
        destructive
        confirmDisabled={password === ''}
        initialFocus="content"
        labels={{ cancel: 'Keep the shop' }}
        onConfirm={() => setOpen(false)}
      >
        <TextField
          type="password"
          label="Your password"
          value={password}
          onChange={setPassword}
          className="w-full"
        />
      </ConfirmDialog>
    </>
  );
}
