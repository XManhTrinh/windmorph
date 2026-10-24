import { fireEvent, render } from '@testing-library/react';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRef, type ReactElement, type RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Carousel,
  Checkbox,
  DateField,
  DatePicker,
  DateRangePicker,
  List,
  ListItem,
  ListItemAvatar,
  ListItemImage,
  ListItemVideo,
  Menu,
  MenuItem,
  MenuTrigger,
  PickerDialog,
  Radio,
  RadioGroup,
  RangeSlider,
  RichTooltip,
  RichTooltipTrigger,
  SearchBar,
  Select,
  SelectItem,
  Slider,
  Switch,
  Tab,
  Tabs,
  TextField,
  TimePicker,
  TimePickerModeToggle,
  Tooltip,
  TooltipTrigger,
} from './index';

/**
 * Every component passes its root element's DOM attributes (2026-10-17): `data-*`, the
 * `aria-*` attributes other than the naming ones (which React Aria puts on the element it
 * labels), global attributes and pointer events, to the element `ref` reaches.
 * `public-api-names.test.ts` checks the types of every component; this renders each component
 * that splits its props between its root and a React Aria hook (`splitRootProps`), and the
 * others that gained the attributes, and checks they land.
 */

type Probe = Record<string, unknown> & { onDoubleClick: () => void };

const probe = (): Probe => ({
  title: 'Probe',
  lang: 'fr',
  'aria-busy': true,
  'data-probe': 'yes',
  onDoubleClick: vi.fn(),
});

