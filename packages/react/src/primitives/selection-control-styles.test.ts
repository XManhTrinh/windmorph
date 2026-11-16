import { describe, expect, it } from 'vitest';
import { selectionControlStyles } from './selection-control-styles';

// The label's padding keeps 8px to the row's far edge and the M3 gap to the control: 0 beside a
// checkbox's or radio's 40px control (its state layer is the gap), 12px beside a switch's track.
describe('selectionControlStyles label spacing', () => {
  const label = (kind: 'circle' | 'track', controlPlacement?: 'start' | 'end') =>
    selectionControlStyles({ kind, controlPlacement }).label().split(' ');

  it('pads a checkbox or radio label at its far end, on either side', () => {
    expect(label('circle')).toEqual(expect.arrayContaining(['pe-[8px]']));
    expect(label('circle')).not.toContain('ps-[8px]');
    expect(label('circle', 'end')).toEqual(expect.arrayContaining(['ps-[8px]', 'flex-1']));
    expect(label('circle', 'end')).not.toContain('pe-[8px]');
  });

  it('keeps 12px from a switch and 8px from the far edge, mirrored at the end', () => {
    expect(label('track')).toEqual(expect.arrayContaining(['ps-[12px]', 'pe-[8px]']));
    expect(label('track', 'end')).toEqual(
      expect.arrayContaining(['ps-[8px]', 'pe-[12px]', 'flex-1']),
    );
  });
});
