import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Divider, LabeledDivider } from './Divider';

describe('Divider', () => {
  it('renders a 1px outline-variant horizontal separator', async () => {
    const { container } = render(<Divider className="my-4" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass(
      'h-px',
      'w-full',
      'bg-[var(--_md-comp-divider-color)]',
      'bg-clip-content',
      'my-4',
    );
    expect(divider).toHaveAttribute('data-tokens', 'md-comp-divider');
    expect(divider).not.toHaveAttribute('aria-orientation');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('lets a consumer colour class replace the token class', () => {
    render(<Divider className="bg-primary" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('bg-primary', 'bg-clip-content');
    expect(divider).not.toHaveClass('bg-[var(--_md-comp-divider-color)]');
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

describe('LabeledDivider', () => {
  it('puts supporting text 4px below the line, 8px clear at the end and below', async () => {
    const { container } = render(
      <LabeledDivider inset="start" data-testid="root" classNames={{ label: 'custom' }}>
        Earlier this week
      </LabeledDivider>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('flex-col', 'gap-[4px]', 'pe-[8px]', 'pb-[8px]');
    expect(screen.getByRole('separator')).toHaveClass('ps-[16px]');
    expect(screen.getByText('Earlier this week')).toHaveClass(
      'text-label-small',
      'text-on-surface-variant',
      'ps-[16px]',
      'custom',
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
