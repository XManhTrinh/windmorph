import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LabelsProvider } from '../labels/LabelsProvider';
import { LocaleProvider } from '../locale/LocaleProvider';
import { ListItemVideo } from './ListMedia';

describe('ListItemVideo duration', () => {
  it('shows a string and reads it as written', () => {
    render(<ListItemVideo src="/a.jpg" alt="" duration="2:41" />);
    expect(screen.getByText('2:41')).not.toHaveAttribute('aria-hidden');
  });

  it('shows seconds as a clock and reads them in words, as one text', () => {
    const { container } = render(<ListItemVideo src="/a.jpg" alt="" duration={252} />);
    const clock = screen.getByText('4:12');
    expect(clock).toHaveAttribute('aria-hidden', 'true');
    expect(clock).toHaveAttribute('dir', 'ltr');
    const words = screen.getByText('Length 4 minutes, 12 seconds');
    expect(words.childNodes).toHaveLength(1);
    expect(container.textContent).toContain('Length 4 minutes, 12 seconds');
  });

  it('shows nothing for a negative or unknown length', () => {
    const { container, rerender } = render(<ListItemVideo src="/a.jpg" alt="" duration={-1} />);
    expect(container.textContent).toBe('');
    rerender(<ListItemVideo src="/a.jpg" alt="" duration={Number.NaN} />);
    expect(container.textContent).toBe('');
  });

  it('takes its word from the LabelsProvider and its digits from the locale', () => {
    render(
      <LocaleProvider locale="de-DE">
        <LabelsProvider labels={{ ListItemVideo: { duration: (words) => `Dauer ${words}` } }}>
          <ListItemVideo src="/a.jpg" alt="" duration={3723} />
        </LabelsProvider>
      </LocaleProvider>,
    );
    expect(screen.getByText('1:02:03')).toBeInTheDocument();
    expect(screen.getByText(/^Dauer 1 Stunde/)).toBeInTheDocument();
  });

  it('renders the same text on the server', () => {
    expect(renderToString(<ListItemVideo src="/a.jpg" alt="" duration={7} />)).toContain(
      'Length 7 seconds',
    );
  });
});
