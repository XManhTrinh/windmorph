import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PropsRecord } from '../../lib/component-props';
import { PLAYGROUND_DESCRIPTORS } from './descriptors';
import { adjustMenuInstant, adjustListRadio } from './descriptors/containment-m3';
import { adjustPickerModeToggle } from './descriptors/feedback-pickers';
import { adjustChipTrailing } from './descriptors/inputs-m3';
import { adjustRailModal } from './descriptors/navigation';
import {
  activeComponent,
  initialValues,
  playgroundControls,
  playgroundSnippet,
} from './playground-state';

/**
 * Playground rules that keep a control combination meaningful, and snippets that do what the
 * preview does, one playground at a time.
 */

function readProps(name: string): PropsRecord[] {
  const file = resolve(process.cwd(), '.generated/props', `${name}.json`);
  return existsSync(file)
    ? (JSON.parse(readFileSync(file, 'utf8')) as { props: PropsRecord[] }).props
    : [];
}

/** The snippet a playground copies after setting `changes`, one at a time, as its panel would. */
function snippet(slug: string, changes: Record<string, unknown> = {}): string {
  const descriptor = PLAYGROUND_DESCRIPTORS[slug]!;
  const names = [
    descriptor.component,
    ...Object.values(descriptor.componentSwitch?.components ?? {}),
  ];
  const componentProps = Object.fromEntries(names.map((name) => [name, readProps(name)]));
  let values = initialValues(descriptor);
  for (const [name, value] of Object.entries(changes)) {
    values = { ...values, [name]: value };
    if (descriptor.adjust) values = descriptor.adjust(values, name);
  }
  const controls = playgroundControls(
    descriptor,
    componentProps,
    activeComponent(descriptor, values),
  );
  return playgroundSnippet(descriptor, componentProps, values, controls);
}

/** The control names a playground shows for the given values. */
function controlNames(slug: string, values: Record<string, unknown> = {}): string[] {
  const descriptor = PLAYGROUND_DESCRIPTORS[slug]!;
  const names = [
    descriptor.component,
    ...Object.values(descriptor.componentSwitch?.components ?? {}),
  ];
  const componentProps = Object.fromEntries(names.map((name) => [name, readProps(name)]));
  const all = { ...initialValues(descriptor), ...values };
  return playgroundControls(descriptor, componentProps, activeComponent(descriptor, all)).map(
    (control) => control.name,
  );
}

describe('control combinations', () => {
  it('the rail hides on collapse only when modal', () => {
    expect(adjustRailModal({ modal: false, hideOnCollapse: true }, 'hideOnCollapse')).toMatchObject(
      { modal: true },
    );
    expect(adjustRailModal({ modal: false, hideOnCollapse: true }, 'modal')).toMatchObject({
      hideOnCollapse: false,
    });
  });

  it("the picker dialog's mode toggle belongs to a time dialog", () => {
    expect(
      adjustPickerModeToggle({ variant: 'date', modeToggleButton: true }, 'modeToggleButton'),
    ).toMatchObject({ variant: 'time' });
    expect(
      adjustPickerModeToggle({ variant: 'date', modeToggleButton: true }, 'variant'),
    ).toMatchObject({ modeToggleButton: false });
    expect(snippet('picker-dialog', { modeToggleButton: true })).toContain(
      'mode={mode} onModeChange={setMode}',
    );
    expect(snippet('picker-dialog', { variant: 'date' })).not.toContain('TimePickerModeToggle');
  });

  it('the menu never pairs a sheet with instant', () => {
    expect(adjustMenuInstant({ presentation: 'popover', instant: true }, 'presentation')).toEqual({
      presentation: 'popover',
      instant: true,
    });
    expect(adjustMenuInstant({ presentation: 'sheet', instant: true }, 'presentation')).toEqual({
      presentation: 'sheet',
      instant: false,
    });
    expect(adjustMenuInstant({ presentation: 'sheet', instant: true }, 'instant')).toEqual({
      presentation: 'popover',
      instant: true,
    });
  });

  it("a list's required needs a radio list", () => {
    expect(adjustListRadio({ value: 'none', required: true }, 'required')).toMatchObject({
      value: 'alex',
    });
    expect(adjustListRadio({ value: 'none', required: true }, 'value')).toMatchObject({
      required: false,
    });
  });

  it("a filter chip's trailing icon and remove button rule each other out", () => {
    expect(
      adjustChipTrailing({ type: 'filter', trailingIcon: true, onRemove: true }, 'onRemove'),
    ).toMatchObject({ trailingIcon: false });
    expect(
      adjustChipTrailing({ type: 'filter', trailingIcon: true, onRemove: true }, 'trailingIcon'),
    ).toMatchObject({ onRemove: false });
  });
});

describe('playground snippets match their previews', () => {
  it('the divider is decorative by default, as the component is', () => {
    expect(snippet('divider')).not.toContain('decorative');
    expect(snippet('divider', { decorative: false })).toContain('decorative={false}');
  });

  it('the chips playground covers every chip type and its own props', () => {
    expect(snippet('chips', { type: 'filter', selected: true })).toContain('<FilterChip');
    expect(snippet('chips', { type: 'filter', selected: true })).toContain(
      'onSelectedChange={setSelected}',
    );
    expect(snippet('chips', { type: 'input', avatar: true, onRemove: true })).toMatch(
      /<InputChip[\s\S]*avatar=[\s\S]*onRemove=/,
    );
    expect(snippet('chips', { type: 'suggestion' })).toContain('<SuggestionChip');
    expect(controlNames('chips', { type: 'input' })).toEqual(
      expect.arrayContaining(['avatar', 'onRemove', 'selected']),
    );
    expect(controlNames('chips', { type: 'assist' })).not.toContain('avatar');
  });

  it("the radio group's error message shows while invalid", () => {
    expect(snippet('radio-group')).not.toContain('errorMessage');
    expect(snippet('radio-group', { invalid: true })).toContain(
      'errorMessage="Choose a delivery option."',
    );
  });

  it('the media viewer snippet opens the viewer from a button, from where it was opened', () => {
    const code = snippet('media-viewer');
    expect(code).toContain('const [open, setOpen] = useState(false);');
    expect(code).toContain('open={open}');
    expect(code).toContain('onOpenChange={setOpen}');
    expect(code).toContain('origin={opener}');
    expect(code).not.toContain('DOMRect');
  });

  it('the image crop dialog snippet opens and closes', () => {
    const code = snippet('image-crop');
    expect(code).toContain('onPress={() => setOpen(true)}');
    expect(code).toContain('setOpen(false);');
  });

  it('the sheets playground drives the side sheet too', () => {
    expect(controlNames('sheets', { sheet: 'side' })).toEqual(
      expect.arrayContaining(['detached', 'title', 'onBack', 'footer', 'footerDivider', 'divider']),
    );
    expect(snippet('sheets', { sheet: 'side', detached: true })).toMatch(
      /<SideSheet[\s\S]*detached/,
    );
  });

  it('the list writes line limits only when set, and item values only in a radio list', () => {
    expect(snippet('list')).not.toMatch(/headlineLines|value="alex"/);
    expect(snippet('list', { headlineLines: '2' })).toContain('headlineLines={2}');
    expect(snippet('list', { value: 'sam' })).toContain('value="alex"');
  });

  it("the button group's overflow snippet keeps the preview's narrow box", () => {
    expect(snippet('button-group', { overflow: true })).toContain('<div className="w-[180px]">');
  });
});
