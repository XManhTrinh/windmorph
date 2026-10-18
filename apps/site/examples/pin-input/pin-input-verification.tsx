'use client';

import { PinInput } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * An email verification code: two groups of three, submitted as soon as the sixth digit is
 * typed, pasted or autofilled. A wrong code shakes the row, clears it and is announced.
 */
export function PinInputVerification() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'wrong' | 'verified'>('idle');

  return (
    <div className="flex flex-col gap-3">
      <PinInput
        label="6-digit code"
        groups={[3, 3]}
        value={code}
        onChange={(next) => {
          setCode(next);
          setStatus('idle');
        }}
        onComplete={(value) => {
          if (value === '123456') return setStatus('verified');
          setStatus('wrong');
          setCode('');
        }}
        invalid={status === 'wrong'}
        errorMessage="That code didn't work. Try 123456."
        supportingText="We sent it to m•••@example.com. Try 123456."
      />
      <p role="status" className="text-body-medium text-on-surface-variant">
        {status === 'verified' ? 'Verified' : ''}
      </p>
    </div>
  );
}
