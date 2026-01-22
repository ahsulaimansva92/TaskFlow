
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, FolderPlus, CheckCircle2, Circle, Sparkles, LayoutGrid, List as ListIcon, ChevronRight, LayoutDashboard, Calendar } from 'lucide-react';
import { Category, Task, Subtask, LayoutMode, ViewMode } from './types';
import CategorySidebar from './components/CategorySidebar';
import TaskBoard from './components/TaskBoard';
import TodayWork from './components/TodayWork';

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Work Project X',
    color: 'blue',
    tasks: [
      {
        id: 'task-1',
        name: 'Design System Implementation',
        completed: false,
        subtasks: [
          { id: 'sub-1', name: 'Define color palette', completed: true, dueDate: new Date().toISOString().split('T')[0], todayOrder: 0 },
          { id: 'sub-2', name: 'Create typography scales', completed: false },
          { id: 'sub-3', name: 'Build button components', completed: false }
        ]
      },
      {
        id: 'task-2',
        name: 'API Integration',
        completed: false,
        subtasks: [
          { id: 'sub-4', name: 'Setup Axios client', completed: true },
          { id: 'sub-5', name: 'Implement Auth hooks', completed: false, dueDate: new Date().toISOString().split('T')[0], todayOrder: 1 }
        ]
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Personal Growth',
    color: 'purple',
    tasks: [
      {
        id: 'task-3',
        name: 'Learning React Performance',
        completed: false,
        subtasks: [
          { id: 'sub-6', name: 'Master useMemo and useCallback', completed: false },
          { id: 'sub-7', name: 'Study React DevTools profiler', completed: false }
        ]
      }
    ]
  }
];

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('taskflow_data');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  useEffect(() => {
    localStorage.setItem('taskflow_data', JSON.stringify(categories));
  }, [categories]);

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  const handleAddCategory = (name: string) => {
    if (!name.trim()) return;
    const colors = ['blue', 'purple', 'emerald', 'amber', 'rose', 'indigo'];
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      tasks: []
    };
    setCategories(prev => [...prev, newCategory]);
    setActiveCategoryId(newCategory.id);
    setViewMode('category');
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm('Are you sure you want to delete this entire category and its tasks?')) return;
    const nextCategories = categories.filter(c => c.id !== id);
    setCategories(nextCategories);
    if (activeCategoryId === id) {
      setActiveCategoryId(nextCategories[0]?.id || '');
    }
  };

  const handleUpdateCategoryName = (id: string, newName: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    setCategories(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newCategories = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
      return newCategories;
    });
  };

  const handleMoveTask = (categoryId: string, taskId: string, delta: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      const tasks = [...cat.tasks];
      const oldIndex = tasks.findIndex(t => t.id === taskId);
      const newIndex = oldIndex + delta;
      if (newIndex < 0 || newIndex >= tasks.length) return cat;
      const [movedTask] = tasks.splice(oldIndex, 1);
      tasks.splice(newIndex, 0, movedTask);
      return { ...cat, tasks };
    }));
  };

  const handleMoveSubtask = (categoryId: string, taskId: string, subId: string, delta: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      const tasks = cat.tasks.map(task => {
        if (task.id !== taskId) return task;
        const subtasks = [...task.subtasks];
        const oldIndex = subtasks.findIndex(s => s.id === subId);
        const newIndex = oldIndex + delta;
        if (newIndex < 0 || newIndex >= subtasks.length) return task;
        const [movedSub] = subtasks.splice(oldIndex, 1);
        subtasks.splice(newIndex, 0, movedSub);
        return { ...task, subtasks };
      });
      return { ...cat, tasks };
    }));
  };

  const handleMoveTodaySubtask = (subId: string, direction: 'up' | 'down') => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Extract all subtasks due today
    let todayItems: { subId: string, todayOrder: number }[] = [];
    categories.forEach(cat => {
      cat.tasks.forEach(task => {
        task.subtasks.forEach(sub => {
          if (sub.dueDate === today) {
            todayItems.push({ subId: sub.id, todayOrder: sub.todayOrder ?? 9999 });
          }
        });
      });
    });

    // 2. Sort current items to establish a normalized baseline
    todayItems.sort((a, b) => a.todayOrder - b.todayOrder);

    // 3. Find the index of the subtask we want to move
    const index = todayItems.findIndex(item => item.subId === subId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === todayItems.length - 1) return;

    // 4. Perform the swap in our local reference array
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [todayItems[index], todayItems[targetIndex]] = [todayItems[targetIndex], todayItems[index]];

    // 5. Create a map of the new order
    const orderMap = new Map();
    todayItems.forEach((item, idx) => {
      orderMap.set(item.subId, idx);
    });

    // 6. Update global state
    setCategories(prev => prev.map(cat => ({
      ...cat,
      tasks: cat.tasks.map(task => ({
        ...task,
        subtasks: task.subtasks.map(sub => {
          if (orderMap.has(sub.id)) {
            return { ...sub, todayOrder: orderMap.get(sub.id) };
          }
          return sub;
        })
      }))
    })));
  };

  const updateCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <CategorySidebar 
        categories={categories}
        activeId={activeCategoryId}
        viewMode={viewMode}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setViewMode('category');
        }}
        onSelectToday={() => setViewMode('today')}
        onAdd={handleAddCategory}
        onDelete={handleDeleteCategory}
        onRename={handleUpdateCategoryName}
        onMove={handleMoveCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-800">TaskFlow Pro</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${layoutMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded-md transition-all ${layoutMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
             </div>
          </div>
        </header>

        {/* View Selection */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {viewMode === 'today' ? (
            <TodayWork 
              categories={categories} 
              onUpdate={updateCategories}
              onMoveTodaySubtask={handleMoveTodaySubtask}
            />
          ) : activeCategory ? (
            <TaskBoard 
              category={activeCategory} 
              categories={categories}
              onUpdate={updateCategories}
              onRenameCategory={handleUpdateCategoryName}
              onMoveTask={handleMoveTask}
              onMoveSubtask={handleMoveSubtask}
              layoutMode={layoutMode}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FolderPlus className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg mb-6 text-center">Select or create a category to get started</p>
              <button 
                onClick={() => {
                   const name = window.prompt("Enter your first project name:");
                   if(name) handleAddCategory(name);
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                Create New Project
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
