/**
 * How a modal surface may be closed by the user, as HTML's `<dialog closedby>` names it:
 * `any` (Escape or a press outside), `closerequest` (Escape, the platform's close request,
 * only) or `none` (only by the app or the surface's own buttons).
 */
export type ClosedBy = 'any' | 'closerequest' | 'none';

/** React Aria's `useModalOverlay` options for a `closedBy` value. */
export function closedByOverlayOptions(closedBy: ClosedBy, isExiting: boolean) {
  return {
    isDismissable: closedBy === 'any' && !isExiting,
    isKeyboardDismissDisabled: closedBy === 'none',
  };
}
