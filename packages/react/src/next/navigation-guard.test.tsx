import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../components/button/Button';
import { NextRouterProvider } from './NextRouterProvider';
import { useGuardedNavigate, useNavigationGuard, type NavigationAttempt } from './navigation-guard';

const push = vi.fn();
vi.mock('next/navigation.js', () => ({ useRouter: () => ({ push }) }));

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

describe('NextRouterProvider basePath', () => {
  it("shows the base path in a link's address and leaves navigation to the router", () => {
    render(
      <NextRouterProvider basePath="/docs/">
        <Button href="/guides/theming">Theming</Button>
        <Button href="#main">Skip</Button>
        <Button href="https://example.com/a">Elsewhere</Button>
      </NextRouterProvider>,
    );
    expect(screen.getByRole('link', { name: 'Theming' })).toHaveAttribute(
      'href',
      '/docs/guides/theming',
    );
    // A fragment and a full URL aren't paths on this site.
    expect(screen.getByRole('link', { name: 'Skip' })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('link', { name: 'Elsewhere' })).toHaveAttribute(
      'href',
      'https://example.com/a',
    );
    // Next's router adds the base path itself.
    fireEvent.click(screen.getByRole('link', { name: 'Theming' }));
    expect(push).toHaveBeenCalledWith('/guides/theming');
  });

  it("writes a path's end as Next's Link does", () => {
    const { rerender } = render(
      <NextRouterProvider basePath="/docs">
        <Button href="/">Home</Button>
        <Button href="/guides/?tab=code#top">Guides</Button>
        <Button href="/report.pdf">Report</Button>
      </NextRouterProvider>,
    );
    const href = (name: string) => screen.getByRole('link', { name }).getAttribute('href');
    // Without `trailingSlash`, Next removes the slash at a path's end, the base path's too.
    expect([href('Home'), href('Guides'), href('Report')]).toEqual([
      '/docs',
      '/docs/guides?tab=code#top',
      '/docs/report.pdf',
    ]);
    rerender(
      <NextRouterProvider basePath="/docs" trailingSlash>
        <Button href="/">Home</Button>
        <Button href="/guides?tab=code#top">Guides</Button>
        <Button href="/report.pdf">Report</Button>
      </NextRouterProvider>,
    );
    // With it, every path on the site ends in one, before its query, but a file's name doesn't.
    expect([href('Home'), href('Guides'), href('Report')]).toEqual([
      '/docs/',
      '/docs/guides/?tab=code#top',
      '/docs/report.pdf',
    ]);
    rerender(
      <NextRouterProvider trailingSlash>
        <Button href="/">Home</Button>
        <Button href="/guides">Guides</Button>
        <Button href="#main">Report</Button>
      </NextRouterProvider>,
    );
    expect([href('Home'), href('Guides'), href('Report')]).toEqual(['/', '/guides/', '#main']);
  });
});
