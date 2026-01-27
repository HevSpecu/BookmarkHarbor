import React from 'react';
import { BookmarkItem } from '../types';
import { FolderIcon, ChevronRightIcon, ChevronDownIcon, FileIcon } from './Icons';

interface SidebarProps {
  items: Record<string, BookmarkItem>;
  rootId: string;
  currentFolderId: string;
  expandedFolders: Set<string>;
  onFolderClick: (id: string) => void;
  onToggleExpand: (id: string, e: React.MouseEvent) => void;
  onDrop: (draggedId: string, targetId: string) => void;
}

const SidebarItem = ({
  item,
  items,
  currentFolderId,
  expandedFolders,
  onFolderClick,
  onToggleExpand,
  onDrop,
  depth = 0
}: {
  item: BookmarkItem;
  items: Record<string, BookmarkItem>;
  currentFolderId: string;
  expandedFolders: Set<string>;
  onFolderClick: (id: string) => void;
  onToggleExpand: (id: string, e: React.MouseEvent) => void;
  onDrop: (draggedId: string, targetId: string) => void;
  depth?: number;
}) => {
  const isExpanded = expandedFolders.has(item.id);
  const isActive = currentFolderId === item.id;
  const hasChildren = item.children.length > 0;
  
  // Basic drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-100', 'dark:bg-blue-900');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-100', 'dark:bg-blue-900');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-blue-100', 'dark:bg-blue-900');
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== item.id) {
        onDrop(draggedId, item.id);
    }
  };

  if (item.type !== 'folder') return null;

  return (
    <div>
      <div
        className={`
          group flex items-center py-1.5 px-2 cursor-pointer select-none rounded-lg text-sm transition-colors
          ${isActive 
            ? 'bg-white shadow-sm dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onFolderClick(item.id)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className="p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id, e);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />
          ) : <div className="w-3 h-3" />}
        </div>
        
        <FolderIcon className={`w-4 h-4 mr-2 ${item.color ? '' : (isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500')}`} style={{ color: item.color }} />
        <span className="truncate">{item.title}</span>
      </div>

      {isExpanded && item.children.map(childId => {
        const child = items[childId];
        if (child?.type === 'folder') {
            return (
                <SidebarItem
                    key={child.id}
                    item={child}
                    items={items}
                    currentFolderId={currentFolderId}
                    expandedFolders={expandedFolders}
                    onFolderClick={onFolderClick}
                    onToggleExpand={onToggleExpand}
                    onDrop={onDrop}
                    depth={depth + 1}
                />
            );
        }
        return null;
      })}
    </div>
  );
};

export const Sidebar = (props: SidebarProps) => {
  const rootItem = props.items[props.rootId];

  return (
    <div className="w-64 flex flex-col h-full border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-950/50">
      <div className="flex-1 overflow-y-auto p-3">
        {rootItem && (
            <div className="flex flex-col gap-0.5">
             {/* Root is usually hidden or "All Bookmarks", let's render children of root */}
             {rootItem.children.map(childId => {
                 const child = props.items[childId];
                 if(child) {
                    return (
                        <SidebarItem
                            key={childId}
                            item={child}
                            {...props}
                        />
                    )
                 }
                 return null;
             })}
            </div>
        )}
      </div>
    </div>
  );
};
