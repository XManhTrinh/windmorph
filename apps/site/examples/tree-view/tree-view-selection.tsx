'use client';

import { TreeView, TreeViewItemContent, type TreeViewNode } from '@windmorph/react-pro';

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

/** Rows that open and fold, with a checkbox on each in `selectionMode="multiple"`. */
export function TreeViewSelection() {
  return (
    <div className="w-full max-w-md">
      <TreeView<Folder>
        aria-label="Files"
        items={FOLDERS}
        textValue={(folder) => folder.name}
        selectionMode="multiple"
        defaultExpandedKeys={['documents', 'reports']}
        defaultSelectedKeys={['notes']}
      >
        {(folder) => <TreeViewItemContent title={folder.name} supportingText={folder.note} />}
      </TreeView>
    </div>
  );
}
