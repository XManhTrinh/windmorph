import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Badge, BadgedBox } from './Badge';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('Badge', () => {
  it('renders a 6px error dot that announces a new notification', async () => {
    const { container } = render(<Badge data-testid="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('size-[6px]', 'rounded-corner-full', 'bg-error');
    expect(badge).toHaveTextContent('New notification');
    expect(badge.firstElementChild).toHaveStyle({ position: 'absolute' });
    expect(await axeViolations(container)).toEqual([]);
  });

  it('renders a large 16px label-small badge that reads its count', () => {
    render(<Badge data-testid="badge">{3}</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      'h-[16px]',
      'min-w-[16px]',
      'ps-[4px]',
      'pe-[4px]',
      'text-label-small',
      'text-on-error',
    );
    expect(badge).toHaveTextContent(/^3$/);
    expect(badge.firstElementChild).toHaveClass('truncate');
    expect(badge.firstElementChild).not.toHaveAttribute('aria-hidden');
  });

  it('stops text longer than four characters at 34px, truncating', () => {
    render(<Badge data-testid="badge">Longer</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('max-w-[34px]');
    expect(screen.getByTestId('badge').firstElementChild).toHaveClass('truncate');
  });

  it('never cuts a label of four characters or fewer, "+" included', () => {
    render(<Badge data-testid="badge">999+</Badge>);
    expect(screen.getByTestId('badge')).not.toHaveClass('max-w-[34px]');
  });

  it('caps counts at max with a "+" and formats them for the locale', () => {
    render(
      <>
        <Badge data-testid="default">{1200}</Badge>
        <Badge data-testid="99" max={99}>
          {120}
        </Badge>
        <Badge data-testid="under">{42}</Badge>
      </>,
    );
    expect(screen.getByTestId('default')).toHaveTextContent('999+');
    expect(screen.getByTestId('99')).toHaveTextContent('99+');
    expect(screen.getByTestId('under')).toHaveTextContent('42');
  });

  it('keeps a count left to right in right-to-left layouts', () => {
    render(
      <div dir="rtl">
        <Badge data-testid="count">{1200}</Badge>
        <Badge data-testid="text">جديد</Badge>
      </div>,
    );
    expect(screen.getByTestId('count').firstElementChild).toHaveAttribute('dir', 'ltr');
    expect(screen.getByTestId('text').firstElementChild).not.toHaveAttribute('dir');
  });

  it('announces its label instead of the visible content', () => {
    render(
      <>
        <Badge data-testid="large" label="3 unread messages">
          {3}
        </Badge>
        <Badge data-testid="small" labels={{ newNotification: 'Update available' }} />
      </>,
    );
    const large = screen.getByTestId('large');
    expect(large.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(large).toHaveTextContent('3 unread messages');
    expect(screen.getByTestId('small')).toHaveTextContent('Update available');
  });

  it('is part of its button’s name', () => {
    render(
      <button type="button">
        Inbox <Badge>{5}</Badge>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Inbox 5' })).toBeInTheDocument();
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
    // The hang reads the badge's own size, so it works without the badge's props.
    const hang = screen.getByTestId('box').lastElementChild!;
    expect(hang.firstElementChild).toHaveAttribute('data-size', 'large');
    expect(hang).toHaveClass(
      'has-[[data-size=large]]:ms-[calc(100%-12px)]',
      'has-[[data-size=large]]:mt-[14px]',
    );
  });
});
