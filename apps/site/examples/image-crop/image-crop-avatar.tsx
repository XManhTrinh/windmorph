'use client';

import { Button } from '@windmorph/react';
import { ImageCropDialog, type ImageCropResult } from '@windmorph/react-pro';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { SAMPLE_PHOTO } from './sample-photo';

/**
 * A profile photo: pick a file (or the sample), frame it with the round-avatar guide, and
 * "upload" it. The dialog stays open with a progress bar while `busy`; the app sends the
 * original file and the crop rectangle, and the server crops it.
 */
export function ImageCropAvatar() {
  const input = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [saved, setSaved] = useState<ImageCropResult | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  // Object URLs hold the file in memory until they're revoked.
  useEffect(() => {
    if (!src?.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(src);
  }, [src]);

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSrc(URL.createObjectURL(file));
    event.target.value = '';
  };

  // Stands in for the upload: progress over a second, then close.
  const upload = (result: ImageCropResult) => {
    setProgress(0);
    let step = 0;
    timer.current = setInterval(() => {
      step += 1;
      setProgress(step / 10);
      if (step === 10) {
        clearInterval(timer.current);
        setSaved(result);
        setProgress(null);
        setSrc(null);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="tonal" onPress={() => input.current?.click()}>
          Choose photo
        </Button>
        <Button variant="text" onPress={() => setSrc(SAMPLE_PHOTO)}>
          Try the sample
        </Button>
        <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
      </div>
      {saved && (
        <p className="text-body-medium text-on-surface-variant">
          Crop: <code className="text-on-surface">{JSON.stringify(saved.crop)}</code>
        </p>
      )}
      {src && (
        <ImageCropDialog
          open
          onOpenChange={(open) => !open && setSrc(null)}
          src={src}
          guide="circle"
          busy={progress !== null}
          progress={progress ?? undefined}
          onConfirm={upload}
        />
      )}
    </div>
  );
}
