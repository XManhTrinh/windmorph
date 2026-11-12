import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { checker, ENTRIES, exportedComponents, program } from '../test/exported-components';
import {
  Autocomplete,
  AutocompleteItem,
  Badge,
  BottomSheet,
  Button,
  ButtonGroup,
  Carousel,
  DateField,
  DatePicker,
  DateRangePicker,
  Dialog,
  DialogHeader,
  DialogTrigger,
  FilterChip,
  IconButton,
  InputChip,
  LabelsProvider,
  Menu,
  MenuItem,
  MenuTrigger,
  PickerDialog,
  PullToRefresh,
  RangeSlider,
  SearchField,
  Select,
  SelectItem,
  SideSheet,
  Snackbar,
  SplitButton,
  SubmenuTrigger,
  TextField,
  TimeField,
  TimePicker,
  TimePickerModeToggle,
  type WindmorphLabels,
} from './index';

/**
 * Every component that takes `labels` reads a `LabelsProvider` too (2026-11-11,
 * docs/plans/labels-provider.md), so an app in another language writes its words once.
 * The types are read with the TypeScript checker, so a new component can't be left out:
 *
 * - every labels type has a key in `WindmorphLabels`, named after it (`TextFieldLabels` →
 *   `TextField`), and is exported;
 * - every component with a `labels` prop is rendered below a provider that gives each of its
 *   key's words a marked value, and one of them has to show.
 */

/** A provider word's value: `wm-word:TextField.error`. */
const MARK = 'wm-word:';

/** Labels types with no key of their own, with the reason. */
const NO_KEY: Record<string, string> = {
  DateInputLabels:
    "The typed date field's words: part of `DatePickerLabels` and `DateFieldLabels`, which extend it.",
};

/** Components that hand their `labels` to another, which reads the provider. */
const PASSES_ON: Record<string, string> = {
  SnackbarHost: 'Gives its labels to each `Snackbar` it shows.',
};

interface Key {
  /** The key's type as written: `Partial<TextFieldLabels> | undefined`. */
  type: string;
  /** Each word, and whether it's a function. */
  words: Map<string, boolean>;
}

/** `WindmorphLabels`, read from the main entry's exports. */
function windmorphLabels(): Map<string, Key> {
  const file = program.getSourceFile(ENTRIES[0]!);
  const moduleSymbol = file && checker.getSymbolAtLocation(file);
  const exported = moduleSymbol
    ? checker.getExportsOfModule(moduleSymbol).find((each) => each.name === 'WindmorphLabels')
    : undefined;
  if (!exported) throw new Error('WindmorphLabels is not exported');
  const symbol =
    exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const keys = new Map<string, Key>();
  for (const key of checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol))) {
    const type = checker.getTypeOfSymbol(key);
    const words = new Map<string, boolean>();
    for (const word of checker.getPropertiesOfType(checker.getNonNullableType(type))) {
      const wordType = checker.getNonNullableType(checker.getTypeOfSymbol(word));
      words.set(word.name, wordType.getCallSignatures().length > 0);
    }
    keys.set(key.name, { type: checker.typeToString(type), words });
  }
  return keys;
}

/** The labels types the entries export: `TextFieldLabels`, … */
function exportedLabelsTypes(): string[] {
  const names = new Set<string>();
  for (const entry of ENTRIES) {
    const file = program.getSourceFile(entry);
    const moduleSymbol = file && checker.getSymbolAtLocation(file);
    if (!moduleSymbol) throw new Error(`No module for ${entry}`);
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      if (/^[A-Z]\w*Labels$/.test(exported.name) && exported.name !== 'WindmorphLabels') {
        names.add(exported.name);
      }
    }
  }
  return [...names].sort();
}

const keys = windmorphLabels();

/** The components with a `labels` prop, and the labels type each takes. */
const labelled = exportedComponents()
  .filter(({ name, props }) => props.has('labels') && name !== 'LabelsProvider')
  .map(({ name, props }) => ({ name, type: checker.typeToString(props.get('labels')!) }));

