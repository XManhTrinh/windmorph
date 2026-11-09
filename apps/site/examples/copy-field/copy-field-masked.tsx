'use client';

import { CopyField } from '@windmorph/react-pro';
import { useState } from 'react';

/** `copyValue` copies something other than what shows; `onCopy` and `onCopyError` report it. */
export function CopyFieldMasked() {
  const [message, setMessage] = useState('');
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <CopyField
        label="Access key"
        value="••••••••3f9a"
        copyValue="demo-key-3f9a"
        onCopy={() => setMessage('Copied')}
        onCopyError={() => setMessage('The browser refused')}
      />
      <p role="status" className="text-body-medium text-on-surface-variant">
        {message}
      </p>
    </div>
  );
}
