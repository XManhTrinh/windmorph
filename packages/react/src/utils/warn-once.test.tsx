import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWarnOnce, warnOnce } from './warn-once';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('warnOnce', () => {
  it('warns the first time a key is seen, with every argument', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const detail = { id: 1 };
    warnOnce('warn-once-test-a', 'First', detail);
    warnOnce('warn-once-test-a', 'Again');
    warnOnce('warn-once-test-b', 'Other key');
    expect(warn.mock.calls).toEqual([['First', detail], ['Other key']]);
  });

  it('stays silent in production, and still warns for the key later in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    warnOnce('warn-once-test-c', 'Hidden');
    expect(warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    warnOnce('warn-once-test-c', 'Shown');
    expect(warn.mock.calls).toEqual([['Shown']]);
  });
});

function Warner({ when, message }: { when: boolean; message: string }) {
  useWarnOnce(when, message);
  return null;
}

describe('useWarnOnce', () => {
  it('warns once per instance, with the message of the render that triggered it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(<Warner when={false} message="Zero" />);
    expect(warn).not.toHaveBeenCalled();
    rerender(<Warner when message="One" />);
    rerender(<Warner when={false} message="Two" />);
    rerender(<Warner when message="Three" />);
    expect(warn.mock.calls).toEqual([['One']]);
    // Another instance has its own warning.
    render(<Warner when message="Four" />);
    expect(warn.mock.calls).toEqual([['One'], ['Four']]);
  });

  it('stays silent in production', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    render(<Warner when message="Hidden" />);
    expect(warn).not.toHaveBeenCalled();
  });
});
