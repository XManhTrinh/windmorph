'use client';

import { PhoneField, type PhoneCountry } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * An optional phone at sign-up: it starts on the visitor's country with the app's main
 * markets first, and reports one E.164 value, whatever was typed or pasted.
 */
export function PhoneFieldSignup() {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<PhoneCountry>('GB');
  return (
    <div className="flex flex-col gap-3">
      <PhoneField
        label="Phone (optional)"
        supportingText="For order updates. Never shown on your profile."
        defaultCountry="GB"
        priorityCountries={['GB', 'US', 'CA', 'AU']}
        value={phone}
        onChange={setPhone}
        onCountryChange={setCountry}
      />
      <p className="text-body-medium text-on-surface-variant">
        Value: <code className="text-on-surface">{phone || "''"}</code> · Country:{' '}
        <code className="text-on-surface">{country}</code>
      </p>
    </div>
  );
}
