'use client';

import { Button, IconButton, Tooltip, TooltipTrigger } from '@windmorph/react';
import { FileTrigger } from '@windmorph/react-pro';
import { useState } from 'react';
import { EditIcon } from '../../components/icons';

/** Any library button opens the picker; inside a TooltipTrigger, the tooltip still works. */
export function FileTriggerPhoto() {
  const [chosen, setChosen] = useState<string[]>([]);
  const show = (files: File[]) => setChosen(files.map((file) => file.name));
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <FileTrigger accept={['image/jpeg', 'image/png', 'image/webp']} onSelect={show}>
          <Button variant="filled">Upload photo</Button>
        </FileTrigger>
        <FileTrigger accept={['image/*']} capture="environment" onSelect={show}>
          <Button variant="outlined">Take photo</Button>
        </FileTrigger>
        <TooltipTrigger>
          <FileTrigger accept={['image/*']} multiple onSelect={show}>
            <IconButton variant="tonal" icon={<EditIcon />} aria-label="Add photos" />
          </FileTrigger>
          <Tooltip>Add photos</Tooltip>
        </TooltipTrigger>
      </div>
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {chosen.length > 0 ? `Chosen: ${chosen.join(', ')}` : 'Nothing chosen yet.'}
      </p>
    </div>
  );
}
