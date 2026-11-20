'use client';

import { Button } from '@windmorph/react';
import { VideoPlayer, VideoPlayerControl } from '@windmorph/react-pro';
import { useState } from 'react';
import { ShareIcon } from '../../components/icons';

/**
 * `look="scrim"` draws bare controls over a dark gradient at the foot, in place of a
 * see-through container per group. `controls` adds your own `VideoPlayerControl`s at the end
 * of the bar, and `ended` puts your own content over the picture when it ends, in place of
 * Replay there.
 */
export function VideoPlayerLook() {
  const [shared, setShared] = useState(false);
  return (
    <VideoPlayer
      aria-label="A tour of the components"
      source="/media/bento/bento-light.mp4"
      poster={{ src: '/media/bento/bento-light.jpg' }}
      width={1152}
      height={720}
      duration={18}
      look="scrim"
      controls={
        <VideoPlayerControl
          label={shared ? 'Link copied' : 'Share'}
          icon={<ShareIcon />}
          onPress={() => setShared(true)}
        />
      }
      ended={
        <div className="flex flex-col items-center gap-3 text-white">
          <p className="text-title-medium">Up next: Theming in five minutes</p>
          <Button variant="filled" size="sm">
            Watch now
          </Button>
        </div>
      }
      className="aspect-[1152/720] w-full max-w-xl rounded-corner-large"
    />
  );
}
