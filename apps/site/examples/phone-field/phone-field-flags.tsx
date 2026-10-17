'use client';

import { PhoneField, type PhoneCountry } from '@windmorph/react-pro';

/** Regional-indicator emoji; an app can use its own flag icons instead. */
const emojiFlag = (country: PhoneCountry) =>
  String.fromCodePoint(...[...country].map((letter) => 0x1f1a5 + letter.charCodeAt(0)));

/**
 * Flags are the app's choice: none by default (emoji flags show as letters on Windows, and
 * flag images add weight), and `renderFlag` adds them to the button and the list.
 */
export function PhoneFieldFlags() {
  return (
    <PhoneField
      label="Phone"
      defaultCountry="DE"
      priorityCountries={['FR', 'GB', 'US', 'CA']}
      renderFlag={(country) => <span aria-hidden="true">{emojiFlag(country)}</span>}
    />
  );
}
