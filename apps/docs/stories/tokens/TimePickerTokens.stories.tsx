import { Time } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, PickerDialog, TimePicker } from '@windmorph/react';
import { useLayoutEffect, useRef } from 'react';
import { TokenProbe } from './probe';

/** The time picker's component tokens, probed by e2e/component-tokens.spec.ts. */
const meta = {
  title: 'Tokens/md-comp-time-picker',
  tags: ['tokens-probe'],
} satisfies Meta;

export default meta;

const TIME = new Time(14, 5);

function Instances() {
  const ref = useRef<HTMLDivElement>(null);
  // Select the minute, so the first time selector (the hour) is the unselected one.
  useLayoutEffect(() => {
    ref.current?.querySelectorAll<HTMLInputElement>('[data-slot="time-selector"]')[1]?.focus();
  }, []);
  return (
    <>
      <TimePicker ref={ref} defaultValue={TIME} hourCycle={12} layout="vertical" />
      <PickerDialog
        aria-label="Select time"
        variant="time"
        title="Select time"
        defaultOpen
        closedBy="closerequest"
        confirmButton={<Button variant="text">OK</Button>}
      >
        <TimePicker defaultValue={TIME} hourCycle={12} layout="vertical" />
      </PickerDialog>
    </>
  );
}

export const Probe: StoryObj = {
  render: () => (
    <TokenProbe
      instances={<Instances />}
      scoped={<TimePicker defaultValue={TIME} hourCycle={12} layout="vertical" />}
      override={{
        token: '--md-comp-time-picker-clock-dial-color',
        children: (
          <TimePicker
            defaultValue={TIME}
            hourCycle={12}
            layout="vertical"
            className="[&_[data-slot=clock-dial]]:fill-tertiary"
          />
        ),
      }}
    />
  ),
};
