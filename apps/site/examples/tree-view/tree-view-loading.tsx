'use client';

import { TreeView, TreeViewItemContent, type TreeViewNode } from '@windmorph/react-pro';
import { useState } from 'react';

interface Folder extends TreeViewNode {
  name: string;
  children?: Folder[];
}

/** Children load as a row opens; a failure offers a retry in its own row. */
export function TreeViewLoading() {
  const [items, setItems] = useState<Folder[]>([
    { id: 'remote', name: 'Remote', hasChildren: true },
    { id: 'offline', name: 'Offline', hasChildren: true },
  ]);
  return (
    <div className="w-full max-w-md">
      <TreeView<Folder>
        aria-label="Remote files"
        items={items}
        textValue={(folder) => folder.name}
        onLoadChildren={async (key) => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          if (key === 'offline') throw new Error('Offline');
          setItems((current) =>
            current.map((item) =>
              item.id === key ? { ...item, children: [{ id: 'report', name: 'Report' }] } : item,
            ),
          );
        }}
      >
        {(folder) => <TreeViewItemContent title={folder.name} />}
      </TreeView>
    </div>
  );
}
