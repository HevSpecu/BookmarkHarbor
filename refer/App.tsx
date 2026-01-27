import React, { useState, useEffect, useCallback } from 'react';
import { AppState, BookmarkItem, ViewMode, Theme } from './types';
import { Sidebar } from './components/Sidebar';
import { Inspector } from './components/Inspector';
import { 
  GridIcon, ListIcon, SearchIcon, MoonIcon, SunIcon, 
  PlusIcon, SidebarIcon, FolderIcon, FileIcon, UploadIcon, TrashIcon
} from './components/Icons';

// Initial Mock Data
const INITIAL_DATA: Record<string, BookmarkItem> = {
  'root': { id: 'root', type: 'folder', title: 'All Bookmarks', parentId: null, children: ['folder-design', 'folder-dev', 'link-google'], createdAt: Date.now() },
  'folder-design': { id: 'folder-design', type: 'folder', title: 'Design Inspiration', parentId: 'root', children: ['link-dribbble', 'link-behance', 'link-awwwards'], createdAt: Date.now(), color: '#f43f5e' },
  'folder-dev': { id: 'folder-dev', type: 'folder', title: 'Development', parentId: 'root', children: ['link-github', 'link-stackoverflow', 'folder-react'], createdAt: Date.now(), color: '#3b82f6' },
  'folder-react': { id: 'folder-react', type: 'folder', title: 'React Ecosystem', parentId: 'folder-dev', children: ['link-react', 'link-tailwind'], createdAt: Date.now(), color: '#06b6d4' },
  'link-google': { id: 'link-google', type: 'bookmark', title: 'Google', url: 'https://google.com', parentId: 'root', children: [], createdAt: Date.now() },
  'link-dribbble': { id: 'link-dribbble', type: 'bookmark', title: 'Dribbble', url: 'https://dribbble.com', parentId: 'folder-design', children: [], createdAt: Date.now(), cover: 'https://cdn.dribbble.com/assets/dribbble-ball-icon-4e54c54ee8fcd27413e2775f5428805915594d7f1541b06b986e3881791882dd.png', color: '#ea4c89' },
  'link-behance': { id: 'link-behance', type: 'bookmark', title: 'Behance', url: 'https://behance.net', parentId: 'folder-design', children: [], createdAt: Date.now(), color: '#1769ff' },
  'link-awwwards': { id: 'link-awwwards', type: 'bookmark', title: 'Awwwards', url: 'https://awwwards.com', parentId: 'folder-design', children: [], createdAt: Date.now() },
  'link-github': { id: 'link-github', type: 'bookmark', title: 'GitHub', url: 'https://github.com', parentId: 'folder-dev', children: [], createdAt: Date.now(), color: '#24292e' },
  'link-stackoverflow': { id: 'link-stackoverflow', type: 'bookmark', title: 'Stack Overflow', url: 'https://stackoverflow.com', parentId: 'folder-dev', children: [], createdAt: Date.now(), color: '#f48024' },
  'link-react': { id: 'link-react', type: 'bookmark', title: 'React Docs', url: 'https://react.dev', parentId: 'folder-react', children: [], createdAt: Date.now(), color: '#61dafb' },
  'link-tailwind': { id: 'link-tailwind', type: 'bookmark', title: 'Tailwind CSS', url: 'https://tailwindcss.com', parentId: 'folder-react', children: [], createdAt: Date.now(), color: '#38bdf8' },
};

