'use client';

import { IconButton } from '@windmorph/react';
import { MediaUploadGrid, MessageField, type MediaUploadItem } from '@windmorph/react-pro';
import { useState } from 'react';
import { SAMPLE_PHOTOS } from '../media-upload-grid/sample-photos';

/** Material Symbols `mood`, `attach_file` and `mic`. */
const icon = (d: string) => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d={d} />
  </svg>
);
const MOOD = icon(
  'M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260Zm0 180q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
);
const ATTACH = icon(
  'M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z',
);
const MIC = icon(
  'M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z',
);

const toItem = (key: string, url: string, alt: string): MediaUploadItem => ({
  key,
  previewUrl: url,
  alt,
  status: 'done',
});

/**
 * A chat composer replying to a message: the reply banner (Escape or × cancels it), photos
 * pasted or dropped onto the field in a row above the text, and a microphone while it's empty.
 */
export function MessageFieldChat() {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>('Sam');
  const [photos, setPhotos] = useState<MediaUploadItem[]>(() => [
    // A fixed key: the page renders on the server first, so a random one wouldn't match.
    toItem('sample-0', SAMPLE_PHOTOS[0]!.url, SAMPLE_PHOTOS[0]!.alt),
  ]);
  const [sent, setSent] = useState<string[]>([]);

  const send = (message: string) => {
    setSent((current) => [...current, message]);
    setText('');
    setReplyTo(null);
    setPhotos([]);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ol className="flex flex-col items-end gap-2" aria-label="Sent messages">
        {sent.map((message, index) => (
          <li
            key={index}
            className="rounded-corner-large bg-primary px-4 py-2 text-body-medium whitespace-pre-line text-on-primary"
          >
            {message}
          </li>
        ))}
      </ol>
      <MessageField
        aria-label="Message"
        placeholder="Message"
        value={text}
        onChange={setText}
        onSubmit={send}
        banner={replyTo ? `Replying to ${replyTo}` : null}
        onBannerClose={() => setReplyTo(null)}
        onEscape={() => setReplyTo(null)}
        attachments={
          photos.length > 0 ? (
            <MediaUploadGrid
              aria-label="Photos to send"
              layout="row"
              items={photos}
              onRemove={(key) => setPhotos((current) => current.filter((item) => item.key !== key))}
            />
          ) : null
        }
        accept={['image/*']}
        onFiles={(files) =>
          setPhotos((current) => [
            ...current,
            ...files.map((file) =>
              toItem(crypto.randomUUID(), URL.createObjectURL(file), file.name),
            ),
          ])
        }
        leading={<IconButton icon={MOOD} aria-label="Emoji" />}
        trailing={<IconButton icon={ATTACH} aria-label="Attach a file" />}
        emptyAction={<IconButton icon={MIC} aria-label="Record a voice message" />}
      />
    </div>
  );
}
