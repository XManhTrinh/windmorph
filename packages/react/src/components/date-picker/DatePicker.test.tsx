import { CalendarDate } from '@internationalized/date';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { setMediaQueries } from '../../../test/setup';
import { Button } from '../button/Button';
import { DatePicker, DateRangePicker, type DateRange } from './DatePicker';
import { PickerDialog } from './PickerDialog';
import { COMPACT_WINDOW } from './use-media-query';

const march = new CalendarDate(2030, 3, 10);

describe('DatePicker', () => {
  it('shows the header, month navigation and a six-week grid with weekday headers', async () => {
    const { container } = render(<DatePicker defaultValue={march} data-testid="picker" />);
    expect(screen.getByTestId('picker')).toHaveClass('w-[360px]');
    expect(screen.getByText('Select date')).toHaveClass('text-label-large');
    expect(screen.getByText('Mar 10, 2030')).toHaveClass('text-headline-large');
    const grid = screen.getByRole('grid');
    // The weekday row and six weeks.
    expect(within(grid).getAllByRole('row')).toHaveLength(7);
    const sunday = within(grid).getAllByRole('columnheader')[0]!;
    expect(sunday).toHaveAttribute('abbr', 'Sunday');
    expect(sunday).toHaveAttribute('title', 'Sunday');
    const selected = within(grid).getByRole('button', { name: /March 10, 2030/ });
    expect(selected).toHaveAttribute('data-selected', 'true');
    // A 40px circle whose ::before makes the 48px target.
    expect(selected).toHaveClass(
      'size-[40px]',
      'before:-inset-[4px]',
      'data-selected:bg-[var(--_md-comp-date-picker-modal-date-selected-container-color)]',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('reads the modal date picker tokens for the headline, picked days and today', () => {
    render(<DatePicker defaultValue={march} data-testid="picker" />);
    const picker = screen.getByTestId('picker');
    expect(picker).toHaveAttribute('data-tokens', 'md-comp-date-picker-modal');
    expect(screen.getByText('Mar 10, 2030')).toHaveClass(
      'text-[color:var(--_md-comp-date-picker-modal-header-headline-color)]',
    );
    const day = screen.getByRole('button', { name: /March 10, 2030/ });
    expect(day).toHaveAttribute('data-slot', 'day');
    expect(day).toHaveClass(
      'data-selected:text-[color:var(--_md-comp-date-picker-modal-date-selected-label-text-color)]',
      'data-today:border-[color:var(--_md-comp-date-picker-modal-date-today-container-outline-color)]',
      'data-today:text-[color:var(--_md-comp-date-picker-modal-date-today-label-text-color)]',
    );
    expect(day).not.toHaveClass('data-selected:bg-primary', 'data-today:text-primary');
  });

  it('selects a day and moves between months, with the shortcut in the tooltip', async () => {
    const onChange = vi.fn();
    render(<DatePicker defaultValue={march} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /March 20, 2030/ }));
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2030, 3, 20));
    expect(screen.getByText('Mar 20, 2030')).toBeInTheDocument();
    const next = screen.getByRole('button', { name: 'Next month' });
    await userEvent.hover(next);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Next month (Page Down)');
    await userEvent.click(next);
    expect(screen.getByRole('button', { name: /^April 2030/ })).toBeInTheDocument();
  });

  it('pages months with a horizontal swipe and slides the new month in', () => {
    render(<DatePicker defaultValue={march} />);
    const grid = screen.getByRole('grid');
    const swipe = grid.parentElement!.parentElement!;
    fireEvent.pointerDown(grid, { pointerType: 'touch', pointerId: 1, clientX: 250, clientY: 200 });
    fireEvent.pointerUp(grid, { pointerType: 'touch', pointerId: 1, clientX: 120, clientY: 210 });
    expect(screen.getByRole('button', { name: /^April 2030/ })).toBeInTheDocument();
    expect(swipe.firstElementChild).toHaveAttribute('data-direction', 'next');
    // A mostly vertical move scrolls the page instead.
    fireEvent.pointerDown(swipe, {
      pointerType: 'touch',
      pointerId: 2,
      clientX: 200,
      clientY: 100,
    });
    fireEvent.pointerUp(swipe, { pointerType: 'touch', pointerId: 2, clientX: 260, clientY: 300 });
    expect(screen.getByRole('button', { name: /^April 2030/ })).toBeInTheDocument();
    fireEvent.pointerDown(swipe, {
      pointerType: 'touch',
      pointerId: 3,
      clientX: 100,
      clientY: 200,
    });
    fireEvent.pointerUp(swipe, { pointerType: 'touch', pointerId: 3, clientX: 220, clientY: 200 });
    expect(screen.getByRole('button', { name: /^March 2030/ })).toBeInTheDocument();
    expect(swipe.firstElementChild).toHaveAttribute('data-direction', 'previous');
  });

  it('shows every year of the range, disabling those outside min and max', async () => {
    render(
      <DatePicker
        defaultValue={march}
        yearRange={[2020, 2040]}
        minValue={new CalendarDate(2025, 1, 1)}
        maxValue={new CalendarDate(2035, 12, 31)}
        data-testid="picker"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Switch to selecting a year/ }));
    expect(screen.getByTestId('picker')).toHaveAttribute('data-years', 'true');
    const years = screen.getByRole('radiogroup', { name: 'Year' });
    expect(within(years).getAllByRole('radio')).toHaveLength(21);
    expect(within(years).getByRole('radio', { name: '2030' })).toBeChecked();
    const early = within(years).getByRole('radio', { name: '2021' });
    expect(early).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(early);
    expect(years).toBeInTheDocument();
    await userEvent.click(within(years).getByRole('radio', { name: '2032' }));
    expect(screen.getByRole('button', { name: /^March 2032/ })).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('opens the year list with Shift+Y and moves to the month menu with Shift+M', async () => {
    render(<DatePicker defaultValue={march} yearRange={[2020, 2040]} />);
    screen.getByRole('button', { name: /March 10, 2030/ }).focus();
    await userEvent.keyboard('{Shift>}M{/Shift}');
    expect(screen.getByRole('button', { name: /^March 2030/ })).toHaveFocus();
    screen.getByRole('button', { name: /March 10, 2030/ }).focus();
    await userEvent.keyboard('{Shift>}Y{/Shift}');
    const year = screen.getByRole('radio', { name: '2030' });
    expect(year).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    // Back on the grid, on the same day of the chosen year.
    expect(screen.getByRole('button', { name: /March 10, 2031/ })).toHaveFocus();
  });

  it('takes a typed date in an outlined field without a mask', async () => {
    const onChange = vi.fn();
    const { container } = render(<DatePicker defaultValue={march} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Switch to text input mode' }));
    const field = screen.getByRole('textbox', { name: 'Date' });
    expect(field).toHaveValue('03/10/2030');
    expect(field).toHaveAttribute('placeholder', 'MM/DD/YYYY');
    expect(field).toHaveAccessibleDescription('MM/DD/YYYY');
    expect(container.querySelector('[data-variant="outlined"]')).toBeInTheDocument();
    await userEvent.clear(field);
    await userEvent.type(field, '3-14-2030');
    // Typing is never reformatted while it happens.
    expect(field).toHaveValue('3-14-2030');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2030, 3, 14));
    expect(field).toHaveValue('03/14/2030');
    await userEvent.clear(field);
    await userEvent.type(field, '2.30.2030');
    await userEvent.tab();
    expect(field).toHaveAccessibleDescription(/Enter a date as MM\/DD\/YYYY/);
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  // M3: the modal date input reads "Enter date"; switching modes animates the new view in.
  it('titles the input mode "Enter date" and animates only a mode switch', async () => {
    const { container, rerender } = render(<DatePicker defaultValue={march} />);
    const view = () => container.querySelector('[data-mode] > div:last-child')!;
    expect(view()).not.toHaveAttribute('data-enter');
    await userEvent.click(screen.getByRole('button', { name: 'Switch to text input mode' }));
    expect(screen.getByText('Enter date')).toHaveClass('text-label-large');
    expect(view()).toHaveAttribute('data-enter', 'input');
    await userEvent.click(screen.getByRole('button', { name: 'Switch to calendar input mode' }));
    expect(screen.getByText('Select date')).toBeInTheDocument();
    expect(view()).toHaveAttribute('data-enter', 'calendar');
    rerender(<DateRangePicker defaultMode="input" strings={{ inputTitle: 'Type the dates' }} />);
    expect(screen.getByText('Type the dates')).toBeInTheDocument();
  });

  it('says when a typed date is out of range', async () => {
    render(<DatePicker defaultMode="input" maxValue={new CalendarDate(2030, 12, 31)} />);
    const field = screen.getByRole('textbox', { name: 'Date' });
    await userEvent.type(field, '1 2 2031{Enter}');
    expect(screen.getByText('Date out of range')).toBeInTheDocument();
  });
});

