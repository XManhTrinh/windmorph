'use client';

import { IconButton } from '@windmorph/react';
import { TreeView, TreeViewItemContent, type TreeViewNode } from '@windmorph/react-pro';
import { DeleteIcon } from '../../components/icons';

interface Folder extends TreeViewNode {
  name: string;
  note?: string;
  children?: Folder[];
}

const FOLDERS: Folder[] = [
  {
    id: 'documents',
    name: 'Documents',
    note: '3 items',
    children: [
      {
        id: 'reports',
        name: 'Reports',
        children: [
          { id: 'first', name: 'First quarter' },
          { id: 'second', name: 'Second quarter' },
        ],
      },
      { id: 'notes', name: 'Notes' },
      { id: 'archive', name: 'Archive', disabled: true },
    ],
  },
  { id: 'photos', name: 'Photos' },
];

/** A row's own controls: the Right arrow reaches them. */
export function TreeViewActions() {
  return (
    <div className="w-full max-w-md">
      <TreeView<Folder>
        aria-label="Files with actions"
        items={FOLDERS}
        textValue={(folder) => folder.name}
        defaultExpandedKeys={['documents']}
      >
        {(folder) => (
          <TreeViewItemContent
            title={folder.name}
            trailing={
              <IconButton
                variant="standard"
                icon={<DeleteIcon />}
                aria-label={`Delete ${folder.name}`}
              />
            }
          />
        )}
      </TreeView>
    </div>
  );
}
