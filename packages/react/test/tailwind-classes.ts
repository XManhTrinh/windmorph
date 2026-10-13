import { fileURLToPath } from 'node:url';
import { uncompiledClasses as uncompiledClassesIn } from '@windmorph/test-utils/tailwind-classes';

export { collectClasses, nonLiteralClasses } from '@windmorph/test-utils/tailwind-classes';

const STYLES = fileURLToPath(new URL('../src/styles/styles.css', import.meta.url));

/** Classes that Tailwind plus this package's stylesheet do not generate a rule for. */
export const uncompiledClasses = (classes: string[]) => uncompiledClassesIn(classes, [STYLES]);
