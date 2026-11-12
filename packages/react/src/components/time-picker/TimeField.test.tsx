import { Time } from '@internationalized/date';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { I18nProvider } from 'react-aria';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { setMediaQueries } from '../../../test/setup';
import {
  LabelsProvider,
  Time as ExportedTime,
  TimeField,
  parseTime,
  type TimeFieldProps,
} from '../../index';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';

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

describe('TimeField, docked', () => {
  const list = () => screen.findByRole('listbox', { name: 'Select time' });
  const optionTexts = (listbox: HTMLElement) =>
    within(listbox)
      .getAllByRole('option')
      .map((option) => option.textContent);

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens a list of times under the field, every step within min and max', async () => {
    render(<Sample presentation="docked" step={60} min={new Time(9)} max={new Time(12)} />);
    expect(clock()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(clock()).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(clock());
    const listbox = await list();
    expect(optionTexts(listbox)).toEqual(['09:00', '10:00', '11:00', '12:00']);
    // The page behind the open list is hidden from assistive tech, as behind a Select's.
    const button = screen.getByRole('button', { name: 'Open time picker', hidden: true });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', listbox.id);
    expect(screen.queryByRole('dialog', { name: 'Select time' })).toBe(null);
  });

  it('writes the times on the field’s clock', async () => {
    render(<Sample presentation="docked" step={60} hourCycle={12} max={new Time(2)} />);
    await userEvent.click(clock());
    expect(optionTexts(await list())).toEqual(['12:00 am', '1:00 am', '2:00 am']);
  });

  it('lists the field’s time selected, also between two steps, and focuses it', async () => {
    render(<Sample presentation="docked" defaultValue={new Time(9, 40)} min={new Time(9)} />);
    await userEvent.click(clock());
    const listbox = await list();
    expect(optionTexts(listbox).slice(0, 4)).toEqual(['09:00', '09:30', '09:40', '10:00']);
    const chosen = within(listbox).getByRole('option', { name: '09:40' });
    expect(chosen).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(chosen).toHaveFocus());
  });

  it('with no time, focuses the one nearest now', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 10, 12, 14, 20) });
    render(<Sample presentation="docked" />);
    await userEvent.click(clock());
    const listbox = await list();
    await waitFor(() =>
      expect(within(listbox).getByRole('option', { name: '14:30' })).toHaveFocus(),
    );
    expect(within(listbox).queryByRole('option', { selected: true })).toBe(null);
  });

  it('commits a pressed time, closes, and returns focus to the field', async () => {
    const onChange = vi.fn();
    render(<Sample presentation="docked" defaultValue={new Time(9, 30)} onChange={onChange} />);
    await userEvent.click(clock());
    await userEvent.click(within(await list()).getByRole('option', { name: '11:00' }));
    expect(onChange.mock.calls[0]![0].toString()).toBe('11:00:00');
    expect(field()).toHaveValue('11:00');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null));
    await waitFor(() => expect(field()).toHaveFocus(), { timeout: 2000 });
  });

  it('picks with the keyboard, and closes on the time it already has', async () => {
    const onChange = vi.fn();
    render(<Sample presentation="docked" defaultValue={new Time(9, 30)} onChange={onChange} />);
    await userEvent.click(clock());
    const listbox = await list();
    await waitFor(() =>
      expect(within(listbox).getByRole('option', { name: '09:30' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange.mock.calls[0]![0].toString()).toBe('10:00:00');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null));

    await userEvent.click(clock());
    await waitFor(async () =>
      expect(within(await list()).getByRole('option', { name: '10:00' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('changes nothing on Escape', async () => {
    const onChange = vi.fn();
    render(<Sample presentation="docked" defaultValue={new Time(9, 30)} onChange={onChange} />);
    await userEvent.click(clock());
    const listbox = await list();
    await waitFor(() =>
      expect(within(listbox).getByRole('option', { name: '09:30' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBe(null));
    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('09:30');
  });

  it('still takes typed times, and follows them', async () => {
    render(<Sample presentation="docked" />);
    await userEvent.type(field(), '7h45');
    await userEvent.tab();
    expect(field()).toHaveValue('07:45');
    await userEvent.click(clock());
    const chosen = within(await list()).getByRole('option', { name: '07:45' });
    expect(chosen).toHaveAttribute('aria-selected', 'true');
  });

  it('opens the dialog on a compact window', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    render(<Sample presentation="docked" defaultValue={new Time(9, 30)} />);
    expect(clock()).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(clock());
    expect(await screen.findByRole('dialog', { name: 'Select time' })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).toBe(null);
  });

  it('puts its classes on the list and its times', async () => {
    render(
      <Sample presentation="docked" classNames={{ list: 'own-list', option: 'own-option' }} />,
    );
    await userEvent.click(clock());
    const listbox = await list();
    expect(listbox.closest('.own-list')).not.toBe(null);
    expect(within(listbox).getAllByRole('option')[0]).toHaveClass('own-option');
  });

  it('takes its name from the provider’s words', async () => {
    render(
      <LabelsProvider labels={{ TimeField: { title: 'Uhrzeit wählen' } }}>
        <Sample presentation="docked" />
      </LabelsProvider>,
    );
    await userEvent.click(clock());
    expect(await screen.findByRole('listbox', { name: 'Uhrzeit wählen' })).toBeInTheDocument();
  });

  it('has no axe violations open', async () => {
    const { baseElement } = render(<Sample presentation="docked" defaultValue={new Time(9)} />);
    await userEvent.click(clock());
    await list();
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});
