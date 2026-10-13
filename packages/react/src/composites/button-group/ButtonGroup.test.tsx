import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Button } from '../../components/button/Button';
import { IconButton } from '../../components/icon-button/IconButton';
import { ButtonGroup } from './ButtonGroup';

const Icon = () => <svg viewBox="0 0 24 24" />;

/** jsdom has no layout: give each button a width and its content a width. */
function stubWidths(buttons: HTMLElement[], width: number, content: number) {
  for (const button of buttons) {
    button.getBoundingClientRect = () => ({ width }) as DOMRect;
    (button.firstElementChild as HTMLElement).getBoundingClientRect = () =>
      ({ width: content }) as DOMRect;
  }
}

describe('ButtonGroup', () => {
  it('renders a labelled group and shares size and variant with its buttons', () => {
    render(
      <ButtonGroup aria-label="Actions" size="md" buttonVariant="tonal">
        <Button>Copy</Button>
        <Button size="xs">Paste</Button>
        <IconButton icon={<Icon />} aria-label="More" />
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Actions' });
    expect(group).toHaveClass('inline-flex', 'gap-[12px]');
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveClass(
      'h-[56px]',
      'bg-secondary-container',
    );
    // A child's own prop wins.
    expect(screen.getByRole('button', { name: 'Paste' })).toHaveClass('h-[32px]');
    // Icon buttons share the size but keep their own variant.
    expect(screen.getByRole('button', { name: 'More' })).toHaveClass('h-[56px]', 'bg-transparent');
  });

  it('gives connected buttons their position corners', () => {
    render(
      <ButtonGroup variant="connected" aria-label="Align">
        <Button>Left</Button>
        <Button>Centre</Button>
        <IconButton icon={<Icon />} aria-label="Right" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('group')).toHaveClass('gap-[2px]');
    const leading = screen.getByRole('button', { name: 'Left' });
    expect(leading).toHaveClass(
      'rounded-s-[min(var(--md-sys-shape-corner-full),20px)]',
      'rounded-e-corner-small',
      'data-pressed:rounded-e-corner-extra-small',
    );
    expect(leading).not.toHaveClass('data-pressed:rounded-corner-small');
    expect(screen.getByRole('button', { name: 'Centre' })).toHaveClass(
      'rounded-corner-small',
      'data-pressed:rounded-corner-extra-small',
    );
    expect(screen.getByRole('button', { name: 'Right' })).toHaveClass(
      'rounded-e-[min(var(--md-sys-shape-corner-full),20px)]',
      'rounded-s-corner-small',
    );
  });

  it('leaves a single connected button with its normal shape', () => {
    render(
      <ButtonGroup variant="connected" aria-label="One">
        <Button>Only</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button')).toHaveClass(
      'rounded-[min(var(--md-sys-shape-corner-full),20px)]',
    );
  });

  it('disables every button', () => {
    render(
      <ButtonGroup disabled aria-label="Actions">
        <Button>Copy</Button>
        <IconButton icon={<Icon />} aria-label="More" />
      </ButtonGroup>,
    );
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });

  it('lets consumer classes win on the group', () => {
    render(
      <ButtonGroup aria-label="Actions" className="flex w-full gap-1">
        <Button>Copy</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveClass('flex', 'w-full', 'gap-1');
    expect(group).not.toHaveClass('inline-flex', 'gap-[12px]');
  });
});

describe('ButtonGroup selection', () => {
  const ViewGroup = (props: Partial<React.ComponentProps<typeof ButtonGroup>>) => (
    <ButtonGroup variant="connected" selectionMode="single" aria-label="View" {...props}>
      <Button toggle value="day">
        Day
      </Button>
      <Button toggle value="week">
        Week
      </Button>
      <Button toggle value="month">
        Month
      </Button>
    </ButtonGroup>
  );

  it('selects one button at a time in single mode', async () => {
    const onSelectionChange = vi.fn();
    render(<ViewGroup defaultSelectedKeys={['week']} onSelectionChange={onSelectionChange} />);
    const week = screen.getByRole('radio', { name: 'Week' });
    const day = screen.getByRole('radio', { name: 'Day' });
    expect(week).toHaveAttribute('aria-checked', 'true');
    expect(week).toHaveAttribute('data-selected');

    await userEvent.click(day);
    expect(day).toHaveAttribute('aria-checked', 'true');
    expect(week).toHaveAttribute('aria-checked', 'false');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['day']));
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
  });

  it('selects several buttons in multiple mode', async () => {
    render(
      <ButtonGroup selectionMode="multiple" aria-label="Format">
        <Button toggle value="bold">
          Bold
        </Button>
        <Button toggle value="italic">
          Italic
        </Button>
      </ButtonGroup>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
    await userEvent.click(screen.getByRole('button', { name: 'Italic' }));
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('can be controlled and can disallow an empty selection', async () => {
    const onSelectionChange = vi.fn();
    render(
      <ViewGroup
        selectedKeys={['day']}
        onSelectionChange={onSelectionChange}
        disallowEmptySelection
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Day' }));
    expect(onSelectionChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('radio', { name: 'Month' }));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['month']));
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves focus with the arrow keys', async () => {
    render(<ViewGroup />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveFocus();
  });

  it('warns when a grouped toggle also sets its own selection', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ButtonGroup selectionMode="single" aria-label="View">
        <Button toggle value="day" selected>
          Day
        </Button>
      </ButtonGroup>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('selectedKeys'));
    warn.mockRestore();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <ViewGroup defaultSelectedKeys={['day']} />
        <ButtonGroup aria-label="Actions">
          <Button>Copy</Button>
          <IconButton icon={<Icon />} aria-label="More" />
        </ButtonGroup>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('ButtonGroup press expansion', () => {
  const Three = () => (
    <ButtonGroup aria-label="Actions">
      <Button>One</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </ButtonGroup>
  );

  it('grows a middle button by 15% of its width, split across both neighbours', async () => {
    const user = userEvent.setup();
    render(<Three />);
    const [one, two, three] = screen.getAllByRole('button') as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    stubWidths([one, two, three], 100, 60); // compression limit (100 - 60) / 2 = 20px

    await user.pointer({ keys: '[MouseLeft>]', target: two });
    expect(two.style.flexBasis).toBe('115px');
    expect(one.style.flexBasis).toBe('92.5px');
    expect(three.style.flexBasis).toBe('92.5px');

    await user.pointer({ keys: '[/MouseLeft]', target: two });
    expect(two.style.flexBasis).toBe('100px');
    expect(one.style.flexBasis).toBe('100px');
  });

  it('grows an end button by 15% of its width from its one neighbour, within its limit', async () => {
    const user = userEvent.setup();
    render(<Three />);
    const [one, two] = screen.getAllByRole('button') as [HTMLElement, HTMLElement];
    stubWidths(screen.getAllByRole('button'), 200, 180); // limit (200 - 180) / 2 = 10px < 30px

    await user.pointer({ keys: '[MouseLeft>]', target: one });
    expect(one.style.flexBasis).toBe('210px');
    expect(two.style.flexBasis).toBe('190px');
    await user.pointer({ keys: '[/MouseLeft]', target: one });
  });

  it('removes its inline sizing once the release settles, restoring the consumer flex', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ButtonGroup aria-label="Actions">
        <Button style={{ flex: '1 1 0%' }}>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    const [one, two] = screen.getAllByRole('button') as [HTMLElement, HTMLElement];
    stubWidths([one, two], 100, 60);

    await user.pointer({ keys: '[MouseLeft>]', target: one });
    expect(one.style.flexGrow).toBe('0');
    expect(two.style.minWidth).toBe('0px');
    await user.pointer({ keys: '[/MouseLeft]', target: one });
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(one.style.flex).toBe('1 1 0%');
    expect(two.style.flex).toBe('');
    expect(two.style.minWidth).toBe('');
    vi.useRealTimers();
  });

  it('can be turned off', async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup aria-label="Actions" expandedRatio={0}>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    const [one] = screen.getAllByRole('button') as [HTMLElement];
    await user.pointer({ keys: '[MouseLeft>]', target: one });
    expect(one.style.flexBasis).toBe('');
    await user.pointer({ keys: '[/MouseLeft]', target: one });
  });
});
