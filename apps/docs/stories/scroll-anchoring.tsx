import type { ReactNode } from 'react';

/**
 * A page much taller than the window with one component in the middle, positioned by the
 * story at the bottom end of a tall box (`absolute end-4 bottom-4`, as the home page bento
 * places its FAB menu), so a component that grows or shrinks moves its top edge. With the
 * box partly above the window, the browser looks inside it for a scroll anchor and finds
 * the component. `onToggle` adds a fixed button that toggles it without scrolling.
 */
export function TallPage({ children, onToggle }: { children: ReactNode; onToggle?: () => void }) {
  return (
    <div data-testid="page">
      <div className="h-[900px] bg-surface-container-low" />
      <div className="relative h-[480px] bg-surface-container">{children}</div>
      <div className="h-[2000px] bg-surface-container-low" />
      {onToggle && (
        <button
          type="button"
          data-testid="toggle"
          className="fixed start-2 bottom-2 rounded-corner-small bg-primary px-3 py-2 text-label-large text-on-primary"
          onClick={onToggle}
        >
          Toggle
        </button>
      )}
    </div>
  );
}
