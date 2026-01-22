
import React from 'react';
import { Category, Subtask, Task } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, CheckCircle, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

interface TodayWorkProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
  onMoveTodaySubtask: (subId: string, direction: 'up' | 'down') => void;
}

const TodayWork: React.FC<TodayWorkProps> = ({ categories, onUpdate, onMoveTodaySubtask }) => {
  const today = new Date().toISOString().split('T')[0];

  // Flatten and filter subtasks due today
  let todaySubtasks: Array<{
    category: Category;
    task: Task;
    subtask: Subtask;
  }> = [];

  categories.forEach(cat => {
    cat.tasks.forEach(task => {
      task.subtasks.forEach(sub => {
        if (sub.dueDate === today) {
          todaySubtasks.push({ category: cat, task, subtask: sub });
        }
      });
    });
  });

  // Sort by Completion Status (Incomplete first) THEN todayOrder
  todaySubtasks.sort((a, b) => {
    if (a.subtask.completed !== b.subtask.completed) {
      return a.subtask.completed ? 1 : -1;
    }
    return (a.subtask.todayOrder ?? 999) - (b.subtask.todayOrder ?? 999);
  });

  const toggleSubtask = (catId: string, taskId: string, subId: string) => {
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

  const completedCount = todaySubtasks.filter(item => item.subtask.completed).length;
  const totalCount = todaySubtasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
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
            <p className="text-slate-400 mt-4 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="w-full md:w-72 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Completion Progress</span>
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

      {/* Work List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Daily Priority Stack</h3>
          </div>
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            {todaySubtasks.length} {todaySubtasks.length === 1 ? 'Task' : 'Tasks'} Remaining
          </span>
        </div>
        
        {todaySubtasks.length > 0 ? (
          <div className="grid gap-4">
            {todaySubtasks.map(({ category, task, subtask }, index) => {
              const isFirstCompleted = subtask.completed && (index === 0 || !todaySubtasks[index - 1].subtask.completed);
              
              return (
                <React.Fragment key={subtask.id}>
                  {isFirstCompleted && (
                    <div className="mt-8 mb-4 flex items-center gap-4 px-6 opacity-40">
                      <div className="h-px flex-1 bg-slate-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Completed Tasks</span>
                      <div className="h-px flex-1 bg-slate-300" />
                    </div>
                  )}
                  
                  <div 
                    className={`group bg-white p-2 rounded-3xl border-2 transition-all duration-500 flex items-center gap-2 ${
                      subtask.completed 
                        ? 'border-emerald-50 bg-emerald-50/10 opacity-60 grayscale-[0.5]' 
                        : 'border-white hover:border-indigo-100 shadow-sm hover:shadow-xl'
                    }`}
                  >
                    {/* Reorder Buttons Section */}
                    <div className="flex flex-col gap-1 p-2 bg-slate-50/50 rounded-2xl group-hover:bg-indigo-50/30 transition-colors">
                      <button 
                        onClick={() => onMoveTodaySubtask(subtask.id, 'up')}
                        disabled={index === 0}
                        className={`p-2 rounded-xl transition-all ${
                          index === 0 
                            ? 'text-slate-100 cursor-not-allowed' 
                            : 'text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                        }`}
                        title="Move Higher"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <div className="text-[10px] font-black text-slate-300 text-center select-none">
                        {index + 1}
                      </div>
                      <button 
                        onClick={() => onMoveTodaySubtask(subtask.id, 'down')}
                        disabled={index === todaySubtasks.length - 1}
                        className={`p-2 rounded-xl transition-all ${
                          index === todaySubtasks.length - 1 
                            ? 'text-slate-100 cursor-not-allowed' 
                            : 'text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                        }`}
                        title="Move Lower"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status Toggle */}
                    <button 
                      onClick={() => toggleSubtask(category.id, task.id, subtask.id)}
                      className={`shrink-0 ml-2 transition-transform active:scale-90 ${
                        subtask.completed ? 'text-emerald-500' : 'text-slate-200 group-hover:text-indigo-400'
                      }`}
                    >
                      {subtask.completed ? (
                        <div className="bg-emerald-100 rounded-2xl p-3"><CheckCircle2 className="w-8 h-8" /></div>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl p-3 group-hover:bg-indigo-50"><Circle className="w-8 h-8" /></div>
                      )}
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
                      </div>
                      <h4 className={`text-xl font-bold truncate tracking-tight transition-colors ${
                        subtask.completed ? 'text-slate-300 line-through' : 'text-slate-800'
                      }`}>
                        {subtask.name}
                      </h4>
                    </div>

                    {/* Reschedule Control */}
                    <div className="shrink-0 flex items-center gap-2 pr-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Reschedule</span>
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
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Clock className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-xl font-bold text-slate-400">Clear Schedule!</p>
            <p className="text-sm mt-1 text-slate-300 max-w-xs text-center">
              You haven't assigned any subtasks to today. Go to your projects and set some due dates.
            </p>
          </div>
        )}
      </div>

      {/* Completion Celebration Footer */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="bg-emerald-500 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-emerald-200 animate-in slide-in-from-top-4 duration-700">
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-8 h-8" />
           </div>
           <div className="text-center md:text-left">
             <h4 className="text-2xl font-black">Daily Objective Reached</h4>
             <p className="text-emerald-50 text-sm font-medium opacity-90">Outstanding performance. You've cleared your entire priority stack for today.</p>
           </div>
           <div className="md:ml-auto">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-emerald-600 px-6 py-2 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Back to Top
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TodayWork;
