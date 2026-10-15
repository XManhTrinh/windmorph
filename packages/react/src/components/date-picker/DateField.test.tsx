import { CalendarDate } from '@internationalized/date';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from './use-media-query';
import { DateField } from './DateField';

const march = new CalendarDate(2030, 3, 10);

describe('DateField (docked date picker)', () => {
  it('takes a density for its field only', async () => {
    render(<DateField label="Start date" density={-2} data-testid="field" />);
    expect(screen.getByTestId('field')).toHaveAttribute('data-density', '-2');
    await userEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    // The calendar keeps its size: nothing in it reads the density.
    expect(screen.getByRole('dialog').closest('[data-overlay-scope]')).not.toHaveAttribute(
      'data-density',
      '-2',
    );
  });

  // M3: "On compact breakpoints … a full-screen modal date picker is recommended"; the 360px
  // docked calendar was cut off on a phone.
  it('opens the modal picker full screen on a compact window', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    const onChange = vi.fn();
    render(<DateField label="Start date" defaultValue={march} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Choose a date' });
    // The modal picker's header and its full-screen Save, not the docked menus.
    expect(within(dialog).getByText('Select date')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /Choose a month/ })).toBe(null);
    await userEvent.click(within(dialog).getByRole('button', { name: /March 12, 2030/ }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2030, 3, 12));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue('03/12/2030');
  });

  it('is an outlined field with the format as helper text, taking typed dates', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateField label="Start date" defaultValue={march} onChange={onChange} data-testid="field" />,
    );
    expect(screen.getByTestId('field')).toHaveAttribute('data-variant', 'outlined');
    const input = screen.getByRole('textbox', { name: 'Start date' });
    expect(input).toHaveValue('03/10/2030');
    expect(input).toHaveAccessibleDescription('MM/DD/YYYY');
    await userEvent.clear(input);
    await userEvent.type(input, '4 2 2030');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2030, 4, 2));
    expect(input).toHaveValue('04/02/2030');
    await userEvent.clear(input);
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('opens a calendar below with outside days, picks a day and confirms with OK', async () => {
    const onChange = vi.fn();
    const { baseElement } = render(
      <DateField label="Date" defaultValue={march} onChange={onChange} />,
    );
    const open = screen.getByRole('button', { name: 'Open calendar' });
    expect(open).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(open);
    const calendar = screen.getByRole('dialog', { name: 'Choose a date' });
    expect(calendar).toHaveClass('bg-surface-container-high', 'rounded-corner-large');
    // The focused day takes focus; days of the months around are drawn but not chosen.
    await waitFor(() =>
      expect(within(calendar).getByRole('button', { name: /March 10, 2030/ })).toHaveFocus(),
    );
    const outside = within(calendar)
      .getAllByText('28')
      .find((el) => el.hasAttribute('data-outside'))!;
    expect(outside).toHaveClass('data-outside:visible', 'data-outside:text-on-surface-variant');
    // M3's docked set isn't exposed: the docked days keep their classes, not the modal tokens.
    expect(calendar).not.toHaveAttribute('data-tokens');
    expect(within(calendar).getByRole('button', { name: /March 10, 2030/ })).toHaveClass(
      'data-selected:bg-primary',
      'data-today:border-primary',
    );
    expect(await axeViolations(baseElement)).toEqual([]);
    await userEvent.click(within(calendar).getByRole('button', { name: /March 21, 2030/ }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(within(calendar).getByRole('button', { name: 'OK' }));
    expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2030, 3, 21));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null));
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveValue('03/21/2030');
  });

  it('closes and saves on Enter', async () => {
    const onChange = vi.fn();
    render(<DateField label="Date" defaultValue={march} onChange={onChange} defaultOpen />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /March 10, 2030/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2030, 3, 17));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null));
  });

  it('has month and year menus, and previous / next year buttons', async () => {
    render(
      <DateField
        label="Date"
        defaultValue={march}
        defaultOpen
        yearRange={[2025, 2035]}
        maxValue={new CalendarDate(2032, 6, 30)}
      />,
    );
    const calendar = screen.getByRole('dialog');
    await userEvent.click(within(calendar).getByRole('button', { name: 'Next year' }));
    expect(within(calendar).getByRole('button', { name: /^2031, Choose a year/ })).toBeVisible();
    await userEvent.click(within(calendar).getByRole('button', { name: /^March, Choose a month/ }));
    const months = within(calendar).getByRole('radiogroup', { name: 'Month' });
    expect(within(months).getByRole('radio', { name: 'March' })).toBeChecked();
    // M3 menus: the open menu's button keeps a pressed state layer.
    const monthButton = within(calendar).getByRole('button', { name: /Choose a month/ });
    expect(monthButton).toHaveAttribute('data-menu-open', 'true');
    expect(monthButton).toHaveClass('state-layer');
    // The other menu button is disabled while a menu is open.
    expect(within(calendar).getByRole('button', { name: /Choose a year/ })).toBeDisabled();
    await userEvent.click(within(months).getByRole('radio', { name: 'July' }));
    expect(within(calendar).getByRole('grid')).toHaveAccessibleName(/July 2031/);
    expect(within(calendar).getByRole('button', { name: /Choose a month/ })).not.toHaveAttribute(
      'data-menu-open',
    );
    await userEvent.click(within(calendar).getByRole('button', { name: /Choose a year/ }));
    const years = within(calendar).getByRole('radiogroup', { name: 'Year' });
    expect(within(years).getAllByRole('radio')).toHaveLength(11);
    expect(within(years).getByRole('radio', { name: '2034' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await userEvent.click(within(years).getByRole('radio', { name: '2026' }));
    expect(within(calendar).getByRole('grid')).toHaveAccessibleName(/July 2026/);
  });

  it('moves to the month and year menus with Shift+M and Shift+Y', async () => {
    render(<DateField label="Date" defaultValue={march} defaultOpen />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /March 10, 2030/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{Shift>}M{/Shift}');
    expect(screen.getByRole('radio', { name: 'March' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('grid')).toHaveAccessibleName(/April 2030/);
    screen.getByRole('button', { name: /April 10, 2030/ }).focus();
    await userEvent.keyboard('{Shift>}Y{/Shift}');
    expect(screen.getByRole('radio', { name: '2030' })).toHaveFocus();
  });
});

describe('DateField classNames', () => {
  it("puts the text field's and the calendar's slots on their parts", async () => {
    render(
      <DateField
        label="Date"
        defaultValue={march}
        defaultOpen
        supportingText="Day, month and year"
        classNames={{
          label: 'label-x',
          container: 'container-x',
          supportingText: 'supporting-x',
          trailingIcon: 'trailing-x',
          menuButton: 'menu-x',
          weekday: 'weekday-x',
          day: 'day-x',
          item: 'item-x',
        }}
      />,
    );
    expect(screen.getByText('Date', { selector: 'label' })).toHaveClass('label-x');
    expect(screen.getByText('Day, month and year')).toHaveClass('supporting-x');
    const open = screen.getByRole('button', { name: 'Open calendar', hidden: true });
    expect(open.parentElement).toHaveClass('trailing-x');
    expect(document.querySelector('[data-slot="container"]')).toHaveClass('container-x');
    const calendar = screen.getByRole('dialog');
    expect(within(calendar).getByRole('button', { name: /Choose a year/ })).toHaveClass('menu-x');
    expect(within(calendar).getAllByRole('columnheader')[0]).toHaveClass('weekday-x');
    expect(within(calendar).getByRole('button', { name: /March 10, 2030/ })).toHaveClass('day-x');
    await userEvent.click(within(calendar).getByRole('button', { name: /Choose a month/ }));
    expect(within(calendar).getByRole('radio', { name: 'March' })).toHaveClass('item-x');
  });
});
