import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Badge, BadgedBox } from './Badge';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('Badge', () => {
  it('renders a 6px error dot without content', () => {
    render(<Badge data-testid="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass(
      'size-[6px]',
      'rounded-corner-full',
      'bg-error',
    );
    expect(screen.getByTestId('badge')).toBeEmptyDOMElement();
  });

  it('renders a large 16px label-small badge with content', () => {
    render(<Badge data-testid="badge">999+</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass(
      'h-[16px]',
      'min-w-[16px]',
      'ps-[4px]',
      'pe-[4px]',
      'text-label-small',
      'text-on-error',
    );
    expect(screen.getByTestId('badge')).toHaveTextContent('999+');
  });
});

describe('BadgedBox', () => {
  it('hangs a small badge 6px inside the top end of its anchor', async () => {
    const { container } = render(
      <BadgedBox badge={<Badge />} data-testid="box" className="m-2">
        <Icon />
      </BadgedBox>,
    );
    const box = screen.getByTestId('box');
    expect(box).toHaveClass('inline-grid', 'm-2');
    expect(screen.getByTestId('icon').parentElement).toHaveClass('col-start-1', 'row-start-1');
    expect(box.lastElementChild).toHaveClass(
      'size-0',
      'ms-[calc(100%-6px)]',
      'mt-[6px]',
      'items-end',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('hangs a large badge 12px inside the end with its bottom 14px down', () => {
    render(
      <BadgedBox badge={<Badge>3</Badge>} data-testid="box">
        <Icon />
      </BadgedBox>,
    );
    expect(screen.getByTestId('box').lastElementChild).toHaveClass(
      'ms-[calc(100%-12px)]',
      'mt-[14px]',
    );
  });
});
