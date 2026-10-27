import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CSSProperties } from 'react';
import { axeViolations } from '../../../test/axe';
import { Button } from '../../components/button/Button';
import { IconButton } from '../../components/icon-button/IconButton';
import { ButtonContext, standardIconButtons } from '../../components/button/ButtonContext';
import { setMediaQueries } from '../../../test/setup';
import { ButtonGroup } from './ButtonGroup';
import { fitCount } from './use-overflow';

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
    const group = screen.getByRole('toolbar', { name: 'Actions' });
    expect(group).toHaveAttribute('data-size', 'md');
    expect(group).toHaveAttribute('data-variant', 'standard');
    // Medium standard groups space their buttons 8px apart.
    expect(group).toHaveClass(
      'inline-flex',
      'gap-(--m3-button-group-gap)',
      '[--m3-button-group-gap:8px]',
    );
    const copy = screen.getByRole('button', { name: 'Copy' });
    expect(copy).toHaveClass('h-[56px]');
    expect(copy).toHaveAttribute('data-variant', 'tonal');
    // A child's own prop wins.
    expect(screen.getByRole('button', { name: 'Paste' })).toHaveClass('min-h-[32px]');
    // Icon buttons share the size and the variant, so the group never mixes styles.
    const more = screen.getByRole('button', { name: 'More' });
    expect(more).toHaveClass('[--m3-icon-button-height:calc(56px+var(--md-sys-density,0)*4px)]');
    expect(more).toHaveAttribute('data-variant', 'tonal');
  });

  it('passes buttonVariant to icon buttons only where they have it, and their own variant wins', () => {
    render(
      <>
        <ButtonGroup aria-label="Outlined" buttonVariant="outlined">
          <IconButton icon={<Icon />} aria-label="Shared" />
          <IconButton variant="filled" icon={<Icon />} aria-label="Own" />
        </ButtonGroup>
        <ButtonGroup aria-label="Elevated" buttonVariant="elevated">
          <Button>Copy</Button>
          <IconButton icon={<Icon />} aria-label="Default" />
        </ButtonGroup>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Shared' })).toHaveAttribute(
      'data-variant',
      'outlined',
    );
    expect(screen.getByRole('button', { name: 'Own' })).toHaveAttribute('data-variant', 'filled');
    // Icon buttons have no elevated style: they keep the filled default.
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute(
      'data-variant',
      'filled',
    );
  });

  it('warns once about standard icon buttons, text buttons and connected groups without toggles', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <ButtonGroup aria-label="Actions">
        <IconButton variant="standard" icon={<Icon />} aria-label="Search" />
      </ButtonGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenLastCalledWith(expect.stringContaining('standard icon buttons'));
    rerender(
      <ButtonGroup aria-label="Actions">
        <IconButton variant="standard" icon={<Icon />} aria-label="Search" />
        <Button>Copy</Button>
      </ButtonGroup>,
    );
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockClear();
    render(
      <ButtonGroup aria-label="Text" buttonVariant="text">
        <Button>Copy</Button>
      </ButtonGroup>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('text buttons'));

    warn.mockClear();
    render(
      <ButtonGroup variant="connected" aria-label="View">
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('toggle buttons'));

    // A toolbar's standard default and connected toggles don't warn.
    warn.mockClear();
    render(
      <ButtonContext value={standardIconButtons}>
        <ButtonGroup aria-label="Format">
          <IconButton icon={<Icon />} aria-label="Bold" />
        </ButtonGroup>
        <ButtonGroup variant="connected" aria-label="Align">
          <Button toggle>Left</Button>
          <Button toggle>Right</Button>
        </ButtonGroup>
      </ButtonContext>,
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it.each([
    // 18 / 12px at density 0, growing with density so 48px targets never overlap.
    [
      'xs',
      '[--m3-button-group-gap:max(18px,calc(48px-max(24px,calc(32px+var(--md-sys-density,0)*4px))))]',
    ],
    ['sm', '[--m3-button-group-gap:max(12px,calc(8px-var(--md-sys-density,0)*4px))]'],
    ['md', '[--m3-button-group-gap:8px]'],
    ['lg', 'gap-[8px]'],
    ['xl', 'gap-[8px]'],
  ] as const)('spaces a standard %s group %s apart', (size, gap) => {
    render(
      <ButtonGroup aria-label="Actions" size={size}>
        <Button>Copy</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('toolbar')).toHaveClass(gap);
  });

  // Narrow icon buttons: the gap is max(spec, 48px − the narrow width), so their 48px
  // targets never overlap (2026-10-17); the browser measures it in e2e/button-group.spec.ts.
  it.each([
    ['xs', 'max(18px,calc(48px-max(24px,calc(28px+var(--md-sys-density,0)*4px))))'],
    ['sm', 'max(12px,calc(48px-max(28px,calc(32px+var(--md-sys-density,0)*4px))))'],
    ['md', 'max(8px,calc(var(--md-sys-density,0)*-4px))'],
  ] as const)('spaces a standard %s group by its narrow icon buttons', (size, gap) => {
    render(
      <ButtonGroup aria-label="Actions" size={size}>
        <IconButton icon={<Icon />} aria-label="Bold" width="narrow" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('data-width', 'narrow');
    expect(screen.getByRole('toolbar')).toHaveClass(
      `has-[[data-tokens~=md-comp-icon-button][data-width=narrow]]:[--m3-button-group-gap:${gap}]`,
    );
  });

  it('moves focus with the arrow keys without a selection mode, mirrored in RTL', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ButtonGroup aria-label="Actions">
        <Button>Copy</Button>
        <Button>Paste</Button>
      </ButtonGroup>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Paste' })).toHaveFocus();
    // Tab leaves the group instead of visiting every button.
    await user.tab();
    expect(document.body).toHaveFocus();

    rerender(
      <div dir="rtl">
        <ButtonGroup aria-label="Actions" key="rtl">
          <Button>Copy</Button>
          <Button>Paste</Button>
        </ButtonGroup>
      </div>,
    );
    screen.getByRole('button', { name: 'Copy' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Paste' })).toHaveFocus();
  });

  it('gives connected buttons their position corners', () => {
    render(
      <ButtonGroup variant="connected" aria-label="Align">
        <Button>Left</Button>
        <Button>Centre</Button>
        <IconButton icon={<Icon />} aria-label="Right" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('toolbar')).toHaveClass('gap-[2px]');
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

  it.each([
    ['xs', 'corner-extra-small', 16],
    ['sm', 'corner-small', 20],
    ['md', 'corner-small', 28],
    ['lg', 'corner-large', 48],
    ['xl', 'corner-large-increased', 68],
  ] as const)('gives %s connected buttons %s inner corners', (size, inner, full) => {
    render(
      <ButtonGroup variant="connected" size={size} aria-label="Align">
        <Button>Left</Button>
        <Button>Centre</Button>
        <IconButton icon={<Icon />} aria-label="Right" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Left' })).toHaveClass(
      `rounded-s-[min(var(--md-sys-shape-corner-full),${full}px)]`,
      `rounded-e-${inner}`,
    );
    expect(screen.getByRole('button', { name: 'Centre' })).toHaveClass(`rounded-${inner}`);
    expect(screen.getByRole('button', { name: 'Right' })).toHaveClass(`rounded-s-${inner}`);
  });

  it('presses XS connected inner corners to 2px, below their 4px rest corners', () => {
    render(
      <ButtonGroup variant="connected" size="xs" aria-label="View">
        <Button toggle>Day</Button>
        <Button toggle>Week</Button>
        <Button toggle>Month</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Day' })).toHaveClass(
      'rounded-e-corner-extra-small',
      'data-pressed:rounded-e-[2px]',
    );
    expect(screen.getByRole('button', { name: 'Week' })).toHaveClass('data-pressed:rounded-[2px]');
    expect(screen.getByRole('button', { name: 'Month' })).toHaveClass(
      'data-pressed:rounded-s-[2px]',
    );
  });

  it('gives a square connected group outer corners the size of its inner ones', () => {
    render(
      <ButtonGroup variant="connected" shape="square" size="lg" aria-label="Align">
        <Button>Left</Button>
        <IconButton icon={<Icon />} aria-label="Right" />
      </ButtonGroup>,
    );
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveClass('rounded-corner-large');
      expect(button).not.toHaveClass('rounded-e-[min(var(--md-sys-shape-corner-full),48px)]');
    }
  });

  it('spans its container in the connected variant, and a consumer can narrow it', () => {
    const { rerender } = render(
      <ButtonGroup variant="connected" aria-label="View">
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
    );
    // Equal columns (Compose's weight(1f)): a definite width is shared equally, and a group
    // sized by its content gives each the widest one's width; `auto-cols-auto` sizes them by
    // content. While the press bump pins widths, it's a flex row.
    expect(screen.getByRole('toolbar')).toHaveClass(
      'grid',
      'w-full',
      'grid-flow-col',
      'auto-cols-[1fr]',
      'data-pinned:flex',
    );
    rerender(
      <ButtonGroup variant="connected" aria-label="View" className="w-fit">
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('toolbar')).toHaveClass('w-fit');
    expect(screen.getByRole('toolbar')).not.toHaveClass('w-full');
  });

  it('keeps XS and S connected icon buttons at least 48px wide', () => {
    render(
      <ButtonGroup variant="connected" size="xs" aria-label="Format">
        <IconButton icon={<Icon />} aria-label="Bold" />
        <IconButton icon={<Icon />} aria-label="Italic" />
      </ButtonGroup>,
    );
    for (const button of screen.getAllByRole('button')) expect(button).toHaveClass('min-w-[48px]');
  });

  it('lets connected icon buttons stretch, their width a minimum', () => {
    render(
      <ButtonGroup variant="connected" size="md" aria-label="Format">
        <IconButton icon={<Icon />} aria-label="Bold" />
        <IconButton width="wide" icon={<Icon />} aria-label="Italic" />
      </ButtonGroup>,
    );
    const [bold, italic] = screen.getAllByRole('button');
    expect(bold).toHaveClass('w-auto', 'min-w-[56px]');
    expect(bold).not.toHaveClass('w-[56px]');
    expect(italic).toHaveClass('w-auto', 'min-w-[72px]');
  });

  it('leaves a single connected button with its normal shape', () => {
    render(
      <ButtonGroup variant="connected" aria-label="One">
        <Button>Only</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button')).toHaveClass(
      'rounded-[var(--_md-comp-button-container-shape-round-capped)]',
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
    const group = screen.getByRole('toolbar');
    expect(group).toHaveClass('flex', 'w-full', 'gap-1');
    expect(group).not.toHaveClass('inline-flex', 'gap-(--m3-button-group-gap)');
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
        deselectable={false}
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

  it('is an APG radio group in single mode: arrows select and wrap, Tab enters at the selection', async () => {
    const onSelectionChange = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <ViewGroup defaultSelectedKeys={['week']} onSelectionChange={onSelectionChange} />
      </>,
    );
    const radio = (name: string) => screen.getByRole('radio', { name });
    await userEvent.tab();
    await userEvent.tab();
    expect(radio('Week')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(radio('Month')).toHaveFocus();
    expect(radio('Month')).toHaveAttribute('aria-checked', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['month']));
    await userEvent.keyboard('{ArrowDown}');
    expect(radio('Day')).toHaveFocus();
    expect(radio('Day')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowUp}');
    expect(radio('Month')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Home}');
    expect(radio('Day')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    expect(radio('Month')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Week')).toHaveAttribute('aria-checked', 'false');
  });

  // 2026-10-15: focus arriving from a press went to the checked radio, scrolling the page
  // to it while the pressed one was selected.
  it('keeps focus on the radio a press lands on, not the checked one', async () => {
    render(
      <>
        <button type="button">Before</button>
        <ViewGroup defaultSelectedKeys={['week']} />
      </>,
    );
    const day = screen.getByRole('radio', { name: 'Day' });
    await userEvent.click(day);
    expect(day).toHaveFocus();
    expect(day).toHaveAttribute('aria-checked', 'true');
    // Tab still enters at the selection.
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(day).toHaveFocus();
  });

  it('wraps a toolbar group’s arrows and reaches its ends with Home and End, without selecting', async () => {
    render(
      <ButtonGroup selectionMode="multiple" aria-label="Format">
        <Button toggle value="bold">
          Bold
        </Button>
        <Button toggle value="italic">
          Italic
        </Button>
        <Button toggle value="underline">
          Underline
        </Button>
      </ButtonGroup>,
    );
    const button = (name: string) => screen.getByRole('button', { name });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    expect(button('Underline')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(button('Bold')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(button('Underline')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(button('Bold')).toHaveFocus();
    expect(button('Bold')).toHaveAttribute('aria-pressed', 'false');
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

  it('keeps its inline sizing until the release settles, with the spring time in seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // A minified stylesheet writes the 360ms token as `.36s`.
    const spring = { '--md-sys-motion-spring-spatial-fast-duration': '.36s' } as CSSProperties;
    render(
      <ButtonGroup aria-label="Actions">
        <Button style={spring}>One</Button>
        <Button style={spring}>Two</Button>
      </ButtonGroup>,
    );
    const [one] = screen.getAllByRole('button') as [HTMLElement];
    stubWidths(screen.getAllByRole('button'), 100, 60);

    await user.pointer({ keys: '[MouseLeft>]', target: one });
    await user.pointer({ keys: '[/MouseLeft]', target: one });
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(one.style.flexBasis).toBe('100px');
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(one.style.flex).toBe('');
    vi.useRealTimers();
  });

  it('waits for a release that started late to end before removing its inline sizing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ButtonGroup aria-label="Actions">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    const [one, two] = screen.getAllByRole('button') as [HTMLElement, HTMLElement];
    stubWidths([one, two], 100, 60);

    await user.pointer({ keys: '[MouseLeft>]', target: one });
    await user.pointer({ keys: '[/MouseLeft]', target: one });
    // The release's transition still runs once the spring's time has passed.
    class CSSTransitionStub {
      transitionProperty = 'flex-basis';
      playState = 'running';
      finished: Promise<void>;
      end!: () => void;
      constructor() {
        this.finished = new Promise((resolve) => (this.end = resolve));
      }
      finish() {}
    }
    const globals = globalThis as { CSSTransition?: unknown };
    const original = globals.CSSTransition;
    globals.CSSTransition = CSSTransitionStub;
    const late = new CSSTransitionStub();
    one.getAnimations = () => [late as unknown as Animation];
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(one.style.flexBasis).toBe('100px');
    await act(async () => late.end());
    expect(one.style.flex).toBe('');
    globals.CSSTransition = original;
    vi.useRealTimers();
  });

  it('by default never widens a pressed button in a connected group (only its shape changes)', async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup variant="connected" aria-label="View">
        <Button>Day</Button>
        <Button>Week</Button>
        <Button>Month</Button>
      </ButtonGroup>,
    );
    const buttons = screen.getAllByRole('button');
    stubWidths(buttons, 100, 60);
    await user.pointer({ keys: '[MouseLeft>]', target: buttons[1]! });
    for (const button of buttons) expect(button.style.flexBasis).toBe('');
    await user.pointer({ keys: '[/MouseLeft]', target: buttons[1]! });
  });

  it('opts a connected group into the press bump with expandedRatio', async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup variant="connected" expandedRatio={0.15} aria-label="View">
        <Button>Day</Button>
        <Button>Week</Button>
        <Button>Month</Button>
      </ButtonGroup>,
    );
    const buttons = screen.getAllByRole('button');
    stubWidths(buttons, 100, 60);
    await user.pointer({ keys: '[MouseLeft>]', target: buttons[0]! });
    expect(buttons[0]!.style.flexBasis).toBe('115px');
    expect(buttons[1]!.style.flexBasis).toBe('85px');
    // Pinned at rest, so the group's width can't change under it.
    expect(buttons[2]!.style.flexBasis).toBe('100px');
    await user.pointer({ keys: '[/MouseLeft]', target: buttons[0]! });
  });

  it('stays still under reduced motion', async () => {
    setMediaQueries({ '(prefers-reduced-motion: reduce)': true });
    const user = userEvent.setup();
    render(<Three />);
    const buttons = screen.getAllByRole('button');
    stubWidths(buttons, 100, 60);
    await user.pointer({ keys: '[MouseLeft>]', target: buttons[1]! });
    expect(buttons[1]).toHaveAttribute('data-pressed');
    for (const button of buttons) expect(button.style.flexBasis).toBe('');
    await user.pointer({ keys: '[/MouseLeft]', target: buttons[1]! });
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

describe('ButtonGroup overflow', () => {
  it('fits as many buttons as there is room for, leaving room for the indicator', () => {
    expect(fitCount([80, 80, 80], 8, 40, 300)).toBe(3);
    expect(fitCount([80, 80, 80], 8, 40, 255)).toBe(2);
    expect(fitCount([80, 80, 80], 8, 40, 100)).toBe(0);
  });

  /** jsdom has no layout: a 200px group, 80px buttons and a 40px indicator, no gap. */
  function stubLayout() {
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const label = this.getAttribute('aria-label');
        return { width: label === 'More options' ? 40 : 80 } as DOMRect;
      });
    return () => {
      width.mockRestore();
      rect.mockRestore();
    };
  }

  it('folds the trailing buttons into a menu that presses them', async () => {
    const restore = stubLayout();
    const user = userEvent.setup();
    const onArchive = vi.fn();
    render(
      <ButtonGroup
        aria-label="Actions"
        overflow
        classNames={{ root: 'root-x', overflowButton: 'more-x', overflowMenu: 'menu-x' }}
      >
        <Button>Reply</Button>
        <Button>Forward</Button>
        <Button leadingIcon={<Icon />} onPress={onArchive}>
          Archive
        </Button>
        <Button disabled>Delete</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('toolbar');
    expect(group).toHaveClass('w-full', 'min-w-0', 'root-x');
    // 80 + 80 + 40 fits 200px; Archive and Delete are folded.
    expect(screen.getByRole('button', { name: 'Archive', hidden: true })).toHaveAttribute(
      'data-overflow-hidden',
    );
    expect(screen.getByRole('button', { name: 'Forward' })).not.toHaveAttribute(
      'data-overflow-hidden',
    );
    const more = screen.getByRole('button', { name: 'More options' });
    expect(more).not.toHaveAttribute('data-overflow-hidden');
    expect(more).toHaveClass('more-x');

    await user.click(more);
    // The menu's code loads once a button folds; it may still be on its way.
    const items = await screen.findAllByRole('menuitem');
    expect(screen.getByRole('menu')).toHaveClass('menu-x');
    expect(items.map((item) => item.textContent)).toEqual(['Archive', 'Delete']);
    expect(items[1]).toHaveAttribute('aria-disabled', 'true');
    await user.click(items[0]!);
    expect(onArchive).toHaveBeenCalledTimes(1);
    restore();
  });

  it('shows every button and no indicator when they fit, with its own label', () => {
    const restore = stubLayout();
    render(
      <ButtonGroup aria-label="Actions" overflow labels={{ more: 'More actions' }}>
        <Button>Reply</Button>
        <Button>Forward</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Forward' })).not.toHaveAttribute(
      'data-overflow-hidden',
    );
    expect(screen.getByRole('button', { name: 'More actions', hidden: true })).toHaveAttribute(
      'data-overflow-hidden',
    );
    restore();
  });

  it('makes only folded toggles checkable; actions stay plain menu items', async () => {
    const restore = stubLayout();
    const user = userEvent.setup();
    const onArchive = vi.fn();
    render(
      <ButtonGroup aria-label="Actions" overflow>
        <Button>Reply</Button>
        <Button>Forward</Button>
        <Button onPress={onArchive}>Archive</Button>
        <Button toggle defaultSelected>
          Pin
        </Button>
        <Button>Delete</Button>
      </ButtonGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'More options' }));
    const pin = await screen.findByRole('menuitemcheckbox', { name: 'Pin' });
    expect(pin).toHaveAttribute('aria-checked', 'true');
    const actions = screen.getAllByRole('menuitem');
    expect(actions.map((item) => item.textContent)).toEqual(['Archive', 'Delete']);
    for (const action of actions) {
      expect(action).not.toHaveAttribute('aria-checked');
      expect(action).not.toHaveAttribute('data-selected');
    }

    // The toggle stays open and flips its button; an action runs and closes the menu.
    await user.click(pin);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('menuitemcheckbox', { name: 'Pin' })).toHaveAttribute(
        'aria-checked',
        'false',
      ),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(onArchive).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    restore();
  });

  it('reflects a selection group in the menu, gives the indicator the trailing corners', async () => {
    const restore = stubLayout();
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ButtonGroup
        variant="connected"
        aria-label="View"
        overflow
        selectionMode="single"
        defaultSelectedKeys={['month']}
        onSelectionChange={onSelectionChange}
      >
        <Button toggle value="day">
          Day
        </Button>
        <Button toggle value="week">
          Week
        </Button>
        <Button toggle value="month">
          Month
        </Button>
        <Button toggle value="year">
          Year
        </Button>
      </ButtonGroup>,
    );
    const more = screen.getByRole('button', { name: 'More options' });
    expect(more).toHaveClass('rounded-e-[min(var(--md-sys-shape-corner-full),20px)]');
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveClass('rounded-corner-small');

    await user.click(more);
    const month = await screen.findByRole('menuitemradio', { name: 'Month' });
    expect(month).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: 'Year' }));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['year']));
    restore();
  });
});
