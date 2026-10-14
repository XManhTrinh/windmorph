import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { RangeSlider, Slider } from './Slider';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('Slider', () => {
  it('renders a named slider with an XS track, handle and stop indicator', async () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={30} data-testid="slider" className="w-64" />,
    );
    const input = screen.getByRole('slider', { name: 'Volume' });
    expect(input).toHaveValue('30');
    const root = screen.getByTestId('slider');
    expect(root).toHaveClass('w-64', '[--m3-slider-track:16px]', '[--m3-slider-handle:44px]');
    expect(root).toHaveAttribute('data-tokens', 'md-comp-slider');
    expect(root).toHaveAttribute('data-size', 'xs');
    const segments = root.querySelectorAll('[data-tone]');
    expect([...segments].map((s) => s.getAttribute('data-tone'))).toEqual(['active', 'inactive']);
    expect(segments[0]).toHaveClass(
      'data-[tone=active]:bg-[var(--_md-comp-slider-active-track-color)]',
    );
    expect(segments[0]).toHaveAttribute('data-slot', 'active-track');
    expect(segments[1]).toHaveAttribute('data-slot', 'inactive-track');
    expect(root.querySelector('[data-slot="handle"]')).toHaveClass(
      'bg-[var(--_md-comp-slider-handle-color)]',
    );
    expect((segments[0] as HTMLElement).style.marginInlineStart).toBe('0px');
    // The inactive segment holds the end stop indicator.
    expect(segments[1]!.querySelector('.size-\\[4px\\]')).not.toBe(null);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each([
    ['sm', '24px', '44px'],
    ['md', '40px', '52px'],
    ['lg', '56px', '68px'],
    ['xl', '96px', '108px'],
  ] as const)('sizes %s from the M3 tokens', (size, track, handle) => {
    render(<Slider aria-label="Volume" size={size} data-testid="slider" />);
    expect(screen.getByTestId('slider')).toHaveClass(
      `[--m3-slider-track:${track}]`,
      `[--m3-slider-handle:${handle}]`,
    );
  });

  it('adjusts with the keyboard and reports changes', async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        step={10}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    await userEvent.tab();
    const input = screen.getByRole('slider');
    expect(input).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(60);
    expect(onChangeEnd).toHaveBeenLastCalledWith(60);
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
    // Focus narrows the handle and widens the thumb gap.
    const thumb = input.closest('[data-thumb]')!;
    expect(thumb).toHaveAttribute('data-focus-visible', 'true');
    expect(thumb.querySelector('[data-active]')).not.toBe(null);
  });

  it('shows the value indicator while keyboard-focused', async () => {
    render(<Slider aria-label="Brightness" defaultValue={42} showValueLabel />);
    expect(screen.queryByText('42')).toBe(null);
    await userEvent.tab();
    expect(screen.getByText('42')).toHaveClass(
      'bg-[var(--_md-comp-slider-value-indicator-container-color)]',
      'text-[color:var(--_md-comp-slider-value-indicator-label-label-text-color)]',
      'text-label-large',
    );
  });

  it('lets consumer value indicator classes replace the token classes', async () => {
    render(
      <Slider
        aria-label="Brightness"
        defaultValue={42}
        showValueLabel
        classNames={{ label: 'bg-tertiary text-on-tertiary' }}
      />,
    );
    await userEvent.tab();
    const label = screen.getByText('42');
    expect(label).toHaveClass('bg-tertiary', 'text-on-tertiary', 'text-label-large');
    expect(label).not.toHaveClass(
      'bg-[var(--_md-comp-slider-value-indicator-container-color)]',
      'text-[color:var(--_md-comp-slider-value-indicator-label-label-text-color)]',
    );
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('marks size %s on the root', (size) => {
    render(<Slider aria-label="Volume" size={size} data-testid="slider" />);
    expect(screen.getByTestId('slider')).toHaveAttribute('data-size', size);
  });

  it('draws ticks for discrete sliders and centred tracks', () => {
    const { rerender } = render(
      <Slider aria-label="Rating" step={25} ticks defaultValue={50} data-testid="slider" />,
    );
    const root = screen.getByTestId('slider');
    // 0 and 25 (active), 75 (inactive); 50 is under the thumb, 100 is the stop indicator.
    const ticks = [...root.querySelectorAll('.col-start-1.size-\\[4px\\]')];
    expect(ticks.map((t) => t.hasAttribute('data-active'))).toEqual([true, true, false]);
    rerender(<Slider aria-label="Balance" centered defaultValue={70} data-testid="slider" />);
    expect(root.querySelectorAll('[data-tone]')).toHaveLength(3);
  });

  it('puts inset icons inside the track', () => {
    render(
      <Slider
        aria-label="Volume"
        size="md"
        startIcon={<Icon />}
        endIcon={<Icon />}
        defaultValue={50}
      />,
    );
    const [start, end] = screen.getAllByTestId('icon');
    expect(start!.parentElement!.parentElement).toHaveAttribute('data-tone', 'active');
    expect(end!.parentElement!.parentElement).toHaveAttribute('data-tone', 'inactive');
    expect(start!.parentElement!.style.marginInlineStart).toBe('10px');
  });

  it('moves the start icon to the inactive track when the active one is too short', () => {
    render(<Slider aria-label="Volume" size="md" startIcon={<Icon />} defaultValue={2} />);
    const [inActive, moved] = screen.getAllByTestId('icon');
    expect(inActive!.parentElement!.parentElement).toHaveAttribute('data-tone', 'active');
    const movedBox = moved!.parentElement!;
    expect(movedBox).toHaveAttribute('data-moved-icon');
    expect(movedBox).toHaveClass('text-on-secondary-container');
    // It starts 10px after the inactive track's start and shows only while the active
    // segment is shorter than the icon plus 20px (the active copy shows otherwise).
    expect(movedBox.style.marginInlineStart).toContain('+ 10px');
    expect(movedBox.style.inlineSize).toContain('var(--m3-slider-icon, 0px) + 20px');
    expect(inActive!.parentElement!.style.inlineSize).toContain('- 20px');
  });

  it('ignores inset icons on a centred slider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Slider aria-label="Balance" size="md" centered startIcon={<Icon />} />);
    expect(screen.queryByTestId('icon')).toBe(null);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('ignores inset icons on xs and sm sliders, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const size of ['xs', 'sm'] as const) {
      const { unmount } = render(
        <Slider aria-label="Volume" size={size} startIcon={<Icon />} endIcon={<Icon />} />,
      );
      expect(screen.queryByTestId('icon')).toBe(null);
      unmount();
    }
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]![0]).toContain('size md, lg or xl');
    warn.mockRestore();
  });

  it('steps by an interval with Space and an arrow', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={50} onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard('[Space>][ArrowRight][/Space]');
    expect(onChange).toHaveBeenLastCalledWith(60);
    await userEvent.keyboard('[Space>][ArrowDown][ArrowDown][/Space]');
    expect(onChange).toHaveBeenLastCalledWith(40);
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(41);
  });

  it('keeps the handle 4px after a pointer press while it keeps focus', () => {
    render(<Slider aria-label="Volume" defaultValue={50} />);
    const input = screen.getByRole('slider');
    fireEvent.focus(input);
    expect(input.closest('[data-thumb]')!.querySelector('[data-active]')).toBe(null);
  });

  it('is vertical and disabled on request', () => {
    render(<Slider aria-label="Level" orientation="vertical" disabled data-testid="slider" />);
    const root = screen.getByTestId('slider');
    expect(root).toHaveAttribute('data-disabled', 'true');
    expect(root).toHaveClass('h-[240px]', 'flex-col');
    expect(root.firstElementChild).toHaveClass('[writing-mode:vertical-lr]', '[direction:rtl]');
    expect(screen.getByRole('slider')).toBeDisabled();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('requires a name in its types', () => {
    // @ts-expect-error aria-label or aria-labelledby is required
    const unnamed = <Slider />;
    expect(unnamed).toBeTruthy();
  });
});