/** `Partial<TextFieldLabels> | undefined` → `TextField`. */
const keyOf = (type: string) => /^Partial<(\w+)Labels> \| undefined$/.exec(type)?.[1];

/** Every word of every key, marked, as a provider's `labels`. */
function markedLabels(): WindmorphLabels {
  const labels: Record<string, Record<string, unknown>> = {};
  for (const [key, { words }] of keys) {
    labels[key] = Object.fromEntries(
      [...words].map(([word, callable]) => {
        const value = `${MARK}${key}.${word}`;
        return [word, callable ? () => value : value];
      }),
    );
  }
  return labels;
}

interface Case {
  /** The component in a state where one of its words shows. */
  element: ReactElement;
  /** What a person does first, when a word only shows after it. */
  act?: () => Promise<void>;
}

const icon = <svg aria-hidden="true" />;

const CASES: Record<string, Case> = {
  Autocomplete: {
    element: (
      <Autocomplete label="City">
        <AutocompleteItem key="paris">Paris</AutocompleteItem>
      </Autocomplete>
    ),
  },
  Badge: { element: <Badge /> },
  BottomSheet: {
    element: (
      <BottomSheet aria-label="Details" defaultOpen>
        Content
      </BottomSheet>
    ),
  },
  Button: { element: <Button pending>Save</Button> },
  ButtonGroup: {
    element: (
      <ButtonGroup aria-label="Actions" overflow>
        <Button>Reply</Button>
        <Button>Forward</Button>
      </ButtonGroup>
    ),
  },
  Carousel: {
    element: (
      <Carousel aria-label="Photos">
        <div key="one">One</div>
        <div key="two">Two</div>
      </Carousel>
    ),
  },
  DateField: { element: <DateField label="Date" /> },
  DatePicker: { element: <DatePicker /> },
  DateRangePicker: { element: <DateRangePicker /> },
  DialogHeader: {
    element: (
      <DialogTrigger defaultOpen>
        <Button>Edit</Button>
        <Dialog fullScreen="always">
          <DialogHeader>Edit name</DialogHeader>
        </Dialog>
      </DialogTrigger>
    ),
  },
  FilterChip: { element: <FilterChip onRemove={() => {}}>Vegan</FilterChip> },
  IconButton: { element: <IconButton icon={icon} aria-label="Save" pending /> },
  InputChip: { element: <InputChip onRemove={() => {}}>Sam</InputChip> },
  Menu: {
    element: (
      <MenuTrigger defaultOpen>
        <Button>File</Button>
        <Menu aria-label="File" presentation="sheet">
          <SubmenuTrigger>
            <MenuItem key="share">Share</MenuItem>
            <Menu aria-label="Share">
              <MenuItem key="email">Email</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>
    ),
    // The sheet loads on demand, and its submenu shows the way back.
    act: async () => {
      (await screen.findByRole('menuitem', { name: 'Share' })).focus();
      await userEvent.keyboard('{ArrowRight}');
    },
  },
  PickerDialog: {
    element: (
      <PickerDialog
        aria-label="Select date"
        defaultOpen
        fullScreen="always"
        dismissButton={<Button variant="text">Cancel</Button>}
        confirmButton={<Button variant="text">OK</Button>}
      >
        <DatePicker />
      </PickerDialog>
    ),
  },
  PullToRefresh: {
    element: (
      <PullToRefresh refreshing onRefresh={() => undefined}>
        <p>Messages</p>
      </PullToRefresh>
    ),
  },
  RangeSlider: { element: <RangeSlider aria-label="Price" /> },
  SearchField: { element: <SearchField aria-label="Search" defaultValue="tea" /> },
  Select: {
    element: (
      <Select label="Country" invalid>
        <SelectItem key="fr">France</SelectItem>
      </Select>
    ),
  },
  SideSheet: {
    element: (
      <SideSheet title="Sort" defaultOpen>
        Options
      </SideSheet>
    ),
  },
  Snackbar: { element: <Snackbar onDismiss={() => {}}>Saved</Snackbar> },
  SplitButton: {
    element: (
      <SplitButton
        menu={
          <Menu aria-label="Send options">
            <MenuItem key="later">Send later</MenuItem>
          </Menu>
        }
      >
        Send
      </SplitButton>
    ),
  },
  TextField: { element: <TextField label="Email" invalid /> },
  TimeField: { element: <TimeField label="Time" /> },
  TimePicker: { element: <TimePicker /> },
  TimePickerModeToggle: {
    element: <TimePickerModeToggle mode="dial" onModeChange={() => {}} />,
  },
};

