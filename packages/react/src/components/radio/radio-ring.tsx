import { radioStyles } from './radio-styles';

/**
 * The drawn ring and dot, styled from a `group/control` ancestor's state attributes.
 * Shared with list items that are radio buttons, so it carries the radio button's component
 * tokens (`radio-tokens.ts`) itself.
 */
export function RadioRing({
  styles = radioStyles(),
  className,
  dotClassName,
}: {
  styles?: ReturnType<typeof radioStyles>;
  className?: string;
  dotClassName?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-tokens="md-comp-radio-button"
      data-slot="ring"
      className={styles.ring({ class: className })}
    >
      <span className={styles.dot({ class: dotClassName })} />
    </span>
  );
}
