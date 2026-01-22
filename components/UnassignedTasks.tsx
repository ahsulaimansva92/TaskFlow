
import React, { useState, useRef, useEffect } from 'react';
import { Category, Subtask, Task } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, Sparkles, Inbox, Edit2, Repeat, Trash2 } from 'lucide-react';

interface UnassignedTasksProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
}

const UnassignedTasks: React.FC<UnassignedTasksProps> = ({ categories, onUpdate }) => {
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subNameEditValue, setSubNameEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSubId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSubId]);

  interface FlatItem {
    category: Category;
    task: Task;
    subtask: Subtask;
  }

  // Find all subtasks without a date and not daily
  let unassignedSubtasks: FlatItem[] = [];
  categories.forEach(cat => {
    cat.tasks.forEach(task => {
      task.subtasks.forEach(sub => {
        if (!sub.isDaily && !sub.dueDate) {
          unassignedSubtasks.push({ category: cat, task, subtask: sub });
        }
      });
    });
  });

  // Sort: Incomplete first, then by category/task
  unassignedSubtasks.sort((a, b) => {
    if (a.subtask.completed !== b.subtask.completed) {
      return a.subtask.completed ? 1 : -1;
    }
    return a.category.name.localeCompare(b.category.name);
  });

  const handleStartEdit = (sub: Subtask) => {
    setEditingSubId(sub.id);
    setSubNameEditValue(sub.name);
  };

  const handleSaveSubName = (catId: string, taskId: string, subId: string) => {
    if (subNameEditValue.trim()) {
      const nextCategories = categories.map(c => {
        if (c.id !== catId) return c;
        return {
          ...c,
          tasks: c.tasks.map(t => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: t.subtasks.map(s => 
                s.id === subId ? { ...s, name: subNameEditValue.trim() } : s
              )
            };
          })
        };
      });
      onUpdate(nextCategories);
    }
    setEditingSubId(null);
  };

  const toggleCompletion = (catId: string, taskId: string, subId: string) => {
    const nextCategories = categories.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        tasks: c.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: t.subtasks.map(s => 
              s.id === subId ? { ...s, completed: !s.completed } : s
            )
          };
        })
      };
    });
    onUpdate(nextCategories);
  };

  const updateSubtaskDate = (catId: string, taskId: string, subId: string, newDate: string) => {
    const nextCategories = categories.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        tasks: c.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: t.subtasks.map(s => 
              s.id === subId ? { ...s, dueDate: newDate || undefined } : s
            )
          };
        })
      };
    });
    onUpdate(nextCategories);
  };

  const markDaily = (catId: string, taskId: string, subId: string) => {
    const nextCategories = categories.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        tasks: c.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: t.subtasks.map(s => 
              s.id === subId ? { ...s, isDaily: true } : s
            )
          };
        })
      };
    });
    onUpdate(nextCategories);
  };

  const deleteSubtask = (catId: string, taskId: string, subId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    const nextCategories = categories.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        tasks: c.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: t.subtasks.filter(s => s.id !== subId)
          };
        })
      };
    });
    onUpdate(nextCategories);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
           <Inbox className="w-48 h-48 text-slate-900" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Inbox className="w-3 h-3" /> Backlog Queue
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
            Unassigned Tasks
          </h2>
          <p className="text-slate-400 mt-4 max-w-lg">
            Subtasks that are not yet scheduled for a specific day and aren't recurring. Set a due date to move them to Today's Focus.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {unassignedSubtasks.length > 0 ? (
          <div className="grid gap-4">
            {unassignedSubtasks.map(({ category, task, subtask }, index) => {
              const isFirstCompleted = subtask.completed && (index === 0 || !unassignedSubtasks[index - 1].subtask.completed);
              
              return (
                <React.Fragment key={subtask.id}>
                  {isFirstCompleted && (
                    <div className="mt-8 mb-4 flex items-center gap-4 px-6 opacity-30">
                      <div className="h-px flex-1 bg-slate-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Completed Backlog</span>
                      <div className="h-px flex-1 bg-slate-300" />
                    </div>
                  )}
                  
                  <div className={`group bg-white p-4 rounded-3xl border-2 transition-all duration-300 flex items-center gap-4 ${
                    subtask.completed ? 'border-slate-50 bg-slate-50/30 opacity-60' : 'border-white hover:border-indigo-100 shadow-sm hover:shadow-lg'
                  }`}>
                    {/* Status Toggle */}
                    <button 
                      onClick={() => toggleCompletion(category.id, task.id, subtask.id)}
                      className={`shrink-0 transition-transform active:scale-90 ${
                        subtask.completed ? 'text-emerald-500' : 'text-slate-200 group-hover:text-indigo-400'
                      }`}
                    >
                      <div className={`${subtask.completed ? 'bg-emerald-50' : 'bg-slate-50 group-hover:bg-indigo-50'} rounded-2xl p-2.5`}>
                         {subtask.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                      </div>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter text-white bg-${category.color}-500 shadow-sm`}>
                          {category.name}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase truncate">
                          {task.name}
                        </span>
                      </div>
                      
                      {editingSubId === subtask.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={subNameEditValue}
                          onChange={(e) => setSubNameEditValue(e.target.value)}
                          onBlur={() => handleSaveSubName(category.id, task.id, subtask.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveSubName(category.id, task.id, subtask.id);
                            if (e.key === 'Escape') setEditingSubId(null);
                          }}
                          className="w-full bg-slate-50 border border-indigo-200 rounded px-2 py-1 text-lg font-bold outline-none"
                        />
                      ) : (
                        <div className="group/title min-w-0">
                          <h4 
                            onClick={() => handleStartEdit(subtask)}
                            className={`text-lg font-bold truncate tracking-tight transition-colors cursor-pointer hover:text-indigo-600 ${
                              subtask.completed ? 'text-slate-300 line-through' : 'text-slate-800'
                            }`}
                          >
                            {subtask.name}
                          </h4>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                      {/* Daily Trigger */}
                      <button 
                        onClick={() => markDaily(category.id, task.id, subtask.id)}
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Mark as Daily Recurring"
                      >
                        <Repeat className="w-4 h-4" />
                      </button>

                      {/* Date Assign */}
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Assign Date</span>
                        <div className="relative flex items-center gap-1.5 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 px-3 py-1.5 rounded-xl transition-all">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <input 
                            type="date"
                            value=""
                            onChange={(e) => updateSubtaskDate(category.id, task.id, subtask.id, e.target.value)}
                            className="text-[10px] font-bold text-slate-600 bg-transparent border-none outline-none cursor-pointer focus:text-indigo-600 transition-colors uppercase"
                          />
                        </div>
                      </div>

                      {/* Delete */}
                      <button 
                        onClick={() => deleteSubtask(category.id, task.id, subtask.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Inbox className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-xl font-bold text-slate-400">Backlog is empty</p>
            <p className="text-sm mt-1 text-slate-300 max-w-xs text-center">
              All your tasks are either scheduled or recurring. Great job maintaining the flow!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnassignedTasks;
