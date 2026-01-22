
import React, { useState } from 'react';
import { Circle, CheckCircle2, Trash2, Plus, Sparkles, Loader2, X } from 'lucide-react';
import { Task, Subtask } from '../types';
import { generateSubtasksForTask } from '../geminiService';

interface TaskItemProps {
  task: Task;
  categoryName: string;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, categoryName, onUpdate, onDelete }) => {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTask = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  const toggleSubtask = (subId: string) => {
    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
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

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    try {
      const suggestions = await generateSubtasksForTask(task.name, categoryName);
      if (suggestions.length > 0) {
        const newSubs: Subtask[] = suggestions.map((name, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          name,
          completed: false
        }));
        onUpdate({ ...task, subtasks: [...task.subtasks, ...newSubs] });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const subtasksCompleted = task.subtasks.filter(s => s.completed).length;
  const subtasksTotal = task.subtasks.length;
  const isDone = task.completed || (subtasksTotal > 0 && subtasksCompleted === subtasksTotal);

  return (
    <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
      isDone ? 'border-indigo-50 shadow-sm opacity-90' : 'border-slate-100 shadow-md hover:shadow-xl hover:border-indigo-100'
    }`}>
      {/* Task Header */}
      <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-50">
        <div className="flex items-start gap-3">
          <button 
            onClick={toggleTask}
            className={`mt-1 shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
          >
            {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>
          <div>
            <h3 className={`font-bold text-lg leading-tight transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {task.name}
            </h3>
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

      {/* Subtasks Section - Always Expanded */}
      <div className="bg-slate-50/50 p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtasks checklist</span>
          <button 
            onClick={handleAiSuggest}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI AUTO-GENERATE
          </button>
        </div>

        <div className="space-y-2">
          {task.subtasks.map((sub) => (
            <div 
              key={sub.id} 
              className="group flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => toggleSubtask(sub.id)}
              >
                {sub.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0" />
                )}
                <span className={`text-sm ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {sub.name}
                </span>
              </div>
              <button 
                onClick={() => removeSubtask(sub.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {task.subtasks.length === 0 && !isGenerating && (
            <div className="text-center py-4 text-slate-400 text-xs italic">
              No subtasks added yet
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center py-4 text-indigo-400">
               <Loader2 className="w-5 h-5 animate-spin mr-2" />
               <span className="text-xs font-medium animate-pulse">Consulting Gemini for steps...</span>
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
