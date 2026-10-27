import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { LIVE_REGION_DELAY } from '../../utils/announce';
import { IconButton } from '../icon-button/IconButton';
import { Button } from './Button';

const Icon = () => <svg viewBox="0 0 24 24" />;
const announcer = () => document.querySelector('[data-windmorph-announcer]');

describe('Button pending', () => {
  it('blocks presses, clicks and keys but keeps focus and the tab stop', async () => {
    const onPress = vi.fn();
    const onClick = vi.fn();
    render(
      <Button pending onPress={onPress} onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    await userEvent.keyboard('{Enter}[Space]');
    expect(onPress).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-pending');
    expect(button).not.toHaveAttribute('data-disabled');
    expect(button).not.toHaveAttribute('data-pressed');
    button.blur();
    await userEvent.tab();
    expect(button).toHaveFocus();
  });

  it('keeps focus on the button through a keyboard press that makes it pending', async () => {
    function Save() {
      const [pending, setPending] = useState(false);
      return (
        <Button pending={pending} onPress={() => setPending(!pending)}>
          Save
        </Button>
      );
    }
    render(<Save />);
    const button = screen.getByRole('button');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(button).toHaveAttribute('data-pending');
    expect(button).toHaveFocus();
  });

  it("doesn't submit its form again, by a click or Enter in a field", async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <input aria-label="Name" />
        <Button type="submit" pending>
          Save
        </Button>
      </form>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    await userEvent.type(screen.getByRole('textbox'), 'Sam{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <input aria-label="Name" />
        <Button type="submit" pending={false}>
          Save
        </Button>
      </form>,
    );
    expect(button).toHaveAttribute('type', 'submit');
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('keeps a link a link, with its navigation prevented', () => {
    const onPress = vi.fn();
    render(
      <Button href="/report" pending onPress={onPress}>
        Report
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Report, Loading' });
    expect(link).toHaveAttribute('href', '/report');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('adds labels.pending to every kind of name while pending only', () => {
    const { rerender } = render(
      <>
        <span id="title">Invoice</span>
        <Button pending>Save</Button>
        <Button pending aria-label="Send now">
          Send
        </Button>
        <Button pending aria-labelledby="title" labels={{ pending: 'Wird geladen' }}>
          Open
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Save, Loading' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send now, Loading' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invoice Wird geladen' })).toBeInTheDocument();
    rerender(
      <>
        <span id="title">Invoice</span>
        <Button pending={false}>Save</Button>
        <Button pending={false} aria-label="Send now">
          Send
        </Button>
        <Button pending={false} aria-labelledby="title">
          Open
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button', { name: 'Send now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invoice' })).toBeInTheDocument();
  });

  it('runs the suffix on from the label text, so browsers join it without a space', () => {
    render(
      <Button pending classNames={{ label: 'label' }}>
        Save
      </Button>,
    );
    const label = screen.getByRole('button').querySelector('.label')!;
    // A box after the label (a grid item, `sr-only`) reads "Save , Loading" in browsers.
    expect(label.textContent).toBe('Save, Loading');
    expect(label.lastElementChild).toHaveStyle({
      fontSize: '0px',
      lineHeight: '0',
      letterSpacing: '0px',
    });
  });

  it('shows the loading indicator over the hidden content once it has loaded', async () => {
    render(
      <Button pending classNames={{ pendingIndicator: 'custom-slot' }}>
        Save
      </Button>,
    );
    const slot = document.querySelector('[data-slot="pending-indicator"]')!;
    expect(slot).toHaveClass('custom-slot');
    expect(slot).toHaveAttribute('aria-hidden', 'true');
    await waitFor(() => expect(slot.querySelector('svg')).not.toBeNull());
    expect(slot.parentElement).toHaveAttribute('data-pending-shown');
    // The visible indicator isn't a second progress bar in the accessibility tree.
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders pendingIndicator in place of the default one', () => {
    render(
      <Button pending pendingIndicator={<span data-testid="mine" />}>
        Export
      </Button>,
    );
    const mine = screen.getByTestId('mine');
    expect(mine.closest('[data-slot="pending-indicator"]')).not.toBeNull();
    expect(mine.closest('[data-pending-shown]')).not.toBeNull();
  });

  it('stays natively disabled with the indicator when disabled too', () => {
    render(
      <Button pending disabled pendingIndicator={<span data-testid="mine" />}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(screen.getByTestId('mine')).toBeInTheDocument();
  });

  it('adds no pending markup to a button that never takes the prop', () => {
    render(<Button>Save</Button>);
    expect(document.querySelector('[data-slot="pending-indicator"]')).toBeNull();
  });

  it('has no toggle form', () => {
    // A toggle's state is its selection: it has no pending state.
    const toggleProps = { toggle: true, children: 'Star' } as const;
    // @ts-expect-error `pending` isn't a toggle prop.
    void (<Button {...toggleProps} pending />);
    // @ts-expect-error The same for icon buttons.
    void (<IconButton toggle pending icon={<Icon />} aria-label="Star" />);
  });

  it('server-renders the label with the pending state, and hydrates without warnings', async () => {
    const element = <Button pending>Save</Button>;
    const html = renderToString(element);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('data-pending="true"');
    expect(html).toContain('Loading');
    expect(html).not.toContain('data-pending-shown=');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await act(async () => {
      hydrateRoot(container, element);
    });
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
    container.remove();
  });

  it('has no axe violations pending, in every variant, disabled and as an icon button', async () => {
    const { container } = render(
      <>
        {(['filled', 'tonal', 'outlined', 'elevated', 'text'] as const).map((variant) => (
          <Button key={variant} variant={variant} pending>
            {variant}
          </Button>
        ))}
        <Button pending disabled>
          Disabled
        </Button>
        <IconButton pending icon={<Icon />} aria-label="Refresh" />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('IconButton pending', () => {
  it('names itself with the suffix but keeps its tooltip to the label', async () => {
    render(<IconButton pending icon={<Icon />} aria-label="Refresh" />);
    const button = screen.getByRole('button', { name: 'Refresh, Loading' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/^Refresh$/);
  });
});

describe('the pending announcement', () => {
  beforeEach(() => {
    announcer()?.remove();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  function Buttons({ pending }: { pending: boolean }) {
    return (
      <>
        <Button pending={pending}>Save</Button>
        <Button pending={pending}>Discard</Button>
      </>
    );
  }

  it('creates its region empty, before any message', () => {
    render(<Buttons pending={false} />);
    expect(announcer()).not.toBeNull();
    expect(announcer()).toHaveAttribute('aria-live', 'polite');
    expect(announcer()?.textContent).toBe('');
  });

  it('announces the focused button once as it turns pending, and nothing as it ends', () => {
    const { rerender } = render(<Buttons pending={false} />);
    act(() => vi.advanceTimersByTime(LIVE_REGION_DELAY));
    screen.getByRole('button', { name: 'Save' }).focus();
    rerender(<Buttons pending />);
    expect(announcer()?.textContent).toBe('Save, Loading');
    rerender(<Buttons pending={false} />);
    expect(announcer()?.textContent).toBe('Save, Loading');
  });

  it("doesn't announce an unfocused button", () => {
    const { rerender } = render(<Buttons pending={false} />);
    act(() => vi.advanceTimersByTime(LIVE_REGION_DELAY));
    rerender(<Buttons pending />);
    fireEvent.focus(document.body);
    expect(announcer()?.textContent).toBe('');
  });
});
