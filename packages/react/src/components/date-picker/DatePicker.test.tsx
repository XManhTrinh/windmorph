import { CalendarDate } from '@internationalized/date';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Button } from '../button/Button';
import { DatePicker, DateRangePicker, type DateRange } from './DatePicker';
import { PickerDialog } from './PickerDialog';

const march = new CalendarDate(2026, 3, 10);

describe('DatePicker', () => {
  it('shows the header, month navigation and a six-week grid', async () => {
    const { container } = render(<DatePicker defaultValue={march} data-testid="picker" />);
    expect(screen.getByTestId('picker')).toHaveClass('w-[360px]');
    expect(screen.getByText('Select date')).toHaveClass('text-label-large');
    expect(screen.getByText('Mar 10, 2026')).toHaveClass('text-headline-large');
    const grid = screen.getByRole('grid');
    // Six week rows (React Aria hides the weekday header row from assistive tech).
    expect(within(grid).getAllByRole('row')).toHaveLength(6);
    const selected = within(grid).getByRole('button', { name: /March 10, 2026/ });
    expect(selected).toHaveAttribute('data-selected', 'true');
    expect(selected).toHaveClass('size-[40px]', 'data-selected:bg-primary');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('selects a day and moves between months', async () => {
    const onChange = vi.fn();
    render(<DatePicker defaultValue={march} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /March 20, 2026/ }));
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2026, 3, 20));
    expect(screen.getByText('Mar 20, 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('button', { name: /^April 2026/ })).toBeInTheDocument();
  });

  it('picks a year from the year list', async () => {
    render(<DatePicker defaultValue={march} yearRange={[2020, 2030]} data-testid="picker" />);
    await userEvent.click(screen.getByRole('button', { name: /Switch to selecting a year/ }));
    expect(screen.getByTestId('picker')).toHaveAttribute('data-years', 'true');
    const years = screen.getByRole('radiogroup', { name: 'Year' });
    expect(within(years).getAllByRole('radio')).toHaveLength(11);
    expect(within(years).getByRole('radio', { name: '2026' })).toBeChecked();
    await userEvent.click(within(years).getByRole('radio', { name: '2028' }));
    expect(screen.getByRole('button', { name: /^March 2028/ })).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('switches to text input mode', async () => {
    render(<DatePicker defaultValue={march} />);
    await userEvent.click(screen.getByRole('button', { name: 'Switch to text input mode' }));
    const field = screen.getByRole('group', { name: 'Date' });
    expect(within(field).getAllByRole('spinbutton')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: 'Switch to calendar input mode' }),
    ).toBeInTheDocument();
  });
});

describe('DateRangePicker', () => {
  it('selects a range with the days between on the band', async () => {
    function Demo() {
      const [range, setRange] = useState<DateRange | null>(null);
      return (
        <DateRangePicker
          value={range}
          onChange={setRange}
          defaultMode="calendar"
          minValue={new CalendarDate(2026, 3, 1)}
          maxValue={new CalendarDate(2026, 3, 31)}
        />
      );
    }
    render(<Demo />);
    expect(screen.getByText('Select dates')).toBeInTheDocument();
    // Days of other months are rendered (hidden), so skip those.
    const day = (n: number) =>
      screen.getAllByText(String(n)).find((el) => !el.hasAttribute('data-outside'))!;
    await userEvent.click(day(3));
    await userEvent.click(day(6));
    expect(screen.getByText('Mar 3 – Mar 6')).toHaveClass('text-title-large');
    expect(day(3).closest('td')).toHaveAttribute('data-range', 'start');
    expect(day(4).closest('td')).toHaveAttribute('data-range', 'middle');
    expect(day(4)).toHaveAttribute('data-in-range', 'true');
    expect(day(6).closest('td')).toHaveAttribute('data-range', 'end');
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
    expect(dialog).toHaveClass(
      'rounded-corner-extra-large',
      'bg-surface-container-high',
      'shadow-elevation-3',
    );
    const ok = within(dialog).getByRole('button', { name: 'OK' });
    expect(ok.parentElement).toHaveClass('gap-[8px]');
    expect(await axeViolations(baseElement)).toEqual([]);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
