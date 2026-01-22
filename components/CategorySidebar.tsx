
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, FolderPlus, ChevronUp, ChevronDown, Calendar, Inbox } from 'lucide-react';
import { Category, ViewMode } from '../types';

interface SidebarProps {
  categories: Category[];
  activeId: string;
  viewMode: ViewMode;
  onSelect: (id: string) => void;
  onSelectToday: () => void;
  onSelectUnassigned: () => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

const CategorySidebar: React.FC<SidebarProps> = ({ 
  categories, 
  activeId, 
  viewMode,
  onSelect, 
  onSelectToday,
  onSelectUnassigned,
  onAdd, 
  onDelete, 
  onRename, 
  onMove 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(cat.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleCreateNew = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newCatName.trim()) {
      onAdd(newCatName.trim());
      setNewCatName('');
      setIsAdding(false);
    }
  };

  return (
    <aside className="w-full md:w-72 flex flex-col bg-white border-r border-slate-200 shrink-0 h-auto md:h-full max-h-[40vh] md:max-h-none overflow-hidden">
      {/* Primary Views */}
      <div className="p-4 space-y-2">
        <button
          onClick={onSelectToday}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
            viewMode === 'today' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">Today's Focus</span>
        </button>
        <button
          onClick={onSelectUnassigned}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
            viewMode === 'unassigned' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Inbox className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">Unassigned Tasks</span>
        </button>
      </div>

      <div className="px-4 py-2 flex items-center justify-between border-t border-slate-100 mt-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</span>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`p-1.5 rounded-lg transition-colors ${isAdding ? 'bg-rose-50 text-rose-600' : 'hover:bg-indigo-50 text-indigo-600'}`}
          title={isAdding ? "Cancel" : "Add Category"}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {/* Inline Add Input */}
        {isAdding && (
          <form onSubmit={handleCreateNew} className="mx-2 my-2 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-1">
            <input
              ref={addInputRef}
              type="text"
              placeholder="New project name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onBlur={() => !newCatName && setIsAdding(false)}
              className="w-full bg-white border border-indigo-200 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="flex justify-end gap-1 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button 
                type="submit" 
                disabled={!newCatName.trim()}
                className="p-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-30"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className={`group flex items-start justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              viewMode === 'category' && activeId === cat.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'hover:bg-slate-50 text-slate-600'
            }`}
            onClick={() => onSelect(cat.id)}
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full bg-${cat.color}-500 shadow-sm shrink-0 mt-1.5`} />
              
              {editingId === cat.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  className="bg-white border border-indigo-300 rounded px-1.5 py-0.5 w-full text-sm outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm font-semibold leading-relaxed break-words">{cat.name}</span>
              )}
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 ml-2 shrink-0">
              {editingId !== cat.id && (
                <>
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(cat.id, 'up');
                      }}
                      disabled={index === 0}
                      className={`p-0.5 hover:text-indigo-600 transition-colors ${index === 0 ? 'invisible' : ''}`}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(cat.id, 'down');
                      }}
                      disabled={index === categories.length - 1}
                      className={`p-0.5 hover:text-indigo-600 transition-colors ${index === categories.length - 1 ? 'invisible' : ''}`}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(cat);
                    }}
                    className="p-1 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(cat.id);
                }}
                className="p-1 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && !isAdding && (
          <div className="px-3 py-12 text-center text-slate-400 flex flex-col items-center">
            <FolderPlus className="w-10 h-10 mb-2 opacity-10" />
            <p className="text-xs font-medium">No projects yet</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 mt-auto hidden md:block">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Workspace Info</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Projects help organize your long-term goals. Use <span className="text-indigo-600 font-bold">Unassigned</span> for your backlog.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;
