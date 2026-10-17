'use client';

import { DENSITIES, List, ListItem, ListItemAvatar } from '@windmorph/react';

const PEOPLE = [
  { key: 'alex', name: 'Alex Moreau', role: 'Design' },
  { key: 'priya', name: 'Priya Shah', role: 'Engineering' },
  { key: 'sam', name: 'Sam Okafor', role: 'Research' },
];

/**
 * Web density, 0 to -3 (M3: a list "can adjust margins, spacing, or density"): each step takes
 * 4px off every item (a two-line item is 72px at 0, 60px at -3) and the controls inside follow.
 * Here each list sets `density`; in an app, set it once on `ThemeProvider` from a setting.
 */
export function ListDensity() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-2">
      {DENSITIES.map((density) => (
        <div key={density} className="flex flex-col gap-2">
          <p className="text-title-small">{`Density ${density}`}</p>
          <div className="rounded-corner-extra-large bg-surface-container p-3">
            <List
              aria-label={`People, density ${density}`}
              variant="segmented"
              density={density}
              onAction={() => {}}
            >
              {PEOPLE.map(({ key, name, role }) => (
                <ListItem
                  key={key}
                  leading={<ListItemAvatar>{name[0]}</ListItemAvatar>}
                  supportingText={role}
                >
                  {name}
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      ))}
    </div>
  );
}
