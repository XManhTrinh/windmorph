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
    const segments = root.querySelectorAll('[data-tone]');
    expect([...segments].map((s) => s.getAttribute('data-tone'))).toEqual(['active', 'inactive']);
    expect(segments[0]).toHaveClass('data-[tone=active]:bg-primary');
    expect((segments[0] as HTMLElement).style.marginInlineStart).toBe('0px');
    // The inactive segment holds the end stop indicator.
    expect(segments[1]!.querySelector('.size-\\[4px\\]')).not.toBe(null);
    expect(await axeViolations(container)).toEqual([]);
  });

  it.each([
    ['sm', '24px', '44px'],
    ['md', '40px', '44px'],
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
    expect(screen.getByText('42')).toHaveClass('bg-inverse-surface', 'text-label-large');
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
});
