import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Carousel } from './Carousel';

afterEach(() => vi.restoreAllMocks());

const slides = (n: number) =>
  Array.from({ length: n }, (_, i) => <div key={i} data-testid={`slide-${i}`}>{`Slide ${i}`}</div>);

describe('Carousel', () => {
  it('is a named carousel region of slides', async () => {
    const { container } = render(
      <Carousel aria-label="Photos" className="h-[200px]" data-testid="carousel">
        {slides(4)}
      </Carousel>,
    );
    const region = screen.getByRole('region', { name: 'Photos' });
    expect(region).toBe(screen.getByTestId('carousel'));
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    expect(region).toHaveClass('h-[200px]');
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(4);
    expect(groups[0]).toHaveAttribute('aria-label', '1 of 4');
    expect(groups[0]).toHaveClass('snap-start', 'snap-always');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('sizes slots and masks items from the keylines once measured', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    render(
      <Carousel aria-label="Photos" preferredItemSize={186}>
        {slides(6)}
      </Carousel>,
    );
    const groups = screen.getAllByRole('group');
    expect(groups[0]!.style.width).toBe('186px');
    const mask = (index: number) => screen.getByTestId(`slide-${index}`).parentElement!;
    expect(mask(0).style.clipPath).toBe('inset(0 0px 0 0px round var(--m3-carousel-corner))');
    // The second item shows as the 118px medium item: 34px masked off each side.
    expect(mask(1).style.clipPath).toBe('inset(0 34px 0 34px round var(--m3-carousel-corner))');
    expect(mask(1).style.getPropertyValue('--m3-carousel-item-size')).toBe('118px');
    expect(mask(1).style.translate).toBe('-34px 0');
  });

  it('uncontained carousels do not snap; vertical ones scroll on y', () => {
    const { rerender } = render(
      <Carousel aria-label="Cards" variant="uncontained">
        {slides(3)}
      </Carousel>,
    );
    expect(screen.getAllByRole('group')[0]).not.toHaveClass('snap-start');
    rerender(
      <Carousel aria-label="Cards" orientation="vertical">
        {slides(3)}
      </Carousel>,
    );
    expect(screen.getAllByRole('group')[0]!.parentElement).toHaveClass(
      'flex-col',
      'overflow-y-auto',
      'snap-y',
    );
  });
});
