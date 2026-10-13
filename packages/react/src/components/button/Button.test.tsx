import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Button } from './Button';
import { ButtonContext } from './ButtonContext';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('Button', () => {
  it('renders a filled, small, round button by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('bg-primary', 'text-on-primary', 'h-[40px]', 'text-label-large');
    expect(button).toHaveClass('rounded-[min(var(--md-sys-shape-corner-full),20px)]');
    expect(button).toHaveClass('data-pressed:rounded-corner-small', 'state-layer', 'focus-ring');
  });

  it('calls onPress and passes DOM props and handlers through', async () => {
    const onPress = vi.fn();
    const onClick = vi.fn();
    render(
      <Button
        onPress={onPress}
        onClick={onClick}
        type="submit"
        aria-describedby="hint"
        data-testid="b"
      >
        Send
      </Button>,
    );
    const button = screen.getByTestId('b');
    await userEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-describedby', 'hint');
  });

  it('does not respond when disabled', async () => {
    const onPress = vi.fn();
    render(
      <Button disabled onPress={onPress}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
    expect(button).toHaveClass(
      'data-disabled:bg-on-surface/10',
      'data-disabled:text-on-surface-variant/38',
    );
  });

  it.each([
    ['elevated', ['bg-surface-container-low', 'text-primary', 'shadow-elevation-1']],
    ['tonal', ['bg-secondary-container', 'text-on-secondary-container']],
    ['outlined', ['border-outline-variant', 'text-on-surface-variant', 'bg-transparent']],
    ['text', ['bg-transparent', 'text-primary', 'px-[12px]']],
  ] as const)('styles the %s variant', (variant, classes) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass(...classes);
  });

  it.each([
    ['xs', ['h-[32px]', 'px-[12px]', 'text-label-large'], 'gap-[4px]', 'size-[20px]'],
    ['sm', ['h-[40px]', 'px-[16px]', 'text-label-large'], 'gap-[8px]', 'size-[20px]'],
    ['md', ['h-[56px]', 'px-[24px]', 'text-title-medium'], 'gap-[8px]', 'size-[24px]'],
    [
      'lg',
      ['h-[96px]', 'px-[48px]', 'text-headline-small', 'font-brand'],
      'gap-[12px]',
      'size-[32px]',
    ],
    [
      'xl',
      ['h-[136px]', 'px-[64px]', 'text-headline-large', 'font-brand'],
      'gap-[16px]',
      'size-[40px]',
    ],
  ] as const)('sizes %s to the Compose measurements', (size, rootClasses, gap, iconSize) => {
    render(
      <Button size={size} leadingIcon={<Icon />}>
        Go
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass(...rootClasses);
    expect(screen.getByText('Go').parentElement).toHaveClass(gap);
    expect(screen.getByTestId('icon').parentElement).toHaveClass(iconSize);
  });

  it('uses square corners and size-specific press morphs', () => {
    render(
      <>
        <Button shape="square" size="md">
          Medium
        </Button>
        <Button shape="square" size="xl">
          XL
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass(
      'rounded-corner-large',
      'data-pressed:rounded-corner-medium',
    );
    expect(screen.getByRole('button', { name: 'XL' })).toHaveClass(
      'rounded-corner-extra-large',
      'data-pressed:rounded-corner-large',
    );
  });

  it('widens the outline for large outlined buttons', () => {
    render(
      <>
        <Button variant="outlined" size="lg">
          L
        </Button>
        <Button variant="outlined" size="xl">
          XL
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'L' })).toHaveClass('border-2');
    expect(screen.getByRole('button', { name: 'XL' })).toHaveClass('border-3');
  });

  it('adds a 48px touch target to XS and S buttons only', () => {
    const { container } = render(
      <>
        <Button size="xs">A</Button>
        <Button size="sm">B</Button>
        <Button size="md">C</Button>
      </>,
    );
    const targets = container.querySelectorAll('[data-touch-target]');
    expect(targets).toHaveLength(2);
    // The target sits in the library-owned inner wrapper, never on the root.
    for (const target of targets) {
      expect(target.parentElement).toHaveClass('relative');
      expect(target.parentElement?.tagName).toBe('SPAN');
    }
  });

  it('hides icons from assistive tech and names the button by its label', () => {
    render(
      <Button leadingIcon={<Icon />} trailingIcon={<Icon />}>
        Download
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Download');
    for (const icon of screen.getAllByTestId('icon')) {
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('puts className, style and ref on the root and lets consumer classes win', () => {
    let element: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(node) => {
          element = node;
        }}
        className="fixed bg-tertiary"
        classNames={{ label: 'uppercase', content: 'gap-[2px]' }}
        style={{ bottom: 16 }}
      >
        Fab-like
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(element).toBe(button);
    expect(button).toHaveClass('fixed', 'bg-tertiary');
    expect(button).not.toHaveClass('bg-primary');
    expect(button).toHaveStyle({ bottom: '16px' });
    expect(screen.getByText('Fab-like')).toHaveClass('uppercase');
    expect(screen.getByText('Fab-like').parentElement).toHaveClass('gap-[2px]');
    expect(screen.getByText('Fab-like').parentElement).not.toHaveClass('gap-[8px]');
  });

  it('takes variant, size, shape and disabled from context; its own props win', () => {
    render(
      <ButtonContext value={{ variant: 'tonal', size: 'lg', shape: 'square', disabled: true }}>
        <Button>Inherited</Button>
        <Button size="xs" disabled={false}>
          Own
        </Button>
      </ButtonContext>,
    );
    const inherited = screen.getByRole('button', { name: 'Inherited' });
    expect(inherited).toHaveClass(
      'bg-secondary-container',
      'h-[96px]',
      'rounded-corner-extra-large',
    );
    expect(inherited).toBeDisabled();
    const own = screen.getByRole('button', { name: 'Own' });
    expect(own).toHaveClass('h-[32px]');
    expect(own).toBeEnabled();
  });

  it('has no axe violations in any variant', async () => {
    const { container } = render(
      <div>
        {(['filled', 'elevated', 'tonal', 'outlined', 'text'] as const).map((variant) => (
          <Button key={variant} variant={variant} leadingIcon={<Icon />}>
            {variant}
          </Button>
        ))}
        <Button toggle>Toggle</Button>
        <Button href="/home">Home</Button>
        <Button disabled>Disabled</Button>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('Button toggle', () => {
  it('toggles aria-pressed and the selected state', async () => {
    const onSelectedChange = vi.fn();
    render(
      <Button toggle onSelectedChange={onSelectedChange}>
        Bold
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveAttribute('data-selected');
    expect(button).toHaveClass('bg-surface-container', 'text-on-surface-variant');

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-selected');
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it('can be controlled', async () => {
    const onSelectedChange = vi.fn();
    render(
      <Button toggle selected onSelectedChange={onSelectedChange}>
        Bold
      </Button>,
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('swaps shape when selected: round → square and square → round', () => {
    render(
      <>
        <Button toggle defaultSelected size="md">
          Round
        </Button>
        <Button toggle defaultSelected shape="square" size="md">
          Square
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Round' })).toHaveClass(
      'data-selected:not-data-pressed:not-data-disabled:rounded-corner-large',
    );
    expect(screen.getByRole('button', { name: 'Square' })).toHaveClass(
      'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
    );
  });

  it('uses the bouncy spatial spring for its shape and a 6px press at size S', () => {
    render(<Button toggle>Bold</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      'container-motion',
      'container-motion-spatial',
      'data-pressed:rounded-[6px]',
    );
  });

  it('rejects a text toggle in its types', () => {
    const textToggle = (
      // @ts-expect-error text buttons have no toggle form
      <Button toggle variant="text">
        Bold
      </Button>
    );
    expect(textToggle).toBeTruthy();
  });

  it('falls back to filled for a text variant from context', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ButtonContext value={{ variant: 'text' }}>
        <Button toggle>Bold</Button>
      </ButtonContext>,
    );
    expect(screen.getByRole('button')).toHaveClass('bg-surface-container');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no toggle form'));
    warn.mockRestore();
  });
});

describe('Button link', () => {
  it('renders a link that navigates through the RouterProvider', async () => {
    const navigate = vi.fn();
    let element: HTMLAnchorElement | null = null;
    render(
      <RouterProvider navigate={navigate}>
        <Button
          href="/settings"
          variant="text"
          ref={(node) => {
            element = node;
          }}
        >
          Settings
        </Button>
      </RouterProvider>,
    );
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(element).toBe(link);
    expect(link).toHaveAttribute('href', '/settings');
    await userEvent.click(link);
    expect(navigate).toHaveBeenCalledWith('/settings', undefined);
  });

  it('drops the href and is marked disabled when disabled', () => {
    render(
      <Button href="/settings" disabled>
        Settings
      </Button>,
    );
    const link = screen.getByText('Settings').closest('a')!;
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled');
  });
});