/** Each case renders the component with the probe attributes and the ref of its root. */
const CASES: Record<string, (props: Probe, ref: RefObject<HTMLElement | null>) => ReactElement> = {
  Checkbox: (props, ref) => (
    <Checkbox {...props} ref={ref as never}>
      Terms
    </Checkbox>
  ),
  Switch: (props, ref) => (
    <Switch {...props} ref={ref as never}>
      Wi-Fi
    </Switch>
  ),
  RadioGroup: (props, ref) => (
    <RadioGroup {...props} ref={ref as never} label="Delivery">
      <Radio value="standard">Standard</Radio>
    </RadioGroup>
  ),
  Radio: (props, ref) => (
    <RadioGroup label="Delivery">
      <Radio {...props} ref={ref as never} value="standard">
        Standard
      </Radio>
    </RadioGroup>
  ),
  TextField: (props, ref) => <TextField {...props} ref={ref as never} label="Name" />,
  Select: (props, ref) => (
    <Select {...props} ref={ref as never} label="Sort by">
      <SelectItem key="new">Newest</SelectItem>
    </Select>
  ),
  Autocomplete: (props, ref) => (
    <Autocomplete {...props} ref={ref as never} label="City">
      <AutocompleteItem key="paris">Paris</AutocompleteItem>
    </Autocomplete>
  ),
  DateField: (props, ref) => <DateField {...props} ref={ref as never} label="Date of birth" />,
  DatePicker: (props, ref) => <DatePicker {...props} ref={ref as never} />,
  DateRangePicker: (props, ref) => <DateRangePicker {...props} ref={ref as never} />,
  TimePicker: (props, ref) => <TimePicker {...props} ref={ref as never} />,
  TimePickerModeToggle: (props, ref) => (
    <TimePickerModeToggle {...props} ref={ref as never} mode="dial" onModeChange={() => {}} />
  ),
  Slider: (props, ref) => <Slider {...props} ref={ref as never} aria-label="Volume" />,
  RangeSlider: (props, ref) => <RangeSlider {...props} ref={ref as never} aria-label="Price" />,
  Tabs: (props, ref) => (
    <Tabs {...props} ref={ref as never} aria-label="Trip">
      <Tab key="flights" title="Flights">
        Flights
      </Tab>
    </Tabs>
  ),
  Carousel: (props, ref) => (
    <Carousel {...props} ref={ref as never} aria-label="Photos">
      <img alt="" />
    </Carousel>
  ),
  SearchBar: (props, ref) => <SearchBar {...props} ref={ref as never} aria-label="Search" />,
  List: (props, ref) => (
    <List {...props} ref={ref as never} aria-label="Mail">
      <ListItem key="inbox">Inbox</ListItem>
    </List>
  ),
  'List (interactive)': (props, ref) => (
    <List {...props} ref={ref as never} aria-label="Mail" onAction={() => {}}>
      <ListItem key="inbox">Inbox</ListItem>
    </List>
  ),
  'List (radio)': (props, ref) => (
    <List {...props} ref={ref as never} aria-label="Theme" defaultValue="light">
      <ListItem key="light" value="light">
        Light
      </ListItem>
    </List>
  ),
  ListItemAvatar: (props, ref) => (
    <ListItemAvatar {...props} ref={ref as never}>
      AL
    </ListItemAvatar>
  ),
  ListItemImage: (props, ref) => <ListItemImage {...props} ref={ref as never} alt="" />,
  ListItemVideo: (props, ref) => <ListItemVideo {...props} ref={ref as never} alt="" />,
  Menu: (props, ref) => (
    <MenuTrigger defaultOpen>
      <Button>Options</Button>
      <Menu {...props} ref={ref as never} aria-label="Options">
        <MenuItem key="edit">Edit</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
  Tooltip: (props, ref) => (
    <TooltipTrigger open>
      <Button>Save</Button>
      <Tooltip {...props} ref={ref as never}>
        Save the draft
      </Tooltip>
    </TooltipTrigger>
  ),
  RichTooltip: (props, ref) => (
    <RichTooltipTrigger open>
      <Button>Help</Button>
      <RichTooltip {...props} ref={ref as never}>
        Tabs with the same site stay together.
      </RichTooltip>
    </RichTooltipTrigger>
  ),
  PickerDialog: (props, ref) => (
    <PickerDialog
      {...props}
      ref={ref as never}
      defaultOpen
      aria-label="Pick a date"
      confirmButton={<Button variant="text">OK</Button>}
    >
      <span>Calendar</span>
    </PickerDialog>
  ),
};

/** Components whose `title` prop has its own meaning (a headline, a subhead). */
const OWN_TITLE = new Set(['PickerDialog', 'RichTooltip']);

describe('root DOM attributes', () => {
  for (const [name, renderCase] of Object.entries(CASES)) {
    it(`${name} puts them on its root`, () => {
      const props = probe();
      if (OWN_TITLE.has(name)) delete props.title;
      const ref = createRef<HTMLElement>();
      render(renderCase(props, ref));
      const root = ref.current!;
      expect(root).toBeInstanceOf(HTMLElement);
      if (!OWN_TITLE.has(name)) expect(root).toHaveAttribute('title', 'Probe');
      expect(root).toHaveAttribute('lang', 'fr');
      expect(root).toHaveAttribute('aria-busy', 'true');
      expect(root).toHaveAttribute('data-probe', 'yes');
      fireEvent.doubleClick(root);
      expect(props.onDoubleClick).toHaveBeenCalledTimes(1);
    });
  }

  it('keeps the naming props on the element React Aria labels', () => {
    const ref = createRef<HTMLDivElement>();
    const { getByRole } = render(
      <TextField ref={ref} aria-label="Search the docs" aria-describedby="hint" />,
    );
    const input = getByRole('textbox', { name: 'Search the docs' });
    expect(input).toHaveAttribute('aria-describedby', 'hint');
    expect(ref.current).not.toHaveAttribute('aria-label');
  });

  /** The attributes that describe a widget's own state and relations (`WidgetAria`). */
  const WIDGET = {
    'aria-controls': 'suggestions',
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list',
    'aria-activedescendant': 'suggestion-1',
    'aria-expanded': 'true',
    'aria-required': 'true',
    'aria-invalid': 'true',
    'aria-readonly': 'true',
  } as const;

  /** Components whose root wraps the element React Aria labels (ARIA forbids these there). */
  const WRAPPERS = [
    'Checkbox',
    'Switch',
    'Radio',
    'TextField',
    'Select',
    'Autocomplete',
    'DateField',
    'DatePicker',
    'DateRangePicker',
    'TimePicker',
    'Tabs',
    'SearchBar',
  ];

  for (const name of WRAPPERS) {
    it(`${name} never puts the widget attributes on its wrapping root`, () => {
      const ref = createRef<HTMLElement>();
      render(CASES[name]!({ ...WIDGET, onDoubleClick: () => {} } as Probe, ref));
      for (const key of Object.keys(WIDGET)) expect(ref.current).not.toHaveAttribute(key);
    });
  }

  it('puts the widget attributes on the input of a text field, checkbox, switch and radio', () => {
    const { getByRole } = render(
      <>
        <TextField label="City" {...WIDGET} />
        <Checkbox {...WIDGET}>Terms</Checkbox>
        <Switch {...WIDGET}>Wi-Fi</Switch>
        <RadioGroup label="Delivery">
          <Radio value="standard" {...(WIDGET as object)}>
            Standard
          </Radio>
        </RadioGroup>
      </>,
    );
    for (const input of [
      getByRole('textbox', { name: 'City' }),
      getByRole('checkbox', { name: 'Terms' }),
      getByRole('switch', { name: 'Wi-Fi' }),
      getByRole('radio', { name: 'Standard' }),
    ]) {
      for (const [key, value] of Object.entries(WIDGET)) expect(input).toHaveAttribute(key, value);
    }
  });

  /** The naming and description attributes React Aria's hooks don't forward (`DescriptionAria`). */
  const DESCRIPTION = {
    'aria-description': 'Shared with everyone',
    'aria-roledescription': 'control',
    'aria-braillelabel': 'Ctl',
    'aria-brailleroledescription': 'ctl',
  } as const;

  /**
   * The element React Aria labels, for each case whose root wraps it; every other case's root
   * is that element. The pickers have none (their props leave the attributes out).
   */
  const LABELLED: Record<string, ((root: HTMLElement) => Element | null) | null> = {
    Checkbox: (root) => root.querySelector('input'),
    Switch: (root) => root.querySelector('input'),
    Radio: (root) => root.querySelector('input'),
    TextField: (root) => root.querySelector('input'),
    Select: (root) => root.querySelector('button'),
    Autocomplete: (root) => root.querySelector('input'),
    DateField: (root) => root.querySelector('input'),
    Tabs: (root) => root.querySelector('[role="tablist"]'),
    SearchBar: (root) => root.querySelector('input'),
    DatePicker: null,
    DateRangePicker: null,
    TimePicker: null,
  };

  for (const [name, renderCase] of Object.entries(CASES)) {
    if (LABELLED[name] === null) continue;
    it(`${name} puts the description attributes on the element React Aria labels`, () => {
      const ref = createRef<HTMLElement>();
      render(renderCase({ ...DESCRIPTION, onDoubleClick: () => {} } as Probe, ref));
      const root = ref.current!;
      const labelled = LABELLED[name]?.(root) ?? root;
      for (const [key, value] of Object.entries(DESCRIPTION)) {
        // Carousel's role description is its `labels.carousel`.
        if (name === 'Carousel' && key === 'aria-roledescription') continue;
        expect(labelled).toHaveAttribute(key, value);
        if (labelled !== root) expect(root).not.toHaveAttribute(key);
      }
    });
  }

  it("puts a text box's own attributes on the input, not the wrapping root", () => {
    const ref = createRef<HTMLDivElement>();
    const { getByRole } = render(
      <TextField ref={ref} label="Note" aria-multiline="false" aria-placeholder="A short note" />,
    );
    const input = getByRole('textbox', { name: 'Note' });
    expect(input).toHaveAttribute('aria-multiline', 'false');
    expect(input).toHaveAttribute('aria-placeholder', 'A short note');
    expect(ref.current).not.toHaveAttribute('aria-placeholder');
  });

  it("reads a form library's aria-invalid and aria-required as the field's own state", () => {
    const { getByRole } = render(
      <>
        <Select label="Sort by" aria-invalid="true" aria-required="true" errorMessage="Pick one">
          <SelectItem key="new">Newest</SelectItem>
        </Select>
        <Autocomplete label="City" aria-invalid="true" aria-required="true" aria-readonly="true">
          <AutocompleteItem key="paris">Paris</AutocompleteItem>
        </Autocomplete>
        <DateField label="Start" aria-invalid="true" aria-required="true" />
      </>,
    );
    // A button can't carry the attributes: the asterisk names it, the error describes it.
    const trigger = getByRole('button', { name: /Sort by/ });
    expect(trigger).toHaveAccessibleName(/\*/);
    expect(trigger).toHaveAccessibleDescription(/Pick one/);
    expect(trigger).not.toHaveAttribute('aria-invalid');
    const city = getByRole('combobox', { name: /City/ });
    expect(city).toHaveAttribute('aria-invalid', 'true');
    expect(city).toHaveAttribute('aria-required', 'true');
    expect(city).toHaveAttribute('readonly');
    const start = getByRole('textbox', { name: /Start/ });
    expect(start).toHaveAttribute('aria-invalid', 'true');
    expect(start).toHaveAttribute('aria-required', 'true');
  });

  it("adds an app's aria-describedby to the inputs of DateField and SearchBar", () => {
    const { getByRole } = render(
      <>
        <span id="after-start">After the start date</span>
        <DateField label="End" aria-describedby="after-start" aria-details="rules" />
        <SearchBar aria-label="Search" aria-describedby="after-start" aria-details="rules" />
      </>,
    );
    for (const input of [
      getByRole('textbox', { name: /End/ }),
      getByRole('combobox', { name: 'Search' }),
    ]) {
      expect(input.getAttribute('aria-describedby')?.split(' ')).toContain('after-start');
      expect(input).toHaveAttribute('aria-details', 'rules');
    }
  });

  it('covers every component that splits its props with splitRootProps', () => {
    const src = dirname(fileURLToPath(import.meta.url));
    const splitting = readdirSync(join(src, 'components'), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.tsx$/.test(entry.name) && !/test/.test(entry.name))
      .map((entry) => readFileSync(join(entry.parentPath, entry.name), 'utf8'))
      .filter((code) => code.includes('splitRootProps('))
      .flatMap((code) => [...code.matchAll(/^export function ([A-Z]\w*)/gm)].map((m) => m[1]!));
    const covered = new Set(Object.keys(CASES).map((name) => name.split(' ')[0]));
    expect(splitting.filter((name) => !covered.has(name))).toEqual([]);
  });
});
