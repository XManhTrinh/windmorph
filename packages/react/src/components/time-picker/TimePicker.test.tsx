import { Time } from '@internationalized/date';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { TimePicker } from './TimePicker';

describe('TimePicker', () => {
  it('shows hour and minute selectors, AM / PM and the dial', async () => {
    const { container } = render(
      <TimePicker defaultValue={new Time(14, 5)} hourCycle={12} data-testid="picker" />,
    );
    const hour = screen.getByRole('button', { name: 'Hour 2' });
    expect(hour).toHaveAttribute('aria-pressed', 'true');
    expect(hour).toHaveClass(
      'w-[96px]',
      'h-[80px]',
      'text-display-large',
      'data-selected:bg-primary-container',
    );
    expect(screen.getByRole('button', { name: 'Minute 05' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('radio', { name: 'PM' })).toBeChecked();
    const dial = screen.getByRole('slider', { name: 'Clock' });
    expect(dial).toHaveAttribute('aria-valuenow', '2');
    expect(dial).toHaveClass('size-[256px]', 'mt-[36px]');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('changes the hour and minute with the dial keys and switches AM / PM', async () => {
    const onChange = vi.fn();
    render(<TimePicker defaultValue={new Time(9, 30)} hourCycle={12} onChange={onChange} />);
    const dial = screen.getByRole('slider');
    fireEvent.keyDown(dial, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(new Time(10, 30));
    await userEvent.click(screen.getByRole('button', { name: /^Minute/ }));
    fireEvent.keyDown(dial, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith(new Time(10, 29));
    await userEvent.click(screen.getByRole('radio', { name: 'PM' }));
    expect(onChange).toHaveBeenLastCalledWith(new Time(22, 29));
  });

  it('uses two rings and wider selectors for a 24-hour clock', () => {
    render(<TimePicker defaultValue={new Time(18, 0)} hourCycle={24} />);
    expect(screen.getByRole('button', { name: 'Hour 18' })).toHaveClass('w-[114px]');
    expect(screen.queryByRole('radiogroup', { name: 'AM or PM' })).toBe(null);
    // Outer ring 00–11, inner ring 12–23.
    const dial = screen.getByRole('slider');
    expect(dial.querySelectorAll('text')).toHaveLength(24);
    expect([...dial.querySelectorAll('text')].map((t) => t.textContent)).toContain('23');
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
});
