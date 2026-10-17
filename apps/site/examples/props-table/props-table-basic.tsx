import { PropsTable } from '@windmorph/react-pro';
import { GREETING_PROPS } from './sample-rows';

/**
 * One row per prop: its name, type, default and description. A required prop shows an
 * asterisk, and screen readers hear "required". The caption is visually hidden; it names the
 * table and the region that scrolls it sideways on a narrow screen.
 */
export function PropsTableBasic() {
  return <PropsTable caption="Greeting props" rows={GREETING_PROPS} />;
}
