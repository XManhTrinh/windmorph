import { CodeBlock } from '@windmorph/react-pro';
import { SAMPLE_HTML, SAMPLE_SOURCE } from './sample-code';

/**
 * Line numbers in the start margin, counted from the highlighter's `.line` spans. They are
 * drawn as generated content, so copying the code never picks them up.
 */
export function CodeBlockLineNumbers() {
  return (
    <CodeBlock
      code={SAMPLE_SOURCE}
      html={SAMPLE_HTML}
      lang="ts"
      title="src/greet.ts"
      showLineNumbers
    />
  );
}
