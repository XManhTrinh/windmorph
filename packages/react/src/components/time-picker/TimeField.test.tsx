import { Time } from '@internationalized/date';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { I18nProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Time as ExportedTime, TimeField, parseTime, type TimeFieldProps } from '../../index';

const field = () => screen.getByRole('textbox', { name: /Opens at/ });
const clock = () => screen.getByRole('button', { name: 'Open time picker' });

function Sample(props: Partial<TimeFieldProps>) {
  return (
    <I18nProvider locale="en-GB">
      <TimeField label="Opens at" {...props} />
      <button type="button">After</button>
    </I18nProvider>
  );
}

describe('TimeField', () => {
  it('exports what an app needs for a value', () => {
    expect(parseTime('09:30').hour).toBe(9);
    expect(new ExportedTime(9, 30)).toBeInstanceOf(Time);
  });

  it('commits forgiving text on blur and shows it normalized', async () => {
    const onChange = vi.fn();
    render(<Sample onChange={onChange} />);
    await userEvent.type(field(), '9h30');
    await userEvent.tab();
    expect(onChange.mock.calls[0]![0].toString()).toBe('09:30:00');
    expect(field()).toHaveValue('09:30');
  });

  it('commits on Enter', async () => {
    const onChange = vi.fn();
    render(<Sample onChange={onChange} />);
    await userEvent.type(field(), '2130{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(field()).toHaveValue('21:30');
  });

  it('shows an inline error for unreadable text and keeps the time', async () => {
    const onChange = vi.fn();
    render(<Sample defaultValue={new Time(9)} onChange={onChange} />);
    await userEvent.clear(field());
    await userEvent.type(field(), 'soon');
    await userEvent.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('soon');
    expect(field()).toBeInvalid();
    expect(screen.getByText('Enter a time such as HH:MM')).toBeInTheDocument();
  });

  it('refuses a time outside min and max', async () => {
    const onChange = vi.fn();
    render(<Sample min={new Time(9)} max={new Time(17)} onChange={onChange} />);
    await userEvent.type(field(), '18');
    await userEvent.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Time out of range')).toBeInTheDocument();
  });

  it('reports null when cleared', async () => {
    const onChange = vi.fn();
    render(<Sample defaultValue={new Time(9)} onChange={onChange} />);
    await userEvent.clear(field());
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('follows a controlled value from outside', async () => {
    function Controlled() {
      const [time, setTime] = useState<Time | null>(new Time(9));
      return (
        <>
          <Sample value={time} onChange={setTime} />
          <button type="button" onClick={() => setTime(new Time(15, 45))}>
            Later
          </button>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(field()).toHaveValue('15:45');
  });

  it('uses the hour cycle for the text and the keyboard', () => {
    const { rerender } = render(<Sample defaultValue={new Time(21, 30)} hourCycle={12} />);
    expect((field() as HTMLInputElement).value.replace(/\s/g, ' ').toUpperCase()).toBe('9:30 PM');
    expect(field()).toHaveAttribute('inputmode', 'text');
    rerender(<Sample defaultValue={new Time(21, 30)} hourCycle={24} />);
    expect(field()).toHaveValue('21:30');
    expect(field()).toHaveAttribute('inputmode', 'decimal');
  });

  it('opens the picker typed first; OK commits and focus returns to the field', async () => {
    const onChange = vi.fn();
    render(<Sample defaultValue={new Time(9, 30)} onChange={onChange} />);
    await userEvent.click(clock());
    const dialog = await screen.findByRole('dialog', { name: 'Select time' });
    const hour = dialog.querySelector('input')!;
    expect(hour).toHaveValue('09');
    await userEvent.clear(hour);
    await userEvent.type(hour, '11');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onChange.mock.calls[0]![0].toString()).toBe('11:30:00');
    await waitFor(() => expect(field()).toHaveFocus(), { timeout: 2000 });
  });

  it('discards the picker’s draft on Cancel', async () => {
    const onChange = vi.fn();
    render(<Sample defaultValue={new Time(9, 30)} onChange={onChange} />);
    await userEvent.click(clock());
    const dialog = await screen.findByRole('dialog');
    const hour = dialog.querySelector('input')!;
    await userEvent.clear(hour);
    await userEvent.type(hour, '11');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('09:30');
  });

  it('turns the clock off when disabled or read only', () => {
    const { rerender } = render(<Sample disabled />);
    expect(clock()).toBeDisabled();
    rerender(<Sample readOnly />);
    expect(clock()).toBeDisabled();
  });

  it('puts its classes and density on the root', () => {
    render(
      <Sample
        data-testid="root"
        className="own-root"
        density={-2}
        classNames={{ button: 'own-button', input: 'own-input' }}
      />,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('own-root');
    expect(clock()).toHaveClass('own-button');
    expect(field()).toHaveClass('own-input');
  });

  it('renders on the server', () => {
    expect(renderToString(<Sample defaultValue={new Time(9)} />)).toContain('09:00');
  });

  it('has no axe violations, valid or not', async () => {
    const { container } = render(<Sample invalid errorMessage="Pick a time" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
