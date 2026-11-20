'use client';

import { DurationTag, MediaFrame } from '@windmorph/react-pro';
import { createElement } from 'react';
import { loose, type PlaygroundDescriptor } from './shared';

const DurationTagAny = loose(DurationTag);

/** Playgrounds for the Windmorph Pro media components, by page slug. */
export const MEDIA_PRO_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'duration-tag': {
    component: 'DurationTag',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      MediaFrame:
        'The preview’s tag sits in one, at 16:9, and the snippet writes it; the examples show a rounder frame.',
    },
    render: (props) =>
      createElement(
        MediaFrame,
        { ratio: '16/9', className: 'w-full max-w-sm' },
        createElement('span', { className: 'bg-tertiary-container' }),
        props.raised ? createElement('span', { className: 'h-1 w-3/5 self-end bg-primary' }) : null,
        createElement(DurationTagAny, props),
      ),
    defaultProps: { placement: 'bottom-end', raised: false },
    initialState: { duration: 252 },
    surfacedProps: ['duration', 'placement', 'raised', 'label'],
    numberRanges: { duration: { min: 0, max: 36000, step: 1 } },
    notControlled: {
      formatDuration:
        'A function that writes the clock; the preview keeps `m:ss` in the page’s locale, and the examples write minutes.',
    },
    importMembers: ['MediaFrame'],
    codeWrap: {
      before: '<MediaFrame ratio="16/9">\n  <img src="/media/poster.jpg" alt="" />',
      after: '</MediaFrame>',
    },
  },
};
