
import React, { useState, useRef, useEffect } from 'react';
import { Plus, CheckSquare, Sparkles, Loader2, ListTodo, Edit3 } from 'lucide-react';
import { Category, Task, Subtask, LayoutMode } from '../types';
import TaskItem from './TaskItem';

interface BoardProps {
  category: Category;
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onMoveTask: (categoryId: string, taskId: string, delta: number) => void;
  onMoveSubtask: (categoryId: string, taskId: string, subId: string, delta: number) => void;
  layoutMode: LayoutMode;
}

const TaskBoard: React.FC<BoardProps> = ({ 
  category, 
  categories, 
  onUpdate, 
  onRenameCategory, 
  onMoveTask,
  onMoveSubtask,
  layoutMode 
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerEditValue, setHeaderEditValue] = useState(category.name);
  const [gridCols, setGridCols] = useState(1);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingHeader && headerInputRef.current) {
      headerInputRef.current.focus();
      headerInputRef.current.select();
    }
  }, [isEditingHeader]);

  useEffect(() => {
    setHeaderEditValue(category.name);
  }, [category.id, category.name]);

  // Handle responsive column detection for precise 4-way movement
  useEffect(() => {
    const updateCols = () => {
      if (layoutMode === 'list') {
        setGridCols(1);
      } else {
        const width = window.innerWidth;
        if (width >= 1280) setGridCols(3); // xl
        else if (width >= 1024) setGridCols(2); // lg
        else setGridCols(1);
      }
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, [layoutMode]);

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskName.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
      completed: false,
      subtasks: []
    };

    const updatedCategories = categories.map(c => 
      c.id === category.id 
        ? { ...c, tasks: [...c.tasks, newTask] }
        : c
    );
    onUpdate(updatedCategories);
    setNewTaskName('');
  };

  const handleSaveHeader = () => {
    if (headerEditValue.trim() && headerEditValue !== category.name) {
      onRenameCategory(category.id, headerEditValue.trim());
    }
    setIsEditingHeader(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedCategories = categories.map(c => 
      c.id === category.id 
        ? { ...c, tasks: c.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) }
        : c
    );
    onUpdate(updatedCategories);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedCategories = categories.map(c => 
      c.id === category.id 
        ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) }
        : c
    );
    onUpdate(updatedCategories);
  };

  const completedTasksCount = category.tasks.filter(t => t.completed).length;
  const progressPercent = category.tasks.length > 0 
    ? Math.round((completedTasksCount / category.tasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Category Info & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          {isEditingHeader ? (
            <input
              ref={headerInputRef}
              type="text"
              value={headerEditValue}
              onChange={(e) => setHeaderEditValue(e.target.value)}
              onBlur={handleSaveHeader}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveHeader()}
              className="text-2xl font-bold bg-transparent border-b-2 border-indigo-400 outline-none w-full"
            />
          ) : (
            <h2 
              className="text-2xl font-bold flex items-center gap-2 group cursor-pointer"
              onClick={() => setIsEditingHeader(true)}
            >
              <div className={`w-3 h-3 rounded-full bg-${category.color}-500 shrink-0`} />
              {category.name}
              <Edit3 className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h2>
          )}
          <p className="text-slate-500 text-sm mt-1">
            {category.tasks.length} {category.tasks.length === 1 ? 'task' : 'tasks'} total • {completedTasksCount} completed
          </p>
        </div>
        
        <div className="w-full sm:w-48">
          <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-500">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-${category.color}-500 transition-all duration-500 ease-out`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAddTask} className="relative">
        <input 
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="What needs to be done? Press Enter to add..."
          className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-100 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all text-lg shadow-sm"
        />
        <button 
          type="submit"
          className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          disabled={!newTaskName.trim()}
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Tasks Grid/List */}
      {category.tasks.length > 0 ? (
        <div 
          ref={gridRef}
          className={layoutMode === 'grid' 
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "space-y-4"
          }
        >
          {category.tasks.map((task, index) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              categoryName={category.name}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onMove={(delta) => onMoveTask(category.id, task.id, delta)}
              onMoveSubtask={(subId, delta) => onMoveSubtask(category.id, task.id, subId, delta)}
              taskIndex={index}
              totalTasks={category.tasks.length}
              gridCols={gridCols}
              layoutMode={layoutMode}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl">
          <ListTodo className="w-12 h-12 mb-3 opacity-20" />
          <p>No tasks in this category. Start by adding one above!</p>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
