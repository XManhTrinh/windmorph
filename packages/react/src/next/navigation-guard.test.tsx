import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../components/button/Button';
import { NextRouterProvider } from './NextRouterProvider';
import { useGuardedNavigate, useNavigationGuard, type NavigationAttempt } from './navigation-guard';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

afterEach(() => push.mockClear());

function Form({ dirty, onAttempt }: { dirty: boolean; onAttempt: NavigationAttempt }) {
  useNavigationGuard({ when: dirty, onAttempt });
  const navigate = useGuardedNavigate();
  return (
    <>
      <Button href="/elsewhere">Leave</Button>
      <Button onPress={() => navigate('/after-save')}>Continue</Button>
    </>
  );
}

const leave = () => fireEvent.click(screen.getByRole('link', { name: 'Leave' }));

describe('navigation guard', () => {
  it('lets links navigate when no guard is active', () => {
    render(
      <NextRouterProvider>
        <Form dirty={false} onAttempt={vi.fn()} />
      </NextRouterProvider>,
    );
    leave();
    expect(push).toHaveBeenCalledWith('/elsewhere');
  });

  it('asks instead while a guard is active, and proceed() navigates', () => {
    let proceed: (() => void) | undefined;
    const onAttempt = vi.fn((next: () => void) => {
      proceed = next;
    });
    render(
      <NextRouterProvider>
        <Form dirty onAttempt={onAttempt} />
      </NextRouterProvider>,
    );
    leave();
    expect(onAttempt).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
    act(() => proceed?.());
    expect(push).toHaveBeenCalledWith('/elsewhere');
  });

  it('checks navigation in code too', () => {
    const onAttempt = vi.fn();
    render(
      <NextRouterProvider>
        <Form dirty onAttempt={onAttempt} />
      </NextRouterProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onAttempt).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });

  it('stops asking once the changes are saved, and after unmounting', () => {
    const onAttempt = vi.fn();
    const { rerender, unmount } = render(
      <NextRouterProvider>
        <Form dirty onAttempt={onAttempt} />
      </NextRouterProvider>,
    );
    rerender(
      <NextRouterProvider>
        <Form dirty={false} onAttempt={onAttempt} />
      </NextRouterProvider>,
    );
    leave();
    expect(onAttempt).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/elsewhere');
    unmount();
  });

  it('lets the most recent active guard decide', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    function Nested() {
      const [open] = useState(true);
      useNavigationGuard({ when: open, onAttempt: inner });
      return null;
    }
    render(
      <NextRouterProvider>
        <Form dirty onAttempt={outer} />
        <Nested />
      </NextRouterProvider>,
    );
    leave();
    expect(inner).toHaveBeenCalledOnce();
    expect(outer).not.toHaveBeenCalled();
  });

  it('asks the browser before reload or close only while active', () => {
    const { rerender } = render(
      <NextRouterProvider>
        <Form dirty onAttempt={vi.fn()} />
      </NextRouterProvider>,
    );
    const guarded = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(guarded);
    expect(guarded.defaultPrevented).toBe(true);
    rerender(
      <NextRouterProvider>
        <Form dirty={false} onAttempt={vi.fn()} />
      </NextRouterProvider>,
    );
    const free = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(free);
    expect(free.defaultPrevented).toBe(false);
  });
});
