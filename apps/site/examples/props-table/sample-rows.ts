import type { PropsTableRow } from '@windmorph/react-pro';

/** A small component's props, as your own docs build would read them from its types. */
export const GREETING_PROPS: PropsTableRow[] = [
  {
    name: 'name',
    type: 'string',
    required: true,
    description: 'Who to greet.',
  },
  {
    name: 'color',
    type: '"neutral" | "primary"',
    defaultValue: '"neutral"',
    description: 'The colour of the greeting.',
  },
  {
    name: 'onDismiss',
    type: '() => void',
    description: 'Called when the greeting is closed. Without it, there is no close button.',
  },
];
