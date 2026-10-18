import { describe, expect, it } from 'vitest';
import { closedByOverlayOptions } from './closed-by';

describe('closedByOverlayOptions', () => {
  it('maps each closedby value to the overlay options', () => {
    expect(closedByOverlayOptions('any', false)).toEqual({
      isDismissable: true,
      isKeyboardDismissDisabled: false,
    });
    expect(closedByOverlayOptions('closerequest', false)).toEqual({
      isDismissable: false,
      isKeyboardDismissDisabled: false,
    });
    expect(closedByOverlayOptions('none', false)).toEqual({
      isDismissable: false,
      isKeyboardDismissDisabled: true,
    });
  });

  it('takes no outside press while the surface leaves', () => {
    expect(closedByOverlayOptions('any', true).isDismissable).toBe(false);
  });
});
