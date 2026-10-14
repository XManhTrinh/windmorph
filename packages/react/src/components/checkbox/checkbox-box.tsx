import { cn } from '../../utils/cn';
import { checkboxStyles } from './checkbox-styles';

/**
 * The drawn box and its check or dash, styled from a `group/control` ancestor's state
 * attributes. Shared with list items that are checkboxes, so it carries the checkbox's
 * component tokens (`checkbox-tokens.ts`) itself.
 */
export function CheckboxBox({
  styles = checkboxStyles(),
  className,
  iconClassName,
}: {
  styles?: ReturnType<typeof checkboxStyles>;
  className?: string | undefined;
  iconClassName?: string | undefined;
}) {
  return (
    <span
      aria-hidden="true"
      data-tokens="md-comp-checkbox"
      data-slot="box"
      className={styles.box({ class: className })}
    >
      <svg viewBox="0 0 18 18" className={styles.icon({ class: iconClassName })}>
        <path
          d="M4.5 9 7.2 11.7 13.5 5.4"
          pathLength={1}
          className={cn(styles.mark(), styles.check())}
        />
        <path d="M4.5 9H13.5" pathLength={1} className={cn(styles.mark(), styles.dash())} />
      </svg>
    </span>
  );
}