describe('the words every component reads from a LabelsProvider', () => {
  it('finds the components that take labels, and the keys', () => {
    expect(labelled.length).toBeGreaterThan(20);
    expect(keys.size).toBeGreaterThan(20);
  });

  it('gives every labels type a key named after it', () => {
    const wrong = labelled
      .filter(({ type }) => keys.get(keyOf(type) ?? '')?.type !== type)
      .map(({ name, type }) => `${name}: ${type}`);
    expect(wrong).toEqual([]);
    const misnamed = [...keys]
      .filter(([key, { type }]) => type !== `Partial<${key}Labels> | undefined`)
      .map(([key, { type }]) => `${key}: ${type}`);
    expect(misnamed).toEqual([]);
  });

  it('exports every labels type, each with a key or a reason to have none', () => {
    const exported = exportedLabelsTypes();
    const missing = [...keys.keys()].filter((key) => !exported.includes(`${key}Labels`));
    expect(missing).toEqual([]);
    const keyless = exported.filter((name) => !keys.has(name.replace(/Labels$/, '')));
    expect(keyless).toEqual(Object.keys(NO_KEY));
  });

  it('has a case for every component that takes labels', () => {
    expect([...Object.keys(CASES), ...Object.keys(PASSES_ON)].sort()).toEqual(
      labelled.map(({ name }) => name).sort(),
    );
  });

  it("puts a component's own labels above the provider's", () => {
    render(
      <LabelsProvider labels={{ TextField: { error: 'Fehler' } }}>
        <TextField label="Email" invalid />
        <TextField label="Phone" invalid labels={{ error: 'Ungültig' }} />
      </LabelsProvider>,
    );
    expect(screen.getByRole('img', { name: 'Fehler' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ungültig' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Error' })).toBe(null);
  });

  it("gives DateField the DatePicker's words it shares, and its own above them", async () => {
    render(
      <LabelsProvider
        labels={{
          DatePicker: { previousMonth: 'Voriger Monat', nextMonth: 'Nächster Monat' },
          DateField: { openCalendar: 'Kalender öffnen', nextMonth: 'Weiter' },
        }}
      >
        <DateField label="Date" />
      </LabelsProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Kalender öffnen' }));
    expect(await screen.findByRole('button', { name: 'Voriger Monat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument();
  });

  it("gives TimeField the TimePicker's and the PickerDialog's words", async () => {
    render(
      <LabelsProvider
        labels={{
          TimePicker: { hour: 'Stunde' },
          TimeField: { openPicker: 'Uhrzeit wählen', title: 'Uhrzeit' },
        }}
      >
        <TimeField label="Time" />
      </LabelsProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Uhrzeit wählen' }));
    const dialog = await screen.findByRole('dialog', { name: 'Uhrzeit' });
    await waitFor(() => expect(dialog.innerHTML).toContain('Stunde'));
  });

  it.each(labelled.filter(({ name }) => name in CASES))(
    '$name shows a word of its key from the provider',
    async ({ name, type }) => {
      const { element, act } = CASES[name]!;
      render(<LabelsProvider labels={markedLabels()}>{element}</LabelsProvider>);
      await act?.();
      await waitFor(() => expect(document.body.innerHTML).toContain(`${MARK}${keyOf(type)}.`));
    },
  );
});
