import { CodeBlock } from '@windmorph/react-pro';

/**
 * Without `html` the code shows as plain text. Without a title, the header holds only the
 * copy button and the region is named from `lang` ("bash code"); `copyable={false}` drops the
 * button and the header with it, here for output nobody needs to copy (its region is named
 * "Code").
 */
export function CodeBlockPlain() {
  return (
    <div className="flex flex-col gap-3">
      <CodeBlock code="pnpm add @windmorph/react" lang="bash" />
      <CodeBlock code="Done in 2.4s" copyable={false} />
    </div>
  );
}
