'use client';

import { Button, ButtonGroup, IconButton } from '@windmorph/react';
import { useState } from 'react';
import {
  ContentCopyIcon,
  DeleteIcon,
  EditIcon,
  SendIcon,
  StarIcon,
  StarOutlineIcon,
} from '../../components/icons';

/**
 * A note's actions on a narrow card. With `overflow`, the trailing actions that don't fit
 * fold into a "More options" menu and come back as the card widens: drag the slider. Each
 * menu item presses its button, a toggle shows its state, and a disabled action stays
 * disabled.
 */
export function ButtonGroupOverflow() {
  const [width, setWidth] = useState(300);
  const [last, setLast] = useState('none');
  return (
    <div className="flex w-full flex-col gap-4">
      <label className="flex items-center gap-3 text-body-medium text-on-surface-variant">
        Card width
        <input
          type="range"
          min={160}
          max={560}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
        />
        {width}px
      </label>
      <div style={{ width }} className="max-w-full rounded-corner-medium bg-surface-container p-4">
        <ButtonGroup aria-label="Note actions" overflow buttonVariant="tonal">
          <Button leadingIcon={<EditIcon />} onPress={() => setLast('Edit')}>
            Edit
          </Button>
          <Button leadingIcon={<SendIcon />} onPress={() => setLast('Share')}>
            Share
          </Button>
          <Button toggle leadingIcon={<StarOutlineIcon />} selectedLeadingIcon={<StarIcon />}>
            Favourite
          </Button>
          <Button leadingIcon={<ContentCopyIcon />} onPress={() => setLast('Duplicate')}>
            Duplicate
          </Button>
          <IconButton icon={<DeleteIcon />} aria-label="Delete" disabled />
        </ButtonGroup>
      </div>
      <p className="text-body-medium text-on-surface-variant">Last action: {last}</p>
    </div>
  );
}
