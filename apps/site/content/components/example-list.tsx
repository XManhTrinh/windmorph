import type { ReactNode } from 'react';
import { ExampleViewer } from '../../components/example-viewer';
import { InlineCode } from '../../components/inline-code';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { lazyExample } from '../../lib/lazy-example';

/** One live example of a component page, by its file under `examples/` and its export. */
export interface ExampleEntry {
  title: string;
  /** The file under `examples/`, without `.tsx`. */
  file: string;
  name: string;
}

/** The Examples section of a component page. */
export async function exampleSection(entries: ExampleEntry[]): Promise<ReactNode> {
  const items = await Promise.all(
    entries.map(async (entry) => {
      const code = await readExampleSource(`${entry.file}.tsx`);
      return {
        ...entry,
        code,
        html: await highlightSource(code),
        Example: lazyExample(entry.file, entry.name),
      };
    }),
  );
  return (
    <section className="flex flex-col gap-6">
      <h2 id="examples" className="text-headline-small text-on-surface">
        Examples
      </h2>
      {items.map(({ title, code, html, file, Example }) => (
        <ExampleViewer
          key={file}
          title={title}
          code={code}
          html={html!}
          fileName={`${file.split('/').pop()}.tsx`}
        >
          <Example />
        </ExampleViewer>
      ))}
    </section>
  );
}

/** Names written as code, separated by commas: the parts a `classNames` prop takes. */
export function CodeList({ names }: { names: string[] }) {
  return (
    <>
      {names.map((name, index) => (
        <span key={name}>
          <InlineCode>{name}</InlineCode>
          {index < names.length - 1 ? ', ' : ''}
        </span>
      ))}
    </>
  );
}
