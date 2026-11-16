import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ControlPlacement } from './selection-control-styles';
import { SelectionControl } from './SelectionControl';

function Control({ controlPlacement }: { controlPlacement?: ControlPlacement }) {
  return (
    <SelectionControl
      rootProps={{}}
      inputProps={{ type: 'checkbox' }}
      inputRef={null}
      state={{}}
      indicator={null}
      controlPlacement={controlPlacement}
    >
      Wi-Fi
    </SelectionControl>
  );
}

describe('SelectionControl placement', () => {
  it('puts the label after the control, padded at its far end, by default', () => {
    render(<Control />);
    const label = screen.getByText('Wi-Fi');
    const root = label.closest('label')!;
    expect(root.lastElementChild).toBe(label);
    expect(root).not.toHaveAttribute('data-control-placement');
    expect(label.className.split(' ')).toContain('pe-[8px]');
  });

  // Without the caller's styles, the default recipe left out the placement: the label moved
  // but kept the start's spacing and didn't grow.
  it("puts it first with the end's spacing, growing to fill the row, with 'end'", () => {
    render(<Control controlPlacement="end" />);
    const label = screen.getByText('Wi-Fi');
    const root = label.closest('label')!;
    expect(root.firstElementChild).toBe(label);
    expect(root).toHaveAttribute('data-control-placement', 'end');
    expect(label.className.split(' ')).toEqual(expect.arrayContaining(['ps-[8px]', 'flex-1']));
  });

  it('treats an unknown placement as the default, label and spacing included', () => {
    render(<Control controlPlacement={'leading' as ControlPlacement} />);
    const label = screen.getByText('Wi-Fi');
    expect(label.closest('label')!.lastElementChild).toBe(label);
    expect(label.className.split(' ')).toContain('pe-[8px]');
  });
});
