import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import { AppFrameApp } from '../../../examples/blocks/app-frame-app';
import { AppFrameFull } from '../../../examples/blocks/app-frame-full';
import { AppFramePinned } from '../../../examples/blocks/app-frame-pinned';
import { AppFramePublic } from '../../../examples/blocks/app-frame-public';

const VARIATIONS: Record<string, ComponentType> = {
  'app-frame-public': AppFramePublic,
  'app-frame-app': AppFrameApp,
  'app-frame-full': AppFrameFull,
  'app-frame-pinned': AppFramePinned,
};

/** A block alone in the window, for the iframe on its page. Never indexed. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(VARIATIONS).map((variation) => ({ variation }));
}

export default async function BlockPreview({ params }: { params: Promise<{ variation: string }> }) {
  const { variation } = await params;
  const Block = VARIATIONS[variation];
  if (!Block) notFound();
  return (
    <div data-block-preview="" className="contents">
      <Block />
    </div>
  );
}
