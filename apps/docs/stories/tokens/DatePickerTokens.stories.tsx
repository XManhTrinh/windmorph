import { getLocalTimeZone, today } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, DatePicker, DateRangePicker, PickerDialog } from '@windmorph/react';
import { TokenProbe } from './probe';

/** The modal date picker's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-date-picker-modal',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

function Instances() {
  // This month, so today's outline shows, with a range that never touches today.
  const now = today(getLocalTimeZone());
  const start = now.set({ day: now.day <= 14 ? 20 : 3 });
  return (
    <>
      <DateRangePicker monthLayout="paged" defaultValue={{ start, end: start.add({ days: 4 }) }} />
      <PickerDialog
        aria-label="Select date"
        defaultOpen
        closedBy="closerequest"
        confirmButton={<Button variant="text">OK</Button>}
      >
        <DatePicker defaultValue={start} />
      </PickerDialog>
    </>
  );
}

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Instances />}
      scoped={<DatePicker />}
      override={{
        token: '--md-comp-date-picker-modal-header-headline-color',
        children: <DatePicker className="[&_[data-slot=headline]]:text-tertiary" />,
      }}
    />
  ),
};
