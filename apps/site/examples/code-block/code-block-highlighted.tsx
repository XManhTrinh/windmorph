import { CodeBlock } from '@windmorph/react-pro';
import { SAMPLE_HTML, SAMPLE_SOURCE } from './sample-code';

/**
 * Source highlighted at build time: `html` holds the token markup and `code` the raw text the
 * copy button copies. The title is the file name, and it also names the scrolling code region.
 */
export function CodeBlockHighlighted() {
  return <CodeBlock code={SAMPLE_SOURCE} html={SAMPLE_HTML} lang="ts" title="greet.ts" />;
}
