import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { AutocompleteItem } from '../select/option-list';
import { Autocomplete, type AutocompleteProps } from './Autocomplete';

const CITIES = [
  { id: 'zrh', name: 'Zürich' },
  { id: 'sp', name: 'São Paulo' },
  { id: 'krk', name: 'Kraków' },
  { id: 'ldn', name: 'London' },
];

type City = (typeof CITIES)[number];

function Cities(props: Partial<AutocompleteProps<City, 'single' | 'multiple'>>) {
  return (
    <Autocomplete label="City" defaultItems={CITIES} {...props}>
      {(city: City) => <AutocompleteItem key={city.id}>{city.name}</AutocompleteItem>}
    </Autocomplete>
  );
}

const input = () => screen.getByRole('combobox', { name: /City/ });

describe('Autocomplete', () => {
  it('takes its own density into the field and its menu, over its scope', async () => {
    const { container } = render(
      <ThemeScope density={-1}>
        <Cities density={-2} selectionMode="multiple" defaultValue={['zrh']} />
      </ThemeScope>,
    );
    expect(container.querySelector('[data-field-state]')).toHaveAttribute('data-density', '-2');
    await userEvent.click(input());
    expect(screen.getByRole('listbox').closest('[data-overlay-scope]')).toHaveAttribute(
      'data-density',
      '-2',
    );
  });

  it('reads the text field’s component tokens', () => {
    const { container } = render(<Cities />);
    const field = container.querySelector('[data-field-state]');
    expect(field).toHaveAttribute('data-tokens', 'md-comp-text-field');
    expect(field).toHaveAttribute('data-variant', 'filled');
    expect(input()).toHaveClass(
      'text-[color:var(--_md-comp-text-field-input-text-color)]',
      'caret-[color:var(--_md-comp-text-field-caret-color)]',
    );
  });

  it('filters as you type, ignoring accents, and chooses with the keyboard', async () => {
    const onChange = vi.fn();
    render(<Cities onChange={onChange} />);
    await userEvent.type(input(), 'krakow');
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Kraków']);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('krk');
    expect(input()).toHaveValue('Kraków');
  });

  it('says when nothing matches', async () => {
    render(<Cities />);
    await userEvent.type(input(), 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('No results');
  });

  it('opens all options from the arrow button', async () => {
    render(<Cities />);
    await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(4);
  });

  // M3: "A menu should open when a person … Selects an element, such as … a text field".
  it('opens all options when the field is pressed, but not on keyboard focus', async () => {
    render(<Cities defaultInputValue="Zürich" />);
    await userEvent.tab();
    expect(input()).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.click(input());
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(4);
  });

  // M3: the menu opens when a person selects the text field; the field's padding and the
  // space around chips cover most of it, not just the input's band.
  it('opens when the field is pressed outside the input, chips included', async () => {
    render(<Cities selectionMode="multiple" defaultValue={['zrh']} />);
    // The padded wrapper around the chips and the input.
    await userEvent.click(input().parentElement!);
    expect(input()).toHaveFocus();
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(4);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    // A chip's label (not its remove button).
    await userEvent.click(screen.getByText('Zürich'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // Presses in the menu (portalled, but inside the field in React's tree) still choose.
    await userEvent.click(screen.getByRole('option', { name: 'London' }));
    expect(screen.getByRole('option', { name: 'London' })).toHaveAttribute('aria-selected', 'true');
  });

  it('leaves opening to the arrow with menuTrigger="manual"', async () => {
    render(<Cities menuTrigger="manual" />);
    await userEvent.click(input());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('takes a custom filter', async () => {
    render(<Cities filter={(text, query) => text.toLowerCase().startsWith(query.toLowerCase())} />);
    await userEvent.type(input(), 'on');
    expect(screen.getByRole('status')).toHaveTextContent('No results');
  });

  it('shows a loading indicator for options loaded from a server', async () => {
    function Remote() {
      const [query, setQuery] = useState('');
      return (
        <Autocomplete
          label="City"
          items={[]}
          inputValue={query}
          onInputChange={setQuery}
          loading={query.length > 0}
        >
          {(city: City) => <AutocompleteItem key={city.id}>{city.name}</AutocompleteItem>}
        </Autocomplete>
      );
    }
    render(<Remote />);
    await userEvent.type(input(), 'lo');
    // Its code loads on demand, so it can arrive a moment later.
    expect(await screen.findByRole('progressbar', { name: 'Loading options' })).toBeInTheDocument();
  });

  it('chooses several options as input chips, removable by button and Backspace', async () => {
    const onChange = vi.fn();
    render(<Cities selectionMode="multiple" onChange={onChange} />);
    // Pressing the field opens the whole list (M3).
    await userEvent.click(input());
    await userEvent.click(screen.getByRole('option', { name: 'Zürich' }));
    await userEvent.click(screen.getByRole('option', { name: 'London' }));
    expect(onChange).toHaveBeenLastCalledWith(['zrh', 'ldn']);
    // The menu stays open between picks; while it's open, React Aria hides the rest of the
    // page from screen readers, chips included, so close it first.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    expect(screen.getByRole('button', { name: 'Remove London' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove Zürich' }));
    expect(onChange).toHaveBeenLastCalledWith(['ldn']);
    await userEvent.click(input());
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('caps multiple selection with maxSelections, for the keyboard too', async () => {
    const onChange = vi.fn();
    render(<Cities selectionMode="multiple" maxSelections={1} onChange={onChange} />);
    // Pressing the field opens the whole list (M3).
    await userEvent.click(input());
    await userEvent.click(screen.getByRole('option', { name: 'Zürich' }));
    expect(onChange).toHaveBeenLastCalledWith(['zrh']);
    expect(screen.getByRole('option', { name: 'London' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.type(input(), 'lon');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('announces an error and is disabled', () => {
    const { rerender } = render(<Cities invalid errorMessage="Choose a city" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a city');
    expect(screen.getByRole('img', { name: 'Error' })).toBeInTheDocument();
    rerender(<Cities invalid errorMessage="Choose a city" disabled />);
    expect(input()).toBeDisabled();
  });

  it('keeps the label resting with a placeholder until focused', async () => {
    render(<Cities placeholder="Start typing" required />);
    const field = input().closest('[data-field-state]');
    expect(field).not.toHaveAttribute('data-floated');
    expect(screen.getByRole('combobox', { name: 'City *' })).toBeInTheDocument();
    await userEvent.click(input());
    expect(field).toHaveAttribute('data-floated', 'true');
  });

  it('lets the arrow keys reach disabled options without choosing them', async () => {
    const onChange = vi.fn();
    render(<Cities disabledKeys={['sp']} onChange={onChange} />);
    // Pressing the field opens the whole list (M3).
    await userEvent.click(input());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const disabled = screen.getByRole('option', { name: 'São Paulo' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(input()).toHaveAttribute('aria-activedescendant', disabled.id);
    await userEvent.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the typed text and the choice with clearable', async () => {
    const onChange = vi.fn();
    render(<Cities clearable defaultValue="ldn" onChange={onChange} />);
    expect(input()).toHaveValue('London');
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input()).toHaveValue('');
    expect(input()).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('eases filtered options into their new places', async () => {
    // jsdom has no layout: each option's top is its index × 44px in the current list.
    const spy = vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.getAttribute('role') !== 'option') return 0;
      const options = [...(this.parentElement?.children ?? [])];
      return options.indexOf(this) * 44;
    });
    render(<Cities />);
    // Pressing the field opens the whole list (M3).
    await userEvent.click(input());
    await userEvent.type(input(), 'o');
    // "London" moved up from the 4th row; it starts where it was and springs home.
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'London' }).style.transform).not.toBe(''),
    );
    spy.mockRestore();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Cities supportingText="Where you live" />
        <Cities variant="outlined" selectionMode="multiple" defaultValue={['zrh']} />
        <Cities clearable defaultValue="ldn" required invalid errorMessage="Choose a city" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('Autocomplete classNames', () => {
  it('puts the field slots and the empty slot on their parts', async () => {
    const { container } = render(
      <Cities variant="outlined" classNames={{ outline: 'outline-x', empty: 'empty-x' }} />,
    );
    expect(container.querySelector('[data-slot="outline"]')).toHaveClass('outline-x');
    await userEvent.type(input(), 'zzz');
    expect(screen.getByRole('status')).toHaveClass('empty-x');
  });
});