function App() {
  const [items, setItems] = useState<Record<string, BookmarkItem>>(INITIAL_DATA);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder-design', 'folder-dev']));
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>('dark');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Theme Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Actions
  const handleCreate = (type: 'folder' | 'bookmark') => {
    const newId = `${type}-${Date.now()}`;
    const newItem: BookmarkItem = {
      id: newId,
      type,
      title: type === 'folder' ? 'New Folder' : 'New Bookmark',
      parentId: currentFolderId,
      children: [],
      createdAt: Date.now(),
      url: type === 'bookmark' ? 'https://' : undefined
    };

    setItems(prev => {
      const parent = prev[currentFolderId];
      return {
        ...prev,
        [currentFolderId]: {
          ...parent,
          children: [...parent.children, newId]
        },
        [newId]: newItem
      };
    });
    setSelectedIds(new Set([newId]));
    setInspectorOpen(true);
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;

    setItems(prev => {
      const next = { ...prev };
      
      // Remove ids from their parents
      const idsToDelete = Array.from(selectedIds);
      
      // Naive recursive delete not implemented for brevity, just unlinking
      idsToDelete.forEach(id => {
        const item = next[id];
        if (item && item.parentId && next[item.parentId]) {
           const parent = next[item.parentId];
           next[item.parentId] = {
               ...parent,
               children: parent.children.filter(childId => childId !== id)
           };
        }
        delete next[id];
      });
      return next;
    });
    setSelectedIds(new Set());
  };

  const handleUpdate = (id: string, updates: Partial<BookmarkItem>) => {
    setItems(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (draggedId: string, targetId: string) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    
    // Don't drop into self or children (cycle check skipped for simplicity but important in prod)
    if (items[targetId].type !== 'folder') return; 

    setItems(prev => {
      const draggedItem = prev[draggedId];
      const oldParent = prev[draggedItem.parentId!];
      const newParent = prev[targetId];

      if (!oldParent || !newParent) return prev;

      return {
        ...prev,
        [oldParent.id]: {
          ...oldParent,
          children: oldParent.children.filter(cid => cid !== draggedId)
        },
        [newParent.id]: {
          ...newParent,
          children: [...newParent.children, draggedId]
        },
        [draggedId]: {
          ...draggedItem,
          parentId: targetId
        }
      };
    });
    setDraggingId(null);
  };

  const currentFolder = items[currentFolderId];
  
  // Filtering logic
  const visibleChildIds = searchQuery 
    ? Object.keys(items).filter(k => 
        items[k].title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        k !== 'root'
      )
    : currentFolder?.children || [];

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Top Navigation */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-4 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SidebarIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <span 
                className="cursor-pointer hover:text-blue-500"
                onClick={() => setCurrentFolderId('root')}
             >
                 All Bookmarks
             </span>
             {currentFolderId !== 'root' && (
                 <>
                    <span className="text-gray-300">/</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{items[currentFolderId]?.title}</span>
                 </>
             )}
          </div>
        </div>

        <div className="flex max-w-lg flex-1 px-8">
           <div className="relative w-full group">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                 type="text" 
                 placeholder="Search bookmarks..." 
                 className="h-9 w-full rounded-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 text-sm outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all dark:text-white"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                >
                    <GridIcon className="h-4 w-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                >
                    <ListIcon className="h-4 w-4" />
                </button>
            </div>
            <button 
                onClick={() => setInspectorOpen(!inspectorOpen)}
                className={`rounded-lg p-2 transition-colors ${inspectorOpen ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <SidebarIcon className="h-5 w-5 rotate-180" />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
            <Sidebar 
                items={items}
                rootId="root"
                currentFolderId={currentFolderId}
                expandedFolders={expandedFolders}
                onFolderClick={setCurrentFolderId}
                onToggleExpand={(id, e) => {
                    e.stopPropagation();
                    setExpandedFolders(prev => {
                        const next = new Set(prev);
                        if(next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                    });
                }}
                onDrop={handleDrop}
            />
        )}

        <main className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleCreate('folder')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New Folder
                    </button>
                    <button 
                         onClick={() => handleCreate('bookmark')}
                         className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New Bookmark
                    </button>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white" title="Import HTML">
                        <UploadIcon className="h-5 w-5" />
                    </button>
                    {selectedIds.size > 0 && (
                        <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600" title="Delete Selected">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid/List */}
            <div 
                className="flex-1 overflow-y-auto p-6"
                onClick={() => setSelectedIds(new Set())}
            >
                {visibleChildIds.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                        <FolderIcon className="h-16 w-16 mb-4 stroke-1" />
                        <p>No bookmarks found</p>
                    </div>
                ) : (
                    <div className={
                        viewMode === 'grid' 
                        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        : "flex flex-col gap-1"
                    }>
                        {visibleChildIds.map(childId => {
                            const item = items[childId];
                            if(!item) return null;
                            const isSelected = selectedIds.has(item.id);
                            
                            return (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item.id)}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (item.type === 'folder') e.currentTarget.classList.add('ring-2', 'ring-blue-500');
                                    }}
                                    onDragLeave={(e) => e.currentTarget.classList.remove('ring-2', 'ring-blue-500')}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
                                        const sourceId = e.dataTransfer.getData('text/plain');
                                        handleDrop(sourceId, item.id);
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if(e.metaKey || e.ctrlKey) {
                                            setSelectedIds(prev => {
                                                const next = new Set(prev);
                                                if(next.has(item.id)) next.delete(item.id);
                                                else next.add(item.id);
                                                return next;
                                            });
                                        } else {
                                            setSelectedIds(new Set([item.id]));
                                            setInspectorOpen(true);
                                        }
                                    }}
                                    onDoubleClick={() => {
                                        if(item.type === 'folder') {
                                            setCurrentFolderId(item.id);
                                            setSearchQuery('');
                                        } else if(item.url) {
                                            window.open(item.url, '_blank');
                                        }
                                    }}
                                    className={`
                                        group relative rounded-xl border transition-all cursor-pointer overflow-hidden
                                        ${isSelected 
                                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                                        ${viewMode === 'grid' ? 'aspect-[4/3] flex flex-col p-0 bg-gray-50 dark:bg-gray-800/50' : 'flex items-center p-2 h-12 bg-transparent'}
                                    `}
                                >
                                    {/* Grid View Content */}
                                    {viewMode === 'grid' && (
                                        <>
                                            <div className={`
                                                flex-1 w-full bg-cover bg-center bg-no-repeat relative
                                                ${item.type === 'folder' ? 'p-6 flex items-center justify-center' : ''}
                                            `}
                                                style={{
                                                    backgroundColor: item.type === 'folder' ? 'transparent' : (item.color || '#e2e8f0'),
                                                    backgroundImage: item.cover ? `url(${item.cover})` : 'none'
                                                }}
                                            >
                                                 {item.type === 'folder' && !item.cover && (
                                                     <FolderIcon className="w-16 h-16 text-blue-200 dark:text-blue-900" style={{ color: item.color }} />
                                                 )}
                                                 {!item.cover && item.type === 'bookmark' && (
                                                     <div className="absolute inset-0 flex items-center justify-center text-white/50 text-4xl font-bold uppercase">
                                                         {item.title.charAt(0)}
                                                     </div>
                                                 )}
                                                 
                                                 {/* Overlay for grid item options */}
                                                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <div className={`p-1 rounded-full bg-black/20 backdrop-blur-sm text-white ${isSelected ? 'block opacity-100' : ''}`}>
                                                         {isSelected && <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />}
                                                     </div>
                                                 </div>
                                            </div>
                                            <div className="h-10 px-3 flex items-center bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-white/5">
                                                <div className="mr-2">
                                                    {item.type === 'folder' 
                                                        ? <FolderIcon className="w-4 h-4 text-blue-500" />
                                                        : <FileIcon className="w-4 h-4 text-gray-400" />
                                                    }
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{item.title}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* List View Content */}
                                    {viewMode === 'list' && (
                                        <>
                                            <div className="w-8 flex items-center justify-center">
                                                {item.type === 'folder' 
                                                    ? <FolderIcon className="w-5 h-5 text-blue-500" style={{ color: item.color }} />
                                                    : <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700" style={{ backgroundColor: item.color }} />
                                                }
                                            </div>
                                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate ml-3 font-medium">{item.title}</span>
                                            <span className="text-xs text-gray-400 hidden md:block w-32 truncate">{item.url || `${item.children.length} items`}</span>
                                            <span className="text-xs text-gray-400 hidden lg:block w-24 text-right">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>

        {inspectorOpen && (
            <Inspector 
                items={items} 
                selectedIds={selectedIds}
                onUpdate={handleUpdate}
                onClose={() => setInspectorOpen(false)}
            />
        )}
      </div>
    </div>
  );
}

export default App;
