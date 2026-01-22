
import React, { useState, useRef, useEffect } from 'react';
import { 
  Circle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  X, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Repeat,
  Calendar
} from 'lucide-react';
import { Task, Subtask, LayoutMode } from '../types';

interface TaskItemProps {
  task: Task;
  categoryName: string;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (delta: number) => void;
  onMoveSubtask: (subId: string, delta: number) => void;
  taskIndex: number;
  totalTasks: number;
  gridCols: number;
  layoutMode: LayoutMode;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  categoryName, 
  onUpdate, 
  onDelete, 
  onMove, 
  onMoveSubtask,
  taskIndex,
  totalTasks,
  gridCols,
  layoutMode
}) => {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [showOrderControls, setShowOrderControls] = useState(false);
  
  // Task Editing State
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskNameEditValue, setTaskNameEditValue] = useState(task.name);
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Subtask Editing State
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subNameEditValue, setSubNameEditValue] = useState('');
  const subInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTask && taskInputRef.current) {
      taskInputRef.current.focus();
      taskInputRef.current.select();
    }
  }, [isEditingTask]);

  useEffect(() => {
    if (editingSubId && subInputRef.current) {
      subInputRef.current.focus();
      subInputRef.current.select();
    }
  }, [editingSubId]);

  const handleSaveTaskName = () => {
    if (taskNameEditValue.trim() && taskNameEditValue !== task.name) {
      onUpdate({ ...task, name: taskNameEditValue.trim() });
    }
    setIsEditingTask(false);
  };

  const handleStartEditSubtask = (sub: Subtask) => {
    setEditingSubId(sub.id);
    setSubNameEditValue(sub.name);
  };

  const handleSaveSubtaskName = () => {
    if (editingSubId && subNameEditValue.trim()) {
      const updatedSubtasks = task.subtasks.map(s => 
        s.id === editingSubId ? { ...s, name: subNameEditValue.trim() } : s
      );
      onUpdate({ ...task, subtasks: updatedSubtasks });
    }
    setEditingSubId(null);
  };

  const toggleTask = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  const toggleSubtask = (subId: string) => {
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const toggleDaily = (subId: string) => {
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subId ? { ...s, isDaily: !s.isDaily } : s
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const updateSubtaskDate = (subId: string, date: string) => {
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subId ? { ...s, dueDate: date || undefined } : s
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const addSubtask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSubtaskName.trim()) return;

    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      name: newSubtaskName.trim(),
      completed: false
    };

    onUpdate({ ...task, subtasks: [...task.subtasks, newSub] });
    setNewSubtaskName('');
  };

  const removeSubtask = (subId: string) => {
    onUpdate({ ...task, subtasks: task.subtasks.filter(s => s.id !== subId) });
  };

  const subtasksCompleted = task.subtasks.filter(s => s.completed).length;
  const subtasksTotal = task.subtasks.length;
  const isDone = task.completed || (subtasksTotal > 0 && subtasksCompleted === subtasksTotal);

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div 
      className={`group relative bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
        isDone ? 'border-indigo-50 shadow-sm opacity-90' : 'border-slate-100 shadow-md hover:shadow-xl hover:border-indigo-100'
      }`}
      onMouseEnter={() => setShowOrderControls(true)}
      onMouseLeave={() => setShowOrderControls(false)}
    >
      {/* Order Controls Overlay */}
      <div className={`absolute top-2 right-12 z-10 flex gap-1 transition-opacity duration-200 ${showOrderControls ? 'opacity-100' : 'opacity-0'}`}>
        {layoutMode === 'grid' ? (
          <div className="grid grid-cols-3 grid-rows-2 bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-lg p-1">
            <div />
            <button onClick={() => onMove(-gridCols)} disabled={taskIndex < gridCols} className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
            <div />
            <button onClick={() => onMove(-1)} disabled={taskIndex % gridCols === 0} className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => onMove(gridCols)} disabled={taskIndex + gridCols >= totalTasks} className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
            <button onClick={() => onMove(1)} disabled={(taskIndex + 1) % gridCols === 0 || taskIndex >= totalTasks - 1} className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-lg p-1">
            <button onClick={() => onMove(-1)} disabled={taskIndex === 0} className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={() => onMove(1)} disabled={taskIndex === totalTasks - 1} className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Task Header */}
      <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-50">
        <div className="flex items-start gap-3 flex-1">
          <button 
            onClick={toggleTask}
            className={`mt-1 shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
          >
            {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>
          <div className="flex-1 min-w-0">
            {isEditingTask ? (
              <div className="flex items-center gap-2">
                <input
                  ref={taskInputRef}
                  type="text"
                  value={taskNameEditValue}
                  onChange={(e) => setTaskNameEditValue(e.target.value)}
                  onBlur={handleSaveTaskName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTaskName();
                    if (e.key === 'Escape') setIsEditingTask(false);
                  }}
                  className="w-full bg-slate-50 border border-indigo-200 rounded px-2 py-0.5 text-lg font-bold outline-none"
                />
              </div>
            ) : (
              <div className="group/title min-w-0">
                <h3 
                  onClick={() => setIsEditingTask(true)}
                  className={`font-bold text-lg leading-tight transition-all truncate cursor-pointer hover:text-indigo-600 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}
                >
                  {task.name}
                </h3>
              </div>
            )}
            {subtasksTotal > 0 && (
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                {subtasksCompleted} / {subtasksTotal} Subtasks Done
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Subtasks Section */}
      <div className="bg-slate-50/50 p-4 space-y-3">
        <div className="space-y-2">
          {task.subtasks.map((sub, sIdx) => (
            <div 
              key={sub.id} 
              className="group/sub bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button onClick={() => toggleSubtask(sub.id)} className="shrink-0">
                    {sub.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 group-hover/sub:text-indigo-400" />
                    )}
                  </button>
                  
                  {editingSubId === sub.id ? (
                    <input
                      ref={subInputRef}
                      type="text"
                      value={subNameEditValue}
                      onChange={(e) => setSubNameEditValue(e.target.value)}
                      onBlur={handleSaveSubtaskName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveSubtaskName();
                        if (e.key === 'Escape') setEditingSubId(null);
                      }}
                      className="flex-1 bg-slate-50 border border-indigo-200 rounded px-2 py-0.5 text-sm font-medium outline-none"
                    />
                  ) : (
                    <div className="group/subtext min-w-0">
                      <span 
                        onClick={() => handleStartEditSubtask(sub)}
                        className={`text-sm font-medium truncate cursor-pointer hover:text-indigo-600 transition-colors block ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                      >
                        {sub.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleDaily(sub.id)}
                    className={`p-1 rounded-md transition-colors ${sub.isDaily ? 'bg-indigo-100 text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}
                    title="Mark as Daily Recurring"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex flex-col">
                    <button 
                      onClick={() => onMoveSubtask(sub.id, -1)} 
                      disabled={sIdx === 0}
                      className="p-0.5 text-slate-300 hover:text-indigo-500 disabled:opacity-0"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => onMoveSubtask(sub.id, 1)} 
                      disabled={sIdx === task.subtasks.length - 1}
                      className="p-0.5 text-slate-300 hover:text-indigo-500 disabled:opacity-0"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeSubtask(sub.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subtask Meta - Due Date */}
              {!sub.isDaily && (
                <div className="mt-2 pl-7 flex items-center gap-2">
                  <div className="relative group/date flex items-center gap-1.5">
                    <Calendar className={`w-3.5 h-3.5 ${sub.dueDate ? (isToday(sub.dueDate) ? 'text-amber-500' : 'text-indigo-500') : 'text-slate-300'}`} />
                    <input 
                      type="date"
                      value={sub.dueDate || ''}
                      onChange={(e) => updateSubtaskDate(sub.id, e.target.value)}
                      className="text-[10px] font-semibold text-slate-500 bg-transparent border-none outline-none cursor-pointer hover:text-indigo-600 focus:text-indigo-600 transition-colors uppercase"
                    />
                    {sub.dueDate && isToday(sub.dueDate) && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-md font-bold uppercase animate-pulse">Today</span>
                    )}
                  </div>
                </div>
              )}
              
              {sub.isDaily && (
                <div className="mt-2 pl-7 flex items-center gap-1.5">
                   <Repeat className="w-3 h-3 text-indigo-400" />
                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Daily Recurring</span>
                </div>
              )}
            </div>
          ))}

          {task.subtasks.length === 0 && (
            <div className="text-center py-4 text-slate-400 text-xs italic">
              No subtasks added yet
            </div>
          )}
        </div>

        {/* Quick Add Subtask */}
        <form onSubmit={addSubtask} className="mt-4 flex items-center gap-2">
          <input 
            type="text"
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            placeholder="Add a step..."
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
          />
          <button 
            type="submit"
            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            disabled={!newSubtaskName.trim()}
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskItem;
