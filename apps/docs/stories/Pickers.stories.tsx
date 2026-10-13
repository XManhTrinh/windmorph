import { CalendarDate, Time } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  DatePicker,
  DateRangePicker,
  IconButton,
  PickerDialog,
  TimePicker,
  type DateRange as DateRangeValue,
} from '@windmorph/react';
import { useState } from 'react';
import { EditIcon } from './icons';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = { title: 'Components/Pickers' } satisfies Meta;

export default meta;
type Story = StoryObj;

// A month away from today, so the "today" outline never shows in screenshots.
const DATE = new CalendarDate(2030, 3, 14);

/** The date picker's content (Compose's `DatePicker`). */
export const Date: Story = {
  render: function DateStory() {
    const [value, setValue] = useState<CalendarDate | null>(DATE);
    return (
      <div className="flex flex-col gap-4">
        <div
          className="w-fit rounded-corner-extra-large bg-surface-container-high"
          data-testid="picker"
        >
          <DatePicker value={value} onChange={setValue} yearRange={[2020, 2040]} />
        </div>
        <p className="text-body-medium" data-testid="value">
          Value {value?.toString()}
        </p>
      </div>
    );
  },
};

/** The date range picker. */
export const DateRange: Story = {
  render: function RangeStory() {
    const [value, setValue] = useState<DateRangeValue | null>({
      start: new CalendarDate(2030, 3, 10),
      end: new CalendarDate(2030, 3, 13),
    });
    return (
      <div
        className="w-fit rounded-corner-extra-large bg-surface-container-high"
        data-testid="picker"
      >
        <DateRangePicker value={value} onChange={setValue} />
      </div>
    );
  },
};

/** The modal date picker: confirm applies the picked date. */
export const DateDialog: Story = {
  render: function DateDialogStory() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<CalendarDate>(DATE);
    const [draft, setDraft] = useState<CalendarDate | null>(DATE);
    return (
      <div className="flex flex-col items-start gap-4">
        <Button onPress={() => setOpen(true)}>Pick a date</Button>
        <p className="text-body-medium" data-testid="value">
          Value {value.toString()}
        </p>
        <PickerDialog
          aria-label="Select date"
          open={open}
          onOpenChange={setOpen}
          dismissButton={
            <Button variant="text" onPress={() => setOpen(false)}>
              Cancel
            </Button>
          }
          confirmButton={
            <Button
              variant="text"
              onPress={() => {
                if (draft) setValue(draft);
                setOpen(false);
              }}
            >
              OK
            </Button>
          }
        >
          <DatePicker value={draft} onChange={setDraft} />
        </PickerDialog>
      </div>
    );
  },
};

/** Time pickers: 12-hour and 24-hour dials, and input mode. */
export const Time12: Story = {
  render: function TimeStory() {
    const [value, setValue] = useState(new Time(14, 35));
    return (
      <div className="flex flex-col items-start gap-4">
        <div
          className="rounded-corner-extra-large bg-surface-container-high p-6"
          data-testid="picker"
        >
          <TimePicker value={value} onChange={setValue} hourCycle={12} />
        </div>
        <p className="text-body-medium" data-testid="value">
          Value {value.toString()}
        </p>
      </div>
    );
  },
};

export const Time24: Story = {
  render: () => (
    <div
      className="w-fit rounded-corner-extra-large bg-surface-container-high p-6"
      data-testid="picker"
    >
      <TimePicker defaultValue={new Time(18, 0)} hourCycle={24} />
    </div>
  ),
};

export const TimeInput: Story = {
  render: () => (
    <div
      className="w-fit rounded-corner-extra-large bg-surface-container-high p-6"
      data-testid="picker"
    >
      <TimePicker defaultValue={new Time(9, 5)} hourCycle={12} mode="input" />
    </div>
  ),
};

/** The modal time picker with the dial / input toggle at the start of the actions. */
export const TimeDialog: Story = {
  render: function TimeDialogStory() {
    const [open, setOpen] = useState(true);
    const [mode, setMode] = useState<'dial' | 'input'>('dial');
    return (
      <>
        <Button onPress={() => setOpen(true)}>Pick a time</Button>
        <PickerDialog
          variant="time"
          title="Select time"
          aria-label="Select time"
          open={open}
          onOpenChange={setOpen}
          modeToggleButton={
            <IconButton
              icon={<EditIcon />}
              aria-label={mode === 'dial' ? 'Switch to text input' : 'Switch to clock'}
              onPress={() => setMode(mode === 'dial' ? 'input' : 'dial')}
            />
          }
          dismissButton={
            <Button variant="text" onPress={() => setOpen(false)}>
              Cancel
            </Button>
          }
          confirmButton={
            <Button variant="text" onPress={() => setOpen(false)}>
              OK
            </Button>
          }
        >
          <TimePicker defaultValue={new Time(7, 30)} hourCycle={12} mode={mode} />
        </PickerDialog>
      </>
    );
  },
};

/** Layout safety (architecture §10). */
export const LayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: ({ override, transformedAncestor }) => (
    <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 560 }}>
      <DatePicker data-testid="target" defaultValue={DATE} className={LAYOUT_OVERRIDES[override]} />
    </div>
  ),
};
