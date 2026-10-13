'use client';

import { Button } from '@windmorph/react';
import { FileTrigger } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * `directory` chooses a whole folder (and everything in it) where the browser supports it;
 * `multiple` lets the person pick several files at once.
 */
export function FileTriggerFolder() {
  const [chosen, setChosen] = useState<File[]>([]);
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-3">
        <FileTrigger directory onSelect={setChosen}>
          <Button variant="tonal">Upload a folder</Button>
        </FileTrigger>
        <FileTrigger multiple accept={['.pdf', '.docx']} onSelect={setChosen}>
          <Button variant="outlined">Choose documents</Button>
        </FileTrigger>
      </div>
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {chosen.length > 0
          ? `${chosen.length} ${chosen.length === 1 ? 'file' : 'files'}: ${chosen
              .slice(0, 3)
              .map((file) => file.name)
              .join(', ')}${chosen.length > 3 ? '…' : ''}`
          : 'Nothing chosen yet.'}
      </p>
    </div>
  );
}
