'use client';

import { Menu, MenuItem, SplitButton } from '@windmorph/react';
import { useState } from 'react';
import { SendIcon } from '../../components/icons';

/**
 * A split button pairs a leading action with a trailing button that opens a menu of
 * related actions. `menuLabel` names that trailing button; `onPress` runs the main action.
 */
export function SplitButtonBasic() {
  const [last, setLast] = useState('none');
  return (
    <div className="flex flex-col items-start gap-3">
      <SplitButton
        leadingIcon={<SendIcon />}
        menuLabel="More send options"
        onPress={() => setLast('send')}
        menu={
          <Menu onAction={(key) => setLast(String(key))}>
            <MenuItem key="later">Send later</MenuItem>
            <MenuItem key="draft">Save draft</MenuItem>
            <MenuItem key="discard">Discard</MenuItem>
          </Menu>
        }
      >
        Send
      </SplitButton>
      <p className="text-body-medium text-on-surface-variant">Last action: {last}</p>
    </div>
  );
}
