
import React, { useState, useRef, useEffect } from 'react';
import { Category, Subtask, Task } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, Sparkles, ArrowUp, ArrowDown, Repeat, Edit2 } from 'lucide-react';

interface TodayWorkProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
  onMoveTodaySubtask: (subId: string, direction: 'up' | 'down') => void;
}

const TodayWork: React.FC<TodayWorkProps> = ({ categories, onUpdate, onMoveTodaySubtask }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Local state for editing subtasks in Today view
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
    isDaily: boolean;
    isCompletedToday: boolean;
  }

  // Flatten and separate daily and one-off subtasks
  let dailyTasks: FlatItem[] = [];
  let scheduledTasks: FlatItem[] = [];

  categories.forEach(cat => {
    cat.tasks.forEach(task => {
      task.subtasks.forEach(sub => {
        const item: FlatItem = {
          category: cat,
          task,
          subtask: sub,
          isDaily: !!sub.isDaily,
          isCompletedToday: sub.isDaily 
            ? sub.lastCompletedDate === today
            : (!!sub.completed && sub.dueDate === today)
        };

        if (sub.isDaily) {
          dailyTasks.push(item);
        } else if (sub.dueDate === today) {
          scheduledTasks.push(item);
        }
      });
    });
  });

  // Sort scheduled by completion status THEN todayOrder
  scheduledTasks.sort((a, b) => {
    if (a.isCompletedToday !== b.isCompletedToday) return a.isCompletedToday ? 1 : -1;
    return (a.subtask.todayOrder ?? 999) - (b.subtask.todayOrder ?? 999);
  });

  // Sort daily tasks by completion status as well
  dailyTasks.sort((a, b) => a.isCompletedToday === b.isCompletedToday ? 0 : (a.isCompletedToday ? 1 : -1));

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

  const toggleTodayItem = (catId: string, taskId: string, subId: string, isDaily: boolean) => {
    const nextCategories = categories.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        tasks: c.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: t.subtasks.map(s => {
              if (s.id !== subId) return s;
              
              if (isDaily) {
                const wasCompleted = s.lastCompletedDate === today;
                return { 
                  ...s, 
                  lastCompletedDate: wasCompleted ? undefined : today,
                  completed: !wasCompleted 
                };
              } else {
                return { ...s, completed: !s.completed };
              }
            })
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

  const allItems = [...dailyTasks, ...scheduledTasks];
  const completedCount = allItems.filter(item => item.isCompletedToday).length;
  const totalCount = allItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const renderTaskItem = (item: FlatItem, index: number, list: FlatItem[]) => {
    const { category, task, subtask, isDaily, isCompletedToday } = item;
    
    return (
      <div 
        key={subtask.id}
        className={`group bg-white p-2 rounded-3xl border-2 transition-all duration-500 flex items-center gap-2 ${
          isCompletedToday 
            ? 'border-emerald-50 bg-emerald-50/10 opacity-60 grayscale-[0.5]' 
            : 'border-white hover:border-indigo-100 shadow-sm hover:shadow-xl'
        }`}
      >
        {/* Reorder Buttons Section (Only for scheduled) */}
        {!isDaily && (
          <div className="flex flex-col gap-1 p-2 bg-slate-50/50 rounded-2xl group-hover:bg-indigo-50/30 transition-colors">
            <button 
              onClick={() => onMoveTodaySubtask(subtask.id, 'up')}
              disabled={index === 0}
              className={`p-2 rounded-xl transition-all ${
                index === 0 ? 'text-slate-100 cursor-not-allowed' : 'text-slate-400 hover:bg-white hover:text-indigo-600'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div className="text-[10px] font-black text-slate-300 text-center select-none">{index + 1}</div>
            <button 
              onClick={() => onMoveTodaySubtask(subtask.id, 'down')}
              disabled={index === list.length - 1}
              className={`p-2 rounded-xl transition-all ${
                index === list.length - 1 ? 'text-slate-100 cursor-not-allowed' : 'text-slate-400 hover:bg-white hover:text-indigo-600'
              }`}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status Toggle */}
        <button 
          onClick={() => toggleTodayItem(category.id, task.id, subtask.id, isDaily)}
          className={`shrink-0 ml-2 transition-transform active:scale-90 ${
            isCompletedToday ? 'text-emerald-500' : 'text-slate-200 group-hover:text-indigo-400'
          }`}
        >
          <div className={`${isCompletedToday ? 'bg-emerald-100' : 'bg-slate-50 group-hover:bg-indigo-50'} rounded-2xl p-3`}>
             {isCompletedToday ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 px-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter text-white bg-${category.color}-500 shadow-sm`}>
              {category.name}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase truncate">
              {task.name}
            </span>
            {isDaily && <span className="flex items-center gap-1 text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
              <Repeat className="w-2.5 h-2.5" /> Daily
            </span>}
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
              className="w-full bg-slate-50 border border-indigo-200 rounded px-2 py-0.5 text-xl font-bold outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 group/title">
              <h4 className={`text-xl font-bold truncate tracking-tight transition-colors ${
                isCompletedToday ? 'text-slate-300 line-through' : 'text-slate-800'
              }`}>
                {subtask.name}
              </h4>
              <button 
                onClick={() => handleStartEdit(subtask)}
                className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Reschedule Control (Only for non-daily) */}
        {!isDaily && (
          <div className="shrink-0 flex items-center gap-2 pr-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Reschedule</span>
              <div className="relative flex items-center gap-1.5 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 px-3 py-1.5 rounded-xl transition-all">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <input 
                  type="date"
                  value={subtask.dueDate || today}
                  onChange={(e) => updateSubtaskDate(category.id, task.id, subtask.id, e.target.value)}
                  className="text-[10px] font-bold text-slate-600 bg-transparent border-none outline-none cursor-pointer focus:text-indigo-600 transition-colors uppercase"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-indigo-100/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
           <Calendar className="w-48 h-48 text-indigo-900" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Active Schedule</span>
              {completedCount === totalCount && totalCount > 0 && (
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> All Done
                </span>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
              Today's Focus
            </h2>
            <p className="text-slate-400 mt-4 font-medium flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="w-full md:w-72 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Completion</span>
              <span className="text-xl font-black text-indigo-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
          </div>
        </div>
      </div>

      {/* Priority Stack Section (Top) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Today's Priority Stack</h3>
          </div>
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            {scheduledTasks.length} {scheduledTasks.length === 1 ? 'Entry' : 'Entries'}
          </span>
        </div>
        
        {scheduledTasks.length > 0 ? (
          <div className="grid gap-4">
            {scheduledTasks.map((item, index) => {
              const isFirstCompleted = item.isCompletedToday && (index === 0 || !scheduledTasks[index - 1].isCompletedToday);
              return (
                <React.Fragment key={item.subtask.id}>
                  {isFirstCompleted && (
                    <div className="mt-6 mb-2 flex items-center gap-4 px-6 opacity-30">
                      <div className="h-px flex-1 bg-slate-300" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Completed Stack</span>
                      <div className="h-px flex-1 bg-slate-300" />
                    </div>
                  )}
                  {renderTaskItem(item, index, scheduledTasks)}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-slate-300 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <p className="text-sm font-bold text-slate-400">No priority tasks for today.</p>
          </div>
        )}
      </section>

      {/* Daily Recurring Habits Section (Bottom) */}
      <section className="space-y-4">
         <div className="flex items-center gap-3 px-6">
            <Repeat className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Daily Recurring Habits</h3>
         </div>
         {dailyTasks.length > 0 ? (
           <div className="grid gap-4">
              {dailyTasks.map((item, idx) => renderTaskItem(item, idx, dailyTasks))}
           </div>
         ) : (
           <div className="py-12 flex flex-col items-center justify-center text-slate-300 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
             <p className="text-sm font-bold text-slate-400">No daily habits tracked yet.</p>
           </div>
         )}
      </section>

      {/* Global Empty State */}
      {totalCount === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100">
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <Clock className="w-12 h-12 text-slate-200" />
          </div>
          <p className="text-xl font-bold text-slate-400">Your Focus is Clear</p>
          <p className="text-sm mt-1 text-slate-300 max-w-xs text-center">
            Go to your project categories and assign some subtasks a due date for today or mark them as daily habits.
          </p>
        </div>
      )}

      {/* Celebration Footer */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="bg-emerald-500 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-emerald-200 animate-in slide-in-from-top-4 duration-700">
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-8 h-8" />
           </div>
           <div className="text-center md:text-left">
             <h4 className="text-2xl font-black">Daily Objective Achieved</h4>
             <p className="text-emerald-50 text-sm font-medium opacity-90">Outstanding! You've successfully cleared both your habits and your priorities for today.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default TodayWork;
