import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LabelsProvider } from './LabelsProvider';
import { useLabels } from './use-labels';
import type { WindmorphLabels } from '../../windmorph-labels';

const DEFAULTS = { close: 'Close', back: 'Back' };

/** Shows a side sheet's two words, as a component reads them. */
function Words({ labels }: { labels?: WindmorphLabels['SideSheet'] }) {
  const words = useLabels('SideSheet', DEFAULTS, labels);
  return <p>{`${words.close} / ${words.back}`}</p>;
}

describe('LabelsProvider and useLabels', () => {
  it('uses the defaults with no provider', () => {
    render(<Words />);
    expect(screen.getByText('Close / Back')).toBeInTheDocument();
  });

  it("replaces only the words the provider names, for the component's own key", () => {
    render(
      <LabelsProvider labels={{ SideSheet: { close: 'Fermer' }, DialogHeader: { close: 'Zu' } }}>
        <Words />
      </LabelsProvider>,
    );
    expect(screen.getByText('Fermer / Back')).toBeInTheDocument();
  });

  it("merges nested providers per word: the nearest wins, the outer's other words stay", () => {
    render(
      <LabelsProvider labels={{ SideSheet: { close: 'Fermer', back: 'Retour' } }}>
        <LabelsProvider labels={{ SideSheet: { close: 'Schließen' } }}>
          <Words />
        </LabelsProvider>
      </LabelsProvider>,
    );
    expect(screen.getByText('Schließen / Retour')).toBeInTheDocument();
  });

  it("puts the component's own labels above every provider", () => {
    render(
      <LabelsProvider labels={{ SideSheet: { close: 'Fermer', back: 'Retour' } }}>
        <Words labels={{ close: 'Done' }} />
      </LabelsProvider>,
    );
    expect(screen.getByText('Done / Retour')).toBeInTheDocument();
  });

  it('keeps the word below when one is left undefined', () => {
    render(
      <LabelsProvider labels={{ SideSheet: { close: 'Fermer', back: undefined } }}>
        <Words labels={{ close: undefined }} />
      </LabelsProvider>,
    );
    expect(screen.getByText('Fermer / Back')).toBeInTheDocument();
  });

  it("reads the keys before a component's own first, for one built from another", () => {
    function TimeWords({ labels }: { labels?: WindmorphLabels['TimeField'] }) {
      const words = useLabels(
        ['TimePicker', 'PickerDialog', 'TimeField'],
        { hour: 'Hour', close: 'Close', ok: 'OK' },
        labels,
      );
      return <p>{`${words.hour} / ${words.close} / ${words.ok} / ${words.invalidTime ?? '-'}`}</p>;
    }
    render(
      <LabelsProvider
        labels={{
          TimePicker: { hour: 'Stunde' },
          PickerDialog: { close: 'Schließen' },
          TimeField: { close: 'Zu', invalidTime: 'Ungültig' },
        }}
      >
        <TimeWords labels={{ ok: 'Fertig' }} />
      </LabelsProvider>,
    );
    expect(screen.getByText('Stunde / Zu / Fertig / Ungültig')).toBeInTheDocument();
  });

  it('returns the same object until the provider, the defaults or the labels change', () => {
    const seen: object[] = [];
    const own = { close: 'Done' };
    function Probe({ labels }: { labels?: WindmorphLabels['SideSheet'] }) {
      seen.push(useLabels('SideSheet', DEFAULTS, labels));
      return null;
    }
    const words: WindmorphLabels = { SideSheet: { back: 'Retour' } };
    const { rerender } = render(
      <LabelsProvider labels={words}>
        <Probe labels={own} />
      </LabelsProvider>,
    );
    rerender(
      <LabelsProvider labels={words}>
        <Probe labels={own} />
      </LabelsProvider>,
    );
    expect(seen[1]).toBe(seen[0]);
    rerender(
      <LabelsProvider labels={words}>
        <Probe labels={{ close: 'Fertig' }} />
      </LabelsProvider>,
    );
    expect(seen.at(-1)).not.toBe(seen[0]);
    expect(seen.at(-1)).toEqual({ close: 'Fertig', back: 'Retour' });
  });

  it('gives the components below the same words until the provider gets new ones', () => {
    const words: WindmorphLabels = { SideSheet: { close: 'Fermer' } };
    const { rerender } = render(
      <LabelsProvider labels={words}>
        <Words />
      </LabelsProvider>,
    );
    rerender(
      <LabelsProvider labels={{ SideSheet: { close: 'Schließen' } }}>
        <Words />
      </LabelsProvider>,
    );
    expect(screen.getByText('Schließen / Back')).toBeInTheDocument();
  });
});
