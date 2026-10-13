import { CalendarDate, Time } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  DateField,
  DatePicker,
  DateRangePicker,
  PickerDialog,
  TimePicker,
  TimePickerModeToggle,
  type DateRange as DateRangeValue,
  type TimePickerMode,
} from '@windmorph/react';
import { useState } from 'react';
import {
  LAYOUT_OVERRIDES,
  LAYOUT_OVERRIDE_NAMES,
  type LayoutOverrideName,
} from './layout-overrides';

const meta = { title: 'Components/Pickers' } satisfies Meta;

export default meta;
type Story = StoryObj;

// Years away from today, so the "today" outline never shows in screenshots.
const DATE = new CalendarDate(2030, 3, 14);

/** The modal date picker's content (Compose's `DatePicker`). */
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

/** The modal date input: an outlined field with no mask and the format below it. */
export const DateInput: Story = {
  render: function DateInputStory() {
    const [value, setValue] = useState<CalendarDate | null>(DATE);
    return (
      <div className="flex flex-col gap-4">
        <div
          className="w-fit rounded-corner-extra-large bg-surface-container-high"
          data-testid="picker"
        >
          <DatePicker
            value={value}
            onChange={setValue}
            defaultMode="input"
            minValue={new CalendarDate(2020, 1, 1)}
          />
        </div>
        <p className="text-body-medium" data-testid="value">
          Value {value?.toString()}
        </p>
      </div>
    );
  },
};

/** The docked date picker: a date field with a calendar just below it. */
export const Docked: Story = {
  render: function DockedStory() {
    const [value, setValue] = useState<CalendarDate | null>(DATE);
    return (
      <div className="flex min-h-[560px] flex-col gap-4">
        <DateField
          label="Date"
          value={value}
          onChange={setValue}
          yearRange={[2020, 2040]}
          maxValue={new CalendarDate(2035, 12, 31)}
        />
        <p className="text-body-medium" data-testid="value">
          Value {value?.toString() ?? 'none'}
        </p>
      </div>
    );
  },
};

/** The date range picker: a vertically scrolling list of months. */
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
        <DateRangePicker value={value} onChange={setValue} yearRange={[2020, 2040]} />
      </div>
    );
  },
};

/** The modal date picker: OK or Enter on a day applies the picked date. */
export const DateDialog: Story = {
  render: function DateDialogStory() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<CalendarDate>(DATE);
    const [draft, setDraft] = useState<CalendarDate | null>(DATE);
    const confirm = () => {
      if (draft) setValue(draft);
      setOpen(false);
    };
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
          onConfirm={confirm}
          fullScreen="compact"
          dismissButton={
            <Button variant="text" onPress={() => setOpen(false)}>
              Cancel
            </Button>
          }
          confirmButton={
            <Button variant="text" onPress={confirm}>
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

/** The modal date range picker, full screen only on compact windows. */
export const DateRangeDialog: Story = {
  render: function DateRangeDialogStory() {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRangeValue | null>({
      start: new CalendarDate(2030, 3, 10),
      end: new CalendarDate(2030, 3, 13),
    });
    return (
      <>
        <Button onPress={() => setOpen(true)}>Pick dates</Button>
        <PickerDialog
          aria-label="Select dates"
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
          fullScreen="compact"
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
          <DateRangePicker value={draft} onChange={setDraft} yearRange={[2020, 2040]} />
        </PickerDialog>
      </>
    );
  },
};

/** The full-screen range picker, as on compact windows: close and Save at the top. */
export const DateRangeFullScreen: Story = {
  render: function FullScreenStory() {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState<DateRangeValue | null>({
      start: new CalendarDate(2030, 3, 10),
      end: new CalendarDate(2030, 3, 13),
    });
    const [draft, setDraft] = useState(value);
    return (
      <>
        <Button onPress={() => setOpen(true)}>Pick dates</Button>
        <p className="text-body-medium" data-testid="value">
          Value {value ? `${value.start.toString()} – ${value.end.toString()}` : 'none'}
        </p>
        <PickerDialog
          aria-label="Select dates"
          fullScreen="always"
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setValue(draft)}
          confirmButton={<Button variant="text">OK</Button>}
        >
          <DateRangePicker value={draft} onChange={setDraft} yearRange={[2020, 2040]} />
        </PickerDialog>
      </>
    );
  },
};

/** Time pickers: 12-hour and 24-hour dials, the horizontal layout, and input mode. */
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

export const TimeHorizontal: Story = {
  render: () => (
    <div
      className="w-fit rounded-corner-extra-large bg-surface-container-high p-6"
      data-testid="picker"
    >
      <TimePicker defaultValue={new Time(7, 30)} hourCycle={12} layout="horizontal" />
    </div>
  ),
};

export const TimeInput: Story = {
  render: () => (
    <div className="flex gap-6">
      <div
        className="w-fit rounded-corner-extra-large bg-surface-container-high p-6"
        data-testid="picker"
      >
        <TimePicker defaultValue={new Time(9, 5)} hourCycle={12} mode="input" />
      </div>
      <div
        className="w-fit rounded-corner-extra-large bg-surface-container-high p-6"
        data-testid="picker-24"
      >
        <TimePicker defaultValue={new Time(21, 5)} hourCycle={24} mode="input" />
      </div>
    </div>
  ),
};

/** The modal time picker with the keyboard / clock toggle at the start of the actions. */
export const TimeDialog: Story = {
  render: function TimeDialogStory() {
    const [open, setOpen] = useState(true);
    const [mode, setMode] = useState<TimePickerMode>('dial');
    return (
      <>
        <Button onPress={() => setOpen(true)}>Pick a time</Button>
        <PickerDialog
          variant="time"
          title="Select time"
          aria-label="Select time"
          open={open}
          onOpenChange={setOpen}
          modeToggleButton={<TimePickerModeToggle mode={mode} onModeChange={setMode} />}
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
          <TimePicker
            defaultValue={new Time(7, 30)}
            hourCycle={12}
            mode={mode}
            onModeChange={setMode}
          />
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
