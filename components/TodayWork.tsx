
import React from 'react';
import { Category, Subtask, Task } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, CheckCircle, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

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

  // Sort by todayOrder
  todaySubtasks.sort((a, b) => (a.subtask.todayOrder || 0) - (b.subtask.todayOrder || 0));

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

  const completedCount = todaySubtasks.filter(item => item.subtask.completed).length;
  const totalCount = todaySubtasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-indigo-100/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Calendar className="w-32 h-32 text-indigo-600" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Today's Focus
              {completedCount === totalCount && totalCount > 0 && (
                <Sparkles className="w-8 h-8 text-amber-400" />
              )}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Day Progress</span>
              <span className="text-lg font-bold text-indigo-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-lg shadow-indigo-200"
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
          </div>
        </div>
      </div>

      {/* Work List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-4">Scheduled for today</h3>
        
        {todaySubtasks.length > 0 ? (
          <div className="grid gap-3">
            {todaySubtasks.map(({ category, task, subtask }, index) => (
              <div 
                key={subtask.id}
                className={`group bg-white p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-5 ${
                  subtask.completed 
                    ? 'border-emerald-50 bg-emerald-50/10' 
                    : 'border-white hover:border-indigo-100 shadow-sm hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onMoveTodaySubtask(subtask.id, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:text-indigo-600 text-slate-300 disabled:opacity-0"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onMoveTodaySubtask(subtask.id, 'down')}
                    disabled={index === todaySubtasks.length - 1}
                    className="p-1 hover:text-indigo-600 text-slate-300 disabled:opacity-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={() => toggleSubtask(category.id, task.id, subtask.id)}
                  className={`shrink-0 transition-transform active:scale-90 ${
                    subtask.completed ? 'text-emerald-500' : 'text-slate-200 group-hover:text-indigo-400'
                  }`}
                >
                  {subtask.completed ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase text-white bg-${category.color}-500 shadow-sm shadow-${category.color}-100`}>
                      {category.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase truncate">
                      {task.name}
                    </span>
                  </div>
                  <h4 className={`text-lg font-bold truncate leading-tight transition-colors ${
                    subtask.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                    {subtask.name}
                  </h4>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300 bg-white rounded-3xl border border-dashed border-slate-200">
            <Clock className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">No work scheduled for today!</p>
            <p className="text-sm mt-1">Check your projects to assign some due dates.</p>
          </div>
        )}
      </div>

      {completedCount === totalCount && totalCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 animate-bounce">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <CheckCircle className="w-6 h-6" />
           </div>
           <div>
             <h4 className="text-emerald-800 font-bold">You're all caught up!</h4>
             <p className="text-emerald-600 text-sm">Every task due today has been completed. Amazing work.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default TodayWork;
