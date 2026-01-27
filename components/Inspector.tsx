import React from 'react';
import { BookmarkItem } from '../types';
import { LinkIcon } from './Icons';

interface InspectorProps {
  items: Record<string, BookmarkItem>;
  selectedIds: Set<string>;
  onUpdate: (id: string, updates: Partial<BookmarkItem>) => void;
  onClose: () => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
  '#f43f5e', '#64748b'
];

export const Inspector = ({ items, selectedIds, onUpdate, onClose }: InspectorProps) => {
  if (selectedIds.size === 0) return null;

  // For multi-select, we usually just edit the first one or show a summary. 
  // Let's stick to single edit for simplicity, or just take the first.
  const firstId = Array.from(selectedIds)[0];
  const item = items[firstId];

  if (!item) return null;

  const isFolder = item.type === 'folder';

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-white/10 flex flex-col shadow-xl z-20">
      <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/5">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Properties</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Cover Image Preview */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</label>
          <div className={`
            w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 
            border border-gray-200 dark:border-white/10 relative group
            ${!item.cover ? 'flex items-center justify-center' : ''}
          `}>
            {item.cover ? (
              <img src={item.cover} alt="Cover" className="w-full h-full object-cover" />
            ) : (
                <span className="text-4xl text-gray-300 dark:text-gray-600 select-none">
                    {item.title.charAt(0).toUpperCase()}
                </span>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <label className="cursor-pointer bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/30 transition">
                    Change
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) {
                                const url = URL.createObjectURL(file);
                                onUpdate(item.id, { cover: url });
                            }
                        }}
                    />
                 </label>
            </div>
          </div>
          <div className="flex gap-2">
             <input 
                type="text" 
                placeholder="Paste image URL..." 
                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                onBlur={(e) => {
                    if(e.target.value) onUpdate(item.id, { cover: e.target.value });
                }}
             />
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
            <input 
              type="text" 
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {!isFolder && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="text" 
                    value={item.url || ''}
                    onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                    className="w-full pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-blue-600 dark:text-blue-400 font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color Accent</label>
          <div className="grid grid-cols-6 gap-2">
             {COLORS.map(color => (
                <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${item.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onUpdate(item.id, { color })}
                />
             ))}
             <button
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${!item.color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                onClick={() => onUpdate(item.id, { color: undefined })}
             >
                <span className="w-full h-[2px] bg-red-400 rotate-45 transform"></span>
             </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900 dark:text-gray-200 capitalize">{item.type}</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900 dark:text-gray-200">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
             <div className="flex justify-between text-xs">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-400 font-mono text-[10px]">{item.id.slice(0, 8)}...</span>
            </div>
        </div>
      </div>
    </div>
  );
};