describe('DateRangePicker', () => {
  const day = (n: number) =>
    screen.getAllByText(String(n)).find((el) => !el.hasAttribute('data-outside'))!;

  it('selects a range on a vertically scrolling list of months', async () => {
    function Demo() {
      const [range, setRange] = useState<DateRange | null>(null);
      return (
        <DateRangePicker
          value={range}
          onChange={setRange}
          minValue={new CalendarDate(2030, 3, 1)}
          maxValue={new CalendarDate(2030, 5, 31)}
        />
      );
    }
    const { container } = render(<Demo />);
    expect(screen.getByText('Select dates')).toBeInTheDocument();
    // No month buttons: each month has its subhead and grid.
    expect(screen.queryByRole('button', { name: 'Next month' })).toBe(null);
    const subhead = screen.getAllByText('March 2030').find((el) => el.ariaHidden === 'true');
    expect(subhead).toHaveClass('text-title-small');
    expect(screen.getAllByRole('grid').length).toBeGreaterThanOrEqual(2);
    const march3 = screen.getByRole('button', { name: /March 3, 2030/ });
    await userEvent.click(march3);
    await userEvent.click(screen.getByRole('button', { name: /March 6, 2030/ }));
    expect(screen.getByText('Mar 3 – Mar 6')).toHaveClass('text-title-large');
    expect(march3.closest('td')).toHaveAttribute('data-range', 'start');
    const march4 = screen.getByRole('button', { name: /March 4, 2030/ });
    expect(march4.closest('td')).toHaveAttribute('data-range', 'middle');
    expect(march4).toHaveAttribute('data-in-range', 'true');
    // The band is the range token, drawn as a gradient on each cell.
    expect(march4.closest('td')).toHaveAttribute('data-slot', 'cell');
    expect(march4.closest('td')).toHaveClass(
      'data-[range=middle]:bg-[image:var(--_md-comp-date-picker-modal-range-middle)]',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('pages month by month with monthLayout="paged"', async () => {
    render(
      <DateRangePicker
        monthLayout="paged"
        defaultValue={{ start: new CalendarDate(2030, 3, 3), end: new CalendarDate(2030, 3, 6) }}
      />,
    );
    expect(day(4).closest('td')).toHaveAttribute('data-range', 'middle');
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('button', { name: /^April 2030/ })).toBeInTheDocument();
  });
});

describe('PickerDialog', () => {
  it('holds a picker with confirm and dismiss buttons', async () => {
    const onOpenChange = vi.fn();
    const { baseElement } = render(
      <PickerDialog
        aria-label="Select date"
        defaultOpen
        onOpenChange={onOpenChange}
        dismissButton={<Button variant="text">Cancel</Button>}
        confirmButton={<Button variant="text">OK</Button>}
      >
        <DatePicker defaultValue={march} />
      </PickerDialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Select date' });
    // The modal date picker's container tokens paint the panel.
    expect(dialog).toHaveAttribute('data-tokens', 'md-comp-date-picker-modal');
    expect(dialog).toHaveAttribute('data-variant', 'date');
    expect(dialog).toHaveClass(
      'rounded-[var(--_md-comp-date-picker-modal-container-shape)]',
      'bg-[var(--_md-comp-date-picker-modal-container-color)]',
      'shadow-[shadow:var(--_md-comp-date-picker-modal-container-elevation)]',
    );
    const ok = within(dialog).getByRole('button', { name: 'OK' });
    expect(ok.parentElement).toHaveClass('gap-[8px]');
    expect(screen.queryByRole('button', { name: 'Close' })).toBe(null);
    expect(await axeViolations(baseElement)).toEqual([]);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('lets a consumer class beat the container tokens', () => {
    render(
      <PickerDialog
        aria-label="Select date"
        defaultOpen
        className="bg-tertiary rounded-corner-small shadow-elevation-1"
        confirmButton={<Button variant="text">OK</Button>}
      >
        <DatePicker defaultValue={march} />
      </PickerDialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Select date' });
    expect(dialog).toHaveClass('bg-tertiary', 'rounded-corner-small', 'shadow-elevation-1');
    expect(dialog).not.toHaveClass(
      'bg-[var(--_md-comp-date-picker-modal-container-color)]',
      'rounded-[var(--_md-comp-date-picker-modal-container-shape)]',
      'shadow-[shadow:var(--_md-comp-date-picker-modal-container-elevation)]',
    );
  });

  it('paints a time dialog with the time picker container tokens', () => {
    render(
      <PickerDialog
        aria-label="Select time"
        variant="time"
        defaultOpen
        confirmButton={<Button variant="text">OK</Button>}
      >
        <p>Time</p>
      </PickerDialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Select time' });
    expect(dialog).toHaveAttribute('data-tokens', 'md-comp-time-picker');
    expect(dialog).toHaveAttribute('data-variant', 'time');
    expect(dialog).toHaveClass(
      'rounded-[var(--_md-comp-time-picker-container-shape)]',
      'bg-[var(--_md-comp-time-picker-container-color)]',
      'shadow-elevation-3',
    );
  });

  it('closes and saves on Enter with onConfirm', async () => {
    const saved = vi.fn();
    function Demo() {
      const [open, setOpen] = useState(true);
      const [draft, setDraft] = useState<CalendarDate | null>(march);
      return (
        <PickerDialog
          aria-label="Select date"
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => saved(draft)}
          confirmButton={<Button variant="text">OK</Button>}
        >
          <DatePicker value={draft} onChange={setDraft} />
        </PickerDialog>
      );
    }
    render(<Demo />);
    screen.getByRole('button', { name: /March 10, 2030/ }).focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await waitFor(() => expect(saved).toHaveBeenCalledWith(new CalendarDate(2030, 3, 11)));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBe(null));
  });

  it('fills a compact window with close and Save at the top', async () => {
    act(() => setMediaQueries({ [COMPACT_WINDOW]: true }));
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const { baseElement } = render(
      <PickerDialog
        aria-label="Select dates"
        defaultOpen
        fullScreen="compact"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        confirmButton={<Button variant="text">OK</Button>}
      >
        <DateRangePicker />
      </PickerDialog>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-full-screen', 'true');
    // M3: the date picker's container is `surface-container-high`, full screen too, under the
    // full-screen dialog's 56px top row with an `on-surface` close icon.
    expect(dialog).toHaveClass(
      'size-full',
      'rounded-none',
      'bg-[var(--_md-comp-date-picker-modal-container-color)]',
    );
    expect(dialog.querySelector('div')).toHaveClass('h-[56px]');
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveClass(
      '[--md-comp-icon-button-icon-color:var(--md-sys-color-on-surface)]',
    );
    expect(within(dialog).queryByRole('button', { name: 'OK' })).toBe(null);
    expect(await axeViolations(baseElement)).toEqual([]);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
