import type { Metadata } from 'next';
import { guideMetadata } from '../../../lib/site-metadata';
import { ComponentIndex } from '../../../components/component-index';
import { InlineCode } from '../../../components/inline-code';

export const metadata: Metadata = guideMetadata('/components');

export default function ComponentsPage() {
  return (
    <article className="mx-auto flex max-w-6xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Components</h1>
        <p className="text-body-large text-on-surface-variant">
          Every component has live examples and a generated props table. They come from{' '}
          <InlineCode>@windmorph/react</InlineCode>, except those marked Pro, which come from
          Windmorph Pro (<InlineCode>@windmorph/react-pro</InlineCode>). Pick one to see its API and
          behaviour.
        </p>
      </header>

      <ComponentIndex />
    </article>
  );
}
