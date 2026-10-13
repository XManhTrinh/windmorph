import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a 1px outline-variant horizontal separator', async () => {
    const { container } = render(<Divider className="my-4" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('h-px', 'w-full', 'bg-outline-variant', 'bg-clip-content', 'my-4');
    expect(divider).not.toHaveAttribute('aria-orientation');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('renders vertical and inset dividers', () => {
    render(
      <>
        <Divider orientation="vertical" inset="middle" data-testid="vertical" />
        <Divider inset="start" data-testid="start" />
        <Divider inset="middle" data-testid="middle" />
      </>,
    );
    expect(screen.getByTestId('vertical')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByTestId('vertical')).toHaveClass(
      'w-px',
      'self-stretch',
      'pt-[16px]',
      'pb-[16px]',
    );
    expect(screen.getByTestId('start')).toHaveClass('ps-[16px]');
    expect(screen.getByTestId('middle')).toHaveClass('ps-[16px]', 'pe-[16px]');
  });

  it('can be decorative', () => {
    render(<Divider decorative data-testid="d" />);
    expect(screen.queryByRole('separator')).toBe(null);
    expect(screen.getByTestId('d')).toHaveAttribute('role', 'none');
  });
});
