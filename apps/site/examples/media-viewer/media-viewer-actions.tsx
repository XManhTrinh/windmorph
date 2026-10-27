'use client';

import { Button, IconButton, Menu, MenuItem, MenuTrigger } from '@windmorph/react';
import { MediaViewer, type MediaViewerLabels } from '@windmorph/react-pro';
import { useState } from 'react';
import { MoreVertIcon } from '../../components/icons';
import { SAMPLE_PHOTOS } from './sample-photos';

/** Every word comes from the app's translations; here, French. */
const LABELS_FR: MediaViewerLabels = {
  close: 'Fermer',
  previous: 'Photo précédente',
  next: 'Photo suivante',
  zoomIn: 'Agrandir',
  zoomOut: 'Réduire',
  position: (current, total) => `Photo ${current} sur ${total}`,
  description: 'Afficher toute la description',
  error: 'Impossible d’afficher cette photo.',
};

/**
 * Translated labels, and an action menu in the top bar through `actions`. Icon buttons there
 * are `standard` unless they set a `variant`, and show their name as a tooltip. The viewer
 * is shown in the dark colour scheme, so the menu matches it.
 */
export function MediaViewerActions() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="tonal" onPress={() => setOpen(true)}>
        Voir les photos
      </Button>
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {chosen ? `Chosen: ${chosen}` : 'Open the menu in the viewer’s top bar.'}
      </p>
      <MediaViewer
        aria-label="Photos de Sam"
        items={SAMPLE_PHOTOS}
        open={open}
        onOpenChange={setOpen}
        labels={LABELS_FR}
        actions={
          <MenuTrigger>
            <IconButton icon={<MoreVertIcon />} aria-label="Plus d’options" />
            <Menu aria-label="Plus d’options" onAction={(key) => setChosen(String(key))}>
              <MenuItem key="open-post">Ouvrir la publication</MenuItem>
              <MenuItem key="download">Télécharger</MenuItem>
            </Menu>
          </MenuTrigger>
        }
      />
    </div>
  );
}
