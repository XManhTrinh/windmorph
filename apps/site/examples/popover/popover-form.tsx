'use client';

import { Button, TextField } from '@windmorph/react';
import { Popover, PopoverTrigger } from '@windmorph/react-pro';
import { useState } from 'react';

/** A small form, controlled, that an accidental press outside shouldn't close. */
export function PopoverForm() {
  const [open, setOpen] = useState(false);
  return (
    <PopoverTrigger open={open} onOpenChange={setOpen}>
      <Button variant="outlined">Rename</Button>
      <Popover aria-label="Rename" headline="Rename" closedBy="closerequest" placement="bottom-end">
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <TextField label="Name" defaultValue="Quarterly report" />
          <Button type="submit" variant="text">
            Save
          </Button>
        </form>
      </Popover>
    </PopoverTrigger>
  );
}
