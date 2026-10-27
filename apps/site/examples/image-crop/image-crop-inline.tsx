'use client';

import { ImageCropper, type ImageCropResult } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTO } from './sample-photo';

/** Inline, in a 4:5 frame (a post photo), reporting the crop as it changes. */
export function ImageCropInline() {
  const [result, setResult] = useState<ImageCropResult | null>(null);
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-3">
      <ImageCropper src={SAMPLE_PHOTO} aspect={4 / 5} onCropChange={setResult} />
      <p className="text-body-medium text-on-surface-variant">
        Crop: <code className="text-on-surface">{result ? JSON.stringify(result.crop) : '…'}</code>
      </p>
    </div>
  );
}
