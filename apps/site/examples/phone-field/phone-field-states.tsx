import { PhoneField } from '@windmorph/react-pro';

/**
 * Required, read-only and disabled, and a field whose country names follow its `locale`
 * (French here) rather than the page's.
 */
export function PhoneFieldStates() {
  return (
    <div className="grid w-full gap-6 medium:grid-cols-2">
      <PhoneField label="Phone" required supportingText="We'll text you a code." />
      <PhoneField label="Phone (read-only)" defaultValue="+447400123456" readOnly />
      <PhoneField label="Phone (disabled)" defaultValue="+14155550132" disabled />
      <PhoneField
        label="Téléphone"
        locale="fr-FR"
        defaultCountry="FR"
        priorityCountries={['FR', 'BE', 'CH', 'CA']}
      />
    </div>
  );
}
