import type { ReactNode } from 'react';
import { switchStyles } from './switch-styles';

/** The thumb's resting centres in px, off and on (Compose `ThumbNode`). */
export const THUMB_OFF_CENTER = 16;
export const THUMB_ON_CENTER = 36;

export const CheckIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);

export const CloseIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

/** Thumb size and centre in px (Compose `ThumbNode`). */
export function thumbGeometry(selected: boolean, pressed: boolean, hasIcon: boolean) {
  const size = pressed ? 28 : selected || hasIcon ? 24 : 16;
  return { size, center: selected ? THUMB_ON_CENTER : THUMB_OFF_CENTER };
}

/**
 * The thumb and its optional icon, placed by `--m3-thumb-size` and `--m3-thumb-center` on
 * the track and styled from a `group/control` ancestor's state attributes. Shared with
 * list items that are switches.
 */
export function SwitchThumb({
  styles = switchStyles(),
  icon,
  className,
  iconClassName,
}: {
  styles?: ReturnType<typeof switchStyles>;
  icon?: ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span aria-hidden="true" className={styles.thumb({ class: className })}>
      {icon && <span className={styles.icon({ class: iconClassName })}>{icon}</span>}
    </span>
  );
}
