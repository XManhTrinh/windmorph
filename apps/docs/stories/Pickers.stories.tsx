import { CalendarDate, Time } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  DENSITIES,
  DateField,
  DatePicker,
  DateRangePicker,
  PickerDialog,
  TimePicker,
  TimePickerModeToggle,
  type DateRange as DateRangeValue,
  type Density as DensityLevel,
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
            min={new CalendarDate(2020, 1, 1)}
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
          max={new CalendarDate(2035, 12, 31)}
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

/**
 * Web density 0 to -3, one column per level: the docked date field and the date picker's input
 * mode lose 4px per step (56 → 44px), the time input's fields too (72 → 60px). The calendars
 * and the dial keep their size. Each part is `data-testid="<level>-<part>"`.
 */
export const Density: Story = {
  render: () => (
    <div className="grid grid-cols-4 items-start gap-4" data-testid="density">
      {DENSITIES.map((density: DensityLevel) => (
        <div key={density} className="flex min-w-0 flex-col gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          <DateField
            label="Date"
            density={density}
            defaultValue={DATE}
            className="w-full"
            data-testid={`${density}-date-field`}
          />
          <div className="rounded-corner-extra-large bg-surface-container-high">
            <DatePicker
              density={density}
              defaultMode="input"
              defaultValue={DATE}
              showHeader={false}
              className="w-full"
              data-testid={`${density}-date-input`}
            />
          </div>
          <div className="w-fit rounded-corner-extra-large bg-surface-container-high p-4">
            <TimePicker
              density={density}
              defaultValue={new Time(9, 5)}
              hourCycle={12}
              mode="input"
              data-testid={`${density}-time-input`}
            />
          </div>
        </div>
      ))}
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

/**
 * Layout safety (architecture §10) for the docked date picker: a consumer layout class on
 * `DateField` (its outermost element), inside an optional transformed ancestor. The field
 * keeps its size and its calendar still opens in the window.
 */
export const DateFieldLayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function DateFieldLayoutOverrideStory({ override, transformedAncestor }) {
    const [value, setValue] = useState<CalendarDate | null>(DATE);
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 560 }}>
        <p className="mb-4 text-body-medium" data-testid="value">
          Value {value?.toString() ?? 'none'}
        </p>
        <DateField
          data-testid="target"
          label="Date"
          value={value}
          onChange={setValue}
          className={LAYOUT_OVERRIDES[override]}
        />
      </div>
    );
  },
};

/** Layout safety (architecture §10) for the time picker (vertical, 12-hour). */
export const TimeLayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
}> = {
  args: { override: 'none', transformedAncestor: false },
  argTypes: { override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES } },
  render: function TimeLayoutOverrideStory({ override, transformedAncestor }) {
    const [value, setValue] = useState(new Time(14, 35));
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 440 }}>
        <p className="mb-4 text-body-medium" data-testid="count">
          Value {value.toString()}
        </p>
        <TimePicker
          data-testid="target"
          value={value}
          onChange={setValue}
          hourCycle={12}
          layout="vertical"
          className={LAYOUT_OVERRIDES[override]}
        />
      </div>
    );
  },
};

/**
 * Layout safety (architecture §10) for `PickerDialog`: a consumer layout class on the
 * button that opens it (`part: trigger`) or on the dialog (`className`, which goes on its
 * outermost element; `part: panel`), inside an optional transformed ancestor. The dialog still opens in the window,
 * keeps its width and corners, holds focus, and returns it to the button.
 */
export const DialogLayoutOverride: StoryObj<{
  override: LayoutOverrideName;
  transformedAncestor: boolean;
  part: 'trigger' | 'panel';
}> = {
  args: { override: 'none', transformedAncestor: false, part: 'trigger' },
  argTypes: {
    override: { control: 'select', options: LAYOUT_OVERRIDE_NAMES },
    part: { control: 'inline-radio', options: ['trigger', 'panel'] },
  },
  render: function DialogLayoutOverrideStory({ override, transformedAncestor, part }) {
    const [open, setOpen] = useState(false);
    const layout = LAYOUT_OVERRIDES[override];
    return (
      <div className={transformedAncestor ? 'translate-x-2' : undefined} style={{ minHeight: 200 }}>
        <Button
          data-testid="target"
          className={part === 'trigger' ? layout : undefined}
          onPress={() => setOpen(true)}
        >
          Pick a date
        </Button>
        <PickerDialog
          aria-label="Select date"
          open={open}
          onOpenChange={setOpen}
          className={part === 'panel' ? layout : undefined}
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
          <DatePicker defaultValue={DATE} />
        </PickerDialog>
      </div>
    );
  },
};
