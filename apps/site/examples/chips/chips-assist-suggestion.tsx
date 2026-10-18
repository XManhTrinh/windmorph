'use client';

import { AssistChip, SuggestionChip } from '@windmorph/react';
import { useState } from 'react';
import { EditIcon } from '../../components/icons';

/**
 * Assist chips trigger a smart action (and may be a link with `href`); suggestion chips
 * offer a dynamically generated option such as a reply. `elevated` swaps the outline for a
 * tonal surface.
 */
export function ChipsAssistSuggestion() {
  const [last, setLast] = useState('none');
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        <AssistChip leadingIcon={<EditIcon />} onPress={() => setLast('Add note')}>
          Add note
        </AssistChip>
        <AssistChip elevated onPress={() => setLast('Set reminder')}>
          Set reminder
        </AssistChip>
        <SuggestionChip onPress={() => setLast('Sounds good')}>Sounds good</SuggestionChip>
        <SuggestionChip elevated onPress={() => setLast('On my way')}>
          On my way
        </SuggestionChip>
      </div>
      <p className="text-body-medium text-on-surface-variant">Last action: {last}</p>
    </div>
  );
}
