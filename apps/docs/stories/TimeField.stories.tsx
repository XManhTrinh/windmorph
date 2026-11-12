import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Time,
  TimeField,
} from '@windmorph/react';
import { useState } from 'react';
import {
  LAYOUT_OVERRIDE_NAMES,
  LAYOUT_OVERRIDES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = {
  title: 'Components/TimeField',
  component: TimeField,
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj;

/** Both variants, both clocks, with text, an error, and disabled. */
export const Variants: Story = {
  render: () => (
    <div data-testid="variants" className="grid w-max grid-cols-3 gap-4 bg-surface p-4">
      <TimeField label="Empty" hourCycle={24} />
      <TimeField label="24-hour" defaultValue={new Time(9, 30)} hourCycle={24} />
      <TimeField label="12-hour" defaultValue={new Time(21, 30)} hourCycle={12} />
      <TimeField label="Filled" variant="filled" defaultValue={new Time(9, 30)} hourCycle={24} />
      <TimeField label="Invalid" invalid errorMessage="Pick a later time" hourCycle={24} />
      <TimeField label="Disabled" defaultValue={new Time(9, 30)} disabled hourCycle={24} />
    </div>
  ),
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/** Many times on one page, at density -2 (48px). */
export const Schedule: Story = {
  render: function ScheduleStory() {
    const [times, setTimes] = useState<Record<string, Time | null>>({});
    return (
      <div data-testid="schedule" className="flex w-max flex-col gap-2 bg-surface p-4">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <span className="w-24 text-body-medium text-on-surface">{day}</span>
            {(['Opens', 'Closes'] as const).map((part) => (
              <TimeField
                key={part}
                label={`${day} ${part}`}
                density={-2}
                hourCycle={24}
                value={times[`${day}-${part}`] ?? null}
                onChange={(time) =>
                  setTimes((current) => ({ ...current, [`${day}-${part}`]: time }))
                }
              />
            ))}
          </div>
        ))}
      </div>
    );
  },
};

/** The picker opened from inside a dialog. */
export const InDialog: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Edit hours</Button>
      <Dialog role="dialog">
        <DialogTitle>Opening hours</DialogTitle>
        <DialogContent>
          <TimeField label="Opens at" defaultValue={new Time(9, 30)} hourCycle={24} />
        </DialogContent>
        <DialogActions>
          <Button variant="text" slot="close">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </DialogTrigger>
  ),
};

/**
 * A list of times under the field instead of the dialog, for forms with many times: every
 * half hour, or every `step` minutes within `min` and `max`.
 */
export const Docked: Story = {
  render: () => (
    <div data-testid="docked" className="flex h-[440px] w-max items-start gap-4 bg-surface p-4">
      <TimeField
        label="Opens at"
        presentation="docked"
        defaultValue={new Time(9, 30)}
        hourCycle={24}
      />
      <TimeField
        label="Lunch"
        presentation="docked"
        step={15}
        min={new Time(12)}
        max={new Time(14)}
        hourCycle={12}
      />
    </div>
  ),
};

/** The docked list opened from inside a dialog. */
export const DockedInDialog: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Edit hours</Button>
      <Dialog role="dialog">
        <DialogTitle>Opening hours</DialogTitle>
        <DialogContent>
          <TimeField
            label="Opens at"
            presentation="docked"
            defaultValue={new Time(9, 30)}
            hourCycle={24}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" slot="close">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </DialogTrigger>
  ),
};

/** Layout safety. */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div
      className={transformedAncestor ? 'translate-x-2' : undefined}
      style={{ minHeight: 120, width: 360 }}
    >
      <TimeField
        data-testid="target"
        label="Opens at"
        defaultValue={new Time(9, 30)}
        hourCycle={24}
        className={LAYOUT_OVERRIDES[override]}
      />
    </div>
  ),
};
