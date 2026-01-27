export type ItemType = 'folder' | 'bookmark';

export interface BookmarkItem {
  id: string;
  type: ItemType;
  title: string;
  url?: string;
  parentId: string | null;
  children: string[]; // Ordered list of child IDs
  cover?: string; // URL for the image
  color?: string; // Hex code or Tailwind class reference
  createdAt: number;
}

export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark';

export interface AppState {
  items: Record<string, BookmarkItem>;
  rootId: string;
  currentFolderId: string;
  selectedIds: Set<string>;
  expandedFolders: Set<string>;
  searchQuery: string;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  theme: Theme;
  inspectorOpen: boolean;
}
