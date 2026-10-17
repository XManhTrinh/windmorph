import { PropsTable } from '@windmorph/react-pro';
import { GREETING_PROPS } from './sample-rows';

/** Every word the table shows or says comes from `labels`, here in German. */
export function PropsTableLabels() {
  return (
    <PropsTable
      rows={GREETING_PROPS}
      labels={{
        caption: 'Eigenschaften von Greeting',
        name: 'Name',
        type: 'Typ',
        default: 'Standardwert',
        description: 'Beschreibung',
        required: 'erforderlich',
      }}
    />
  );
}
