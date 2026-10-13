import { Time } from '@internationalized/date';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { setMediaQueries } from '../../../test/setup';
import { TimePicker, TimePickerModeToggle, type TimePickerMode } from './TimePicker';

const SHORT = '(max-height: 567.98px)';
const NO_ROOM = '(max-height: 451.98px), (max-height: 567.98px) and (max-width: 639.98px)';

describe('TimePicker', () => {
  it('shows typeable selectors, AM / PM and a dial of number buttons', async () => {
    const { container } = render(
      <TimePicker defaultValue={new Time(14, 5)} hourCycle={12} data-testid="picker" />,
    );
    expect(screen.getByTestId('picker')).toHaveAttribute('data-layout', 'vertical');
    const hour = screen.getByRole('textbox', { name: 'Hour' });
    expect(hour).toHaveValue('2');
    expect(hour).toHaveAttribute('data-selected', 'true');
    expect(hour).toHaveClass('w-[96px]', 'h-[80px]', 'text-display-large');
    expect(screen.getByRole('textbox', { name: 'Minute' })).toHaveValue('05');
    expect(screen.getByRole('radio', { name: 'PM' })).toBeChecked();
    const dial = screen.getByRole('group', { name: 'Clock' });
    expect(dial).toHaveClass('size-[256px]', 'mt-[36px]');
    const numbers = within(dial).getAllByRole('button');
    expect(numbers).toHaveLength(12);
    const two = within(dial).getByRole('button', { name: '2 hours of 12' });
    expect(two).toHaveAttribute('aria-pressed', 'true');
    // Only the chosen number is a tab stop.
    expect(numbers.filter((n) => n.getAttribute('tabindex') === '0')).toEqual([two]);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('moves between numbers with arrows; Enter picks the hour and moves on to minutes', async () => {
    const onChange = vi.fn();
    render(<TimePicker defaultValue={new Time(9, 30)} hourCycle={12} onChange={onChange} />);
    const dial = screen.getByRole('group', { name: 'Clock' });
    within(dial).getByRole('button', { name: '9 hours of 12' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(within(dial).getByRole('button', { name: '10 hours of 12' })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(new Time(10, 30));
    expect(screen.getByRole('textbox', { name: 'Minute' })).toHaveAttribute(
      'data-selected',
      'true',
    );
    expect(within(dial).getByRole('button', { name: '30 minutes of 60' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ }');
    expect(onChange).toHaveBeenLastCalledWith(new Time(10, 25));
    await userEvent.click(screen.getByRole('radio', { name: 'PM' }));
    expect(onChange).toHaveBeenLastCalledWith(new Time(22, 25));
  });

  it('takes typed digits in the dial selectors', async () => {
    const onChange = vi.fn();
    render(<TimePicker defaultValue={new Time(9, 30)} hourCycle={12} onChange={onChange} />);
    const hour = screen.getByRole('textbox', { name: 'Hour' });
    await userEvent.click(hour);
    await userEvent.keyboard('11');
    expect(onChange).toHaveBeenLastCalledWith(new Time(11, 30));
    const minute = screen.getByRole('textbox', { name: 'Minute' });
    await userEvent.click(minute);
    expect(minute).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: '30 minutes of 60' })).toBeInTheDocument();
    fireEvent.keyDown(minute, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(new Time(11, 31));
  });

  it('uses two rings and wider selectors for a 24-hour dial, but 96px input fields', () => {
    const { rerender } = render(<TimePicker defaultValue={new Time(18, 0)} hourCycle={24} />);
    expect(screen.getByRole('textbox', { name: 'Hour' })).toHaveClass('w-[114px]');
    expect(screen.queryByRole('radiogroup', { name: 'AM or PM' })).toBe(null);
    // Outer ring 00–11, inner ring 12–23.
    const dial = screen.getByRole('group', { name: 'Clock' });
    expect(within(dial).getAllByRole('button')).toHaveLength(24);
    expect(within(dial).getByRole('button', { name: '18 hours of 24' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    rerender(<TimePicker defaultValue={new Time(18, 0)} hourCycle={24} mode="input" />);
    expect(screen.getByRole('textbox', { name: 'Hour' })).toHaveClass('w-[96px]', 'h-[72px]');
  });

  it('types the time in input mode', async () => {
    const onChange = vi.fn();
    render(
      <TimePicker defaultValue={new Time(9, 30)} hourCycle={12} mode="input" onChange={onChange} />,
    );
    const hour = screen.getByRole('textbox', { name: 'Hour' });
    expect(hour).toHaveClass('h-[72px]', 'text-display-medium');
    await userEvent.clear(hour);
    await userEvent.type(hour, '11');
    expect(onChange).toHaveBeenLastCalledWith(new Time(11, 30));
    const minute = screen.getByRole('textbox', { name: 'Minute' });
    fireEvent.keyDown(minute, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(new Time(11, 31));
  });

  it('turns horizontal on a short window and to input mode with no room for the dial', () => {
    function Demo() {
      const [mode, setMode] = useState<TimePickerMode>('dial');
      return (
        <>
          <TimePickerModeToggle mode={mode} onModeChange={setMode} />
          <TimePicker mode={mode} hourCycle={12} data-testid="picker" />
        </>
      );
    }
    render(<Demo />);
    const picker = screen.getByTestId('picker');
    act(() => setMediaQueries({ [SHORT]: true }));
    expect(picker).toHaveAttribute('data-layout', 'horizontal');
    expect(screen.getByRole('radiogroup', { name: 'AM or PM' })).toHaveClass(
      'w-[216px]',
      'min-h-[38px]',
    );
    expect(screen.getByRole('group', { name: 'Clock' })).toHaveClass('ms-[36px]');
    act(() => setMediaQueries({ [NO_ROOM]: true }));
    expect(picker).toHaveAttribute('data-mode', 'input');
    expect(screen.queryByRole('group', { name: 'Clock' })).toBe(null);
    expect(screen.queryByRole('button', { name: 'Toggle input picker' })).toBe(null);
  });

  it('toggles between the dial and the input with the keyboard and clock button', async () => {
    const onModeChange = vi.fn();
    function Demo() {
      const [mode, setMode] = useState<TimePickerMode>('dial');
      return (
        <>
          <TimePickerModeToggle
            mode={mode}
            onModeChange={(next) => {
              onModeChange(next);
              setMode(next);
            }}
          />
          <TimePicker mode={mode} hourCycle={12} />
        </>
      );
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle input picker' }));
    expect(onModeChange).toHaveBeenLastCalledWith('input');
    expect(screen.queryByRole('group', { name: 'Clock' })).toBe(null);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle dial picker' }));
    expect(screen.getByRole('group', { name: 'Clock' })).toBeInTheDocument();
  });
});