describe('RangeSlider', () => {
  it('renders two named thumbs and keeps them ordered', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider aria-label="Price" defaultValue={[20, 80]} onChange={onChange} />,
    );
    const [min, max] = screen.getAllByRole('slider');
    expect(min).toHaveAccessibleName('Minimum Price');
    expect(max).toHaveValue('80');
    fireEvent.keyDown(min!, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith([80, 80]);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('names its thumbs from labels', () => {
    render(<RangeSlider aria-label="Price" labels={{ start: 'Lowest', end: 'Highest' }} />);
    const [start, end] = screen.getAllByRole('slider');
    expect(start).toHaveAccessibleName('Lowest Price');
    expect(end).toHaveAccessibleName('Highest Price');
  });
});

describe('Slider classNames', () => {
  it('puts each slot on its part', () => {
    const { container } = render(
      <Slider
        aria-label="Volume"
        size="md"
        step={20}
        ticks
        defaultValue={60}
        startIcon={<svg data-testid="start-icon" />}
        classNames={{
          activeTrack: 'active-x',
          inactiveTrack: 'inactive-x',
          stop: 'stop-x',
          icon: 'icon-x',
          handle: 'handle-x',
        }}
      />,
    );
    const slots = (slot: string) => [...container.querySelectorAll(`[data-slot="${slot}"]`)];
    expect(slots('active-track').length).toBeGreaterThan(0);
    for (const track of slots('active-track')) expect(track).toHaveClass('active-x');
    expect(slots('inactive-track').length).toBeGreaterThan(0);
    for (const track of slots('inactive-track')) expect(track).toHaveClass('inactive-x');
    expect(slots('stop-indicator').length).toBeGreaterThan(0);
    for (const stop of slots('stop-indicator')) expect(stop).toHaveClass('stop-x');
    for (const icon of screen.getAllByTestId('start-icon')) {
      expect(icon.parentElement).toHaveClass('icon-x');
    }
    expect(slots('handle')[0]).toHaveClass('handle-x');
  });
});
