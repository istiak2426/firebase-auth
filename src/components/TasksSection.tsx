import React from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Calendar,
  Trash2,
  Edit3,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface TasksSectionProps {
  tasks: Task[];
  searchQuery: string;
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateStatus: (task: Task, newStatus: TaskStatus) => void;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  searchQuery,
  onOpenNewTask,
  onEditTask,
  onDeleteTask,
  onUpdateStatus,
}) => {
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <Flag className="w-3 h-3 fill-current" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <Flag className="w-3 h-3" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <Flag className="w-3 h-3" /> Low
          </span>
        );
    }
  };

  const renderTaskCard = (task: Task) => {
    const isDone = task.status === 'completed';

    return (
      <div
        key={task.id}
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group ${
          isDone ? 'opacity-70 dark:opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start space-x-2.5 flex-1 min-w-0">
            <button
              onClick={() =>
                onUpdateStatus(task, isDone ? 'todo' : 'completed')
              }
              className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
              title={isDone ? 'Mark as todo' : 'Mark as completed'}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
              ) : (
                <Circle className="w-5 h-5 hover:text-indigo-500" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h4
                className={`text-sm font-semibold text-slate-900 dark:text-white break-words ${
                  isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}
              >
                {task.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEditTask(task)}
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteTask(task)}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 ml-7 mb-3 whitespace-pre-line line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Badges row */}
        <div className="ml-7 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {getPriorityBadge(task.priority)}

          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{task.dueDate}</span>
            </span>
          )}

          {task.tags &&
            task.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800"
              >
                #{tag}
              </span>
            ))}
        </div>

        {/* Workflow state action buttons */}
        <div className="ml-7 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Move to:</span>
          <div className="flex items-center space-x-1.5">
            {task.status !== 'todo' && (
              <button
                onClick={() => onUpdateStatus(task, 'todo')}
                className="px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                To Do
              </button>
            )}
            {task.status !== 'in_progress' && (
              <button
                onClick={() => onUpdateStatus(task, 'in_progress')}
                className="px-2 py-0.5 rounded text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100"
              >
                In Progress
              </button>
            )}
            {task.status !== 'completed' && (
              <button
                onClick={() => onUpdateStatus(task, 'completed')}
                className="px-2 py-0.5 rounded text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Action Items & Task Board
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of tasks with priority levels and instant Firestore sync.
          </p>
        </div>

        <button
          onClick={onOpenNewTask}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Cloud Task</span>
        </button>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To Do */}
        <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                To Do
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {todoTasks.map(renderTaskCard)}
            {todoTasks.length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">No pending tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                In Progress
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {inProgressTasks.map(renderTaskCard)}
            {inProgressTasks.length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">No tasks in progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Completed
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {completedTasks.map(renderTaskCard)}
            {completedTasks.length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">No completed tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
