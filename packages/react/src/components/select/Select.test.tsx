import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { SelectItem, SelectSection } from './option-list';
import { Select, type SelectProps } from './Select';

const sortField = () => screen.getByRole('button', { name: /Sort by/ });

function Sort(props: Partial<SelectProps<object, 'single' | 'multiple'>>) {
  return (
    <Select label="Sort by" {...props}>
      <SelectItem key="newest">Newest first</SelectItem>
      <SelectItem key="low" description="Cheapest at the top">
        Price, low to high
      </SelectItem>
      <SelectItem key="high">Price, high to low</SelectItem>
    </Select>
  );
}

describe('Select', () => {
  it('takes its own density into the field and its menu, over its scope', async () => {
    const { container } = render(
      <ThemeScope density={-1}>
        <Sort density={-3} />
      </ThemeScope>,
    );
    expect(container.querySelector('[data-field-state]')).toHaveAttribute('data-density', '-3');
    await userEvent.click(sortField());
    const list = screen.getByRole('listbox');
    expect(list.closest('[data-overlay-scope]')).toHaveAttribute('data-density', '-3');
    expect(within(list).getAllByRole('option')[0]).toHaveClass(
      'min-h-[calc(44px+var(--md-sys-density,0)*4px)]',
    );
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("inherits its scope's density when it sets none", async () => {
    const { container } = render(
      <ThemeScope density={-2}>
        <Sort />
      </ThemeScope>,
    );
    expect(container.querySelector('[data-field-state]')).not.toHaveAttribute('data-density');
    await userEvent.click(sortField());
    expect(screen.getByRole('listbox').closest('[data-overlay-scope]')).toHaveAttribute(
      'data-density',
      '-2',
    );
  });

  it('reads the text field’s component tokens', () => {
    const { container } = render(<Sort variant="outlined" defaultValue="low" />);
    const field = container.querySelector('[data-field-state]');
    expect(field).toHaveAttribute('data-tokens', 'md-comp-text-field');
    expect(field).toHaveAttribute('data-variant', 'outlined');
    expect(container.querySelector('[data-slot="outline"]')).toHaveClass(
      'border-[color:var(--_md-comp-text-field-outline-color)]',
    );
    expect(screen.getAllByText('Price, low to high')[0]).toHaveClass(
      'text-[color:var(--_md-comp-text-field-input-text-color)]',
    );
  });

  it('opens a menu of options and shows the chosen one in the field', async () => {
    const onChange = vi.fn();
    render(<Sort onChange={onChange} />);
    await userEvent.click(sortField());
    const list = screen.getByRole('listbox');
    expect(within(list).getAllByRole('option')).toHaveLength(3);
    await userEvent.click(within(list).getByRole('option', { name: /Price, low to high/ }));
    expect(onChange).toHaveBeenCalledWith('low');
    // The menu animates out before it unmounts (as Menu's tests wait for).
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    expect(sortField()).toHaveTextContent('Price, low to high');
  });

  it('works with the keyboard: open, move, choose, and typeahead', async () => {
    render(<Sort />);
    await userEvent.tab();
    expect(sortField()).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(sortField()).toHaveTextContent('Price, low to high');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    // Typeahead on the closed field jumps to a match.
    // Focus returns to the field once the menu has gone.
    await waitFor(() => expect(sortField()).toHaveFocus());
    await userEvent.keyboard('n');
    expect(sortField()).toHaveTextContent('Newest first');
  });

  // M3 menus keyboard table: "Letters — Focus moves to the next menu item starting with letter".
  it('moves typeahead to the next option starting with the letter, wrapping', async () => {
    render(<Sort defaultValue="low" />);
    await userEvent.tab();
    // On the closed field, a letter picks the next match after the chosen option.
    await userEvent.keyboard('p');
    expect(sortField()).toHaveTextContent('Price, high to low');
    await userEvent.keyboard('{ArrowDown}');
    const list = screen.getByRole('listbox');
    const option = (name: RegExp) => within(list).getByRole('option', { name });
    expect(option(/Price, high to low/)).toHaveFocus();
    await userEvent.keyboard('p');
    expect(option(/Price, low to high/)).toHaveFocus();
    // The same letter again moves on.
    await userEvent.keyboard('p');
    expect(option(/Price, high to low/)).toHaveFocus();
  });

  it('keeps the label resting with a placeholder, which shows once it floats on focus', async () => {
    render(<Sort placeholder="Choose an order" />);
    const field = sortField().closest('[data-field-state]');
    expect(field).not.toHaveAttribute('data-floated');
    expect(screen.getByText('Choose an order')).toHaveClass(
      'opacity-0',
      'group-data-floated/field:opacity-100',
    );
    await userEvent.tab();
    expect(field).toHaveAttribute('data-floated', 'true');
  });

  it('includes the required asterisk in the name', () => {
    render(<Sort required />);
    expect(screen.getByRole('button', { name: /Sort by \*/ })).toBeInTheDocument();
  });

  it('lets the keyboard reach disabled options without choosing them', async () => {
    const onChange = vi.fn();
    render(<Sort disabledKeys={['low']} onChange={onChange} />);
    await userEvent.tab();
    // Opens on Newest first; the next arrow lands on the disabled option.
    await userEvent.keyboard('{ArrowDown}');
    const disabled = screen.getByRole('option', { name: /low to high/ });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(disabled).toHaveAttribute('data-disabled', 'true');
    await userEvent.keyboard('{ArrowDown}');
    expect(disabled).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('is read-only: shows the choice, opens no menu and ignores the keyboard', async () => {
    render(<Sort readOnly defaultValue="high" />);
    expect(sortField().closest('[data-field-state]')).toHaveAttribute('data-readonly', 'true');
    await userEvent.click(sortField());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}n');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(sortField()).toHaveTextContent('Price, high to low');
  });

  it('draws a persistent scrollbar on the list', async () => {
    render(<Sort />);
    await userEvent.click(sortField());
    expect(screen.getByRole('listbox')).toHaveClass('[&::-webkit-scrollbar-thumb]:bg-outline');
  });

  it("fills its popover, which is at least as wide as the field, where Menu keeps its content's width", async () => {
    render(<Sort />);
    await userEvent.click(sortField());
    const reveal = screen.getByRole('listbox').closest('[data-placement]');
    expect(reveal).toHaveClass('w-auto');
    expect(reveal).not.toHaveClass('w-max');
  });

  it('chooses several options, lists them in the field and keeps the menu open', async () => {
    function Fruits() {
      const [value, setValue] = useState<readonly (string | number)[]>([]);
      return (
        <Select label="Fruits" selectionMode="multiple" value={value} onChange={setValue}>
          <SelectItem key="apple">Apple</SelectItem>
          <SelectItem key="banana">Banana</SelectItem>
          <SelectItem key="cherry">Cherry</SelectItem>
          <SelectItem key="date">Date</SelectItem>
        </Select>
      );
    }
    render(<Fruits />);
    const field = screen.getByRole('button', { name: /Fruits/ });
    await userEvent.click(field);
    // Picked out of order; the field lists them in the list's order.
    for (const name of ['Cherry', 'Apple', 'Banana']) {
      await userEvent.click(screen.getByRole('option', { name }));
    }
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    expect(field).toHaveTextContent('Apple, Banana +1');
  });

  it('caps multiple selection with maxSelections', async () => {
    const onChange = vi.fn();
    render(<Sort selectionMode="multiple" maxSelections={2} onChange={onChange} />);
    await userEvent.click(sortField());
    await userEvent.click(screen.getByRole('option', { name: /Newest first/ }));
    await userEvent.click(screen.getByRole('option', { name: /low to high/ }));
    expect(onChange).toHaveBeenLastCalledWith(['newest', 'low']);
    const third = screen.getByRole('option', { name: /high to low/ });
    expect(third).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(third);
    expect(onChange).toHaveBeenCalledTimes(2);
    // Removing one frees a place.
    await userEvent.click(screen.getByRole('option', { name: /Newest first/ }));
    expect(third).not.toHaveAttribute('aria-disabled');
  });

  it("nests the first and last options' outer corners in the panel's, as Menu does", async () => {
    render(<Sort />);
    await userEvent.click(sortField());
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveClass('rounded-t-corner-medium', 'rounded-b-corner-extra-small');
    expect(options[1]).toHaveClass('rounded-t-corner-extra-small', 'rounded-b-corner-extra-small');
    expect(options.at(-1)).toHaveClass('rounded-t-corner-extra-small', 'rounded-b-corner-medium');
  });

  it('groups options in sections with headings', async () => {
    render(
      <Select label="Currency">
        <SelectSection title="Popular">
          <SelectItem key="gbp">GBP</SelectItem>
        </SelectSection>
        <SelectSection title="All">
          <SelectItem key="eur">EUR</SelectItem>
        </SelectSection>
      </Select>,
    );
    await userEvent.click(screen.getByRole('button', { name: /Currency/ }));
    expect(screen.getByRole('group', { name: 'Popular' })).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('submits the chosen key under its name and validates required', async () => {
    const { container } = render(
      <form>
        <Sort name="sort" defaultValue="high" required />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('sort')).toBe('high');
  });

  it('renders its hidden native select only when a form needs it', () => {
    const { container, rerender } = render(<Sort />);
    expect(container.querySelector('select')).toBeNull();
    rerender(<Sort name="sort" />);
    expect(container.querySelector('select[name="sort"]')).not.toBeNull();
  });

  it('announces an error as an alert, with an error icon', () => {
    const { rerender } = render(<Sort invalid errorMessage="Choose an order" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Choose an order');
    expect(screen.getByRole('img', { name: 'Error' })).toBeInTheDocument();
    expect(sortField().closest('[data-field-state]')).toHaveAttribute('data-field-state', 'error');
    rerender(<Sort invalid errorMessage="Choose an order" errorIcon={false} />);
    expect(screen.queryByRole('img', { name: 'Error' })).not.toBeInTheDocument();
  });

  it('opens in a bottom sheet with presentation="sheet"', async () => {
    render(<Sort presentation="sheet" classNames={{ sheet: 'bg-surface-container' }} />);
    await userEvent.click(sortField());
    // The sheet's code loads on first open.
    const sheet = await screen.findByRole('dialog', { name: 'Sort by' });
    // classNames.sheet styles the sheet's surface.
    expect(sheet).toHaveClass('bg-surface-container');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens its sheet fully, never at half the window', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(349);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(620);
    try {
      render(<Sort presentation="sheet" />);
      await userEvent.click(sortField());
      const sheet = await screen.findByRole('dialog', { name: 'Sort by' });
      expect(sheet).toHaveAttribute('data-detent', 'expanded');
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('opens and closes under control with open and onOpenChange', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return <Sort open={open} onOpenChange={setOpen} />;
    }
    render(<Controlled />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    await userEvent.click(sortField());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('is disabled', async () => {
    render(<Sort disabled />);
    expect(sortField()).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Sort supportingText="How results are ordered" />
        <Sort variant="outlined" required invalid errorMessage="Required" />
        <Sort placeholder="Choose" readOnly />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'CI', name: "Côte d'Ivoire", region: 'Africa' },
  { code: 'JP', name: 'Japan', region: 'Asia' },
  { code: 'US', name: 'United States', region: 'Americas' },
];
type Country = (typeof COUNTRIES)[number];

function Countries(props: Partial<SelectProps<Country, 'single' | 'multiple'>>) {
  return (
    <Select label="Country" searchable items={COUNTRIES} {...props}>
      {(country: Country) => <SelectItem key={country.code}>{country.name}</SelectItem>}
    </Select>
  );
}

const countryField = () => screen.getByRole('button', { name: /Country/ });
const searchBox = () => screen.getByRole('searchbox', { name: 'Search' });

describe('Select searchable', () => {
  it('opens a dialog whose search has focus and filters, ignoring accents', async () => {
    const onChange = vi.fn();
    const { container } = render(<Countries onChange={onChange} />);
    expect(countryField()).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(countryField());
    expect(screen.getByRole('dialog', { name: 'Country' })).toBeInTheDocument();
    expect(searchBox()).toHaveFocus();
    await userEvent.keyboard('cote');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      "Côte d'Ivoire",
    ]);
    // The arrows move through the matches while focus stays in the search.
    await userEvent.keyboard('{ArrowDown}');
    expect(searchBox()).toHaveFocus();
    expect(searchBox()).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: "Côte d'Ivoire" }).id,
    );
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('CI');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    expect(countryField()).toHaveTextContent("Côte d'Ivoire");
    await waitFor(() => expect(countryField()).toHaveFocus());
    expect(await axeViolations(container)).toEqual([]);
  });

  it('Escape clears the search, then closes; the search is fresh next time', async () => {
    render(<Countries />);
    await userEvent.click(countryField());
    await userEvent.keyboard('fra');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Escape}');
    expect(searchBox()).toHaveValue('');
    expect(screen.getAllByRole('option')).toHaveLength(5);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    await userEvent.click(countryField());
    expect(searchBox()).toHaveValue('');
  });

  it('closes on Escape with an option chosen, and keeps the choice', async () => {
    const onChange = vi.fn();
    render(<Countries defaultValue="FR" onChange={onChange} />);
    await userEvent.click(countryField());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    expect(countryField()).toHaveTextContent('France');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides sections with no matches and shows "No results" when nothing matches', async () => {
    render(
      <Select label="Country" searchable labels={{ noResults: 'Nothing found' }}>
        <SelectSection title="Europe">
          <SelectItem key="GB">United Kingdom</SelectItem>
          <SelectItem key="FR">France</SelectItem>
        </SelectSection>
        <SelectSection title="Asia">
          <SelectItem key="JP">Japan</SelectItem>
        </SelectSection>
      </Select>,
    );
    await userEvent.click(countryField());
    expect(screen.getByText('Asia')).toBeInTheDocument();
    await userEvent.keyboard('fr');
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.queryByText('Asia')).not.toBeInTheDocument();
    await userEvent.keyboard('zz');
    expect(screen.getByRole('status')).toHaveTextContent('Nothing found');
  });

  it('keeps the dialog open and the search between several choices, up to maxSelections', async () => {
    const onChange = vi.fn();
    render(<Countries selectionMode="multiple" maxSelections={2} onChange={onChange} />);
    await userEvent.click(countryField());
    await userEvent.keyboard('united');
    await userEvent.click(screen.getByRole('option', { name: 'United Kingdom' }));
    await userEvent.click(screen.getByRole('option', { name: 'United States' }));
    expect(onChange).toHaveBeenLastCalledWith(['GB', 'US']);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(searchBox()).toHaveValue('united');
    await userEvent.clear(searchBox());
    expect(screen.getByRole('option', { name: 'Japan' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('leaves filtering to the app when it handles onSearchChange', async () => {
    const onSearchChange = vi.fn();
    render(<Countries onSearchChange={onSearchChange} />);
    await userEvent.click(countryField());
    await userEvent.keyboard('jap');
    expect(onSearchChange).toHaveBeenLastCalledWith('jap');
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('opens a sheet showing the list first, without focusing the search', async () => {
    render(<Countries presentation="sheet" />);
    await userEvent.click(countryField());
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(searchBox()).not.toHaveFocus();
  });
});

describe('Select renderValue', () => {
  it('shows the rendered value while screen readers and forms keep the option', () => {
    const { container } = render(
      <form>
        <Countries
          name="country"
          defaultValue="GB"
          renderValue={(selected) => selected.map((option) => `+${option.key}`).join(' ')}
        />
      </form>,
    );
    expect(countryField()).toHaveAccessibleName(/United Kingdom/);
    expect(screen.getByText('+GB')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('select[name="country"]')).toHaveValue('GB');
  });
});

describe('Select classNames', () => {
  it('puts the field and option slots on their parts', async () => {
    const { container } = render(
      <Select
        label="Currency"
        variant="outlined"
        classNames={{
          outline: 'outline-x',
          activeIndicator: 'indicator-x',
          heading: 'heading-x',
          divider: 'divider-x',
          icon: 'icon-x',
          description: 'description-x',
          trailing: 'trailing-x',
        }}
      >
        <SelectSection title="Popular">
          <SelectItem key="gbp" description="Pound" trailing="£">
            GBP
          </SelectItem>
        </SelectSection>
        <SelectSection title="All">
          <SelectItem key="eur" leadingIcon={<svg data-testid="eur-icon" />}>
            EUR
          </SelectItem>
        </SelectSection>
      </Select>,
    );
    expect(container.querySelector('[data-slot="outline"]')).toHaveClass('outline-x');
    expect(container.querySelector('[data-slot="active-indicator"]')).toHaveClass('indicator-x');
    await userEvent.click(screen.getByRole('button', { name: /Currency/ }));
    expect(screen.getByText('Popular')).toHaveClass('heading-x');
    expect(document.querySelector('.divider-x')).toHaveAttribute('role', 'presentation');
    expect(screen.getByTestId('eur-icon').parentElement).toHaveClass('icon-x');
    expect(screen.getByText('Pound')).toHaveClass('description-x');
    expect(screen.getByText('£')).toHaveClass('trailing-x');
  });
});
