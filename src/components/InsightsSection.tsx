import React from 'react';
import {
  Cloud,
  Database,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  UploadCloud,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Note, Task } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

interface InsightsSectionProps {
  notes: Note[];
  tasks: Task[];
  onMigrateDemoData?: () => void;
  canMigrate?: boolean;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({
  notes,
  tasks,
  onMigrateDemoData,
  canMigrate,
}) => {
  const { user, signInWithGoogle } = useAuth();

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Category counts
  const categoryCounts: { [key: string]: number } = {};
  notes.forEach((n) => {
    categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
  });

  const handleExportData = () => {
    const exportObject = {
      exportDate: new Date().toISOString(),
      user: user ? { uid: user.uid, email: user.email } : 'guest',
      notes,
      tasks,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syncsphere-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cloud Notes</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {notes.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {notes.filter((n) => n.pinned).length} pinned to top
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {tasks.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {todoTasks} to do • {inProgressTasks} in progress
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Task Completion</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sync Engine</span>
            <Cloud className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {user ? 'Firestore Live' : 'Local Sandbox'}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Connection Healthy</span>
          </p>
        </div>
      </div>

      {/* Cloud Infrastructure Details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cloud Persistence & Security Infrastructure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Under-the-hood details of the active Firebase backend
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Firebase Project ID:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {firebaseConfig.projectId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Firestore Database ID:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                {firebaseConfig.firestoreDatabaseId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Auth Provider:</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                Google Identity Platform
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Access Control Model:</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Attribute-Based (ABAC)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current Session:</span>
              <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                {user ? user.email : 'Local Sandbox Visitor'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Snapshot Protocol:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                WebSockets / Long-Polling
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons: Backup JSON & Migrate */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Data Portability & Migration
            </h4>
            <p className="text-xs text-slate-400">
              Download a complete JSON snapshot of your notes and tasks anytime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canMigrate && user && (
              <button
                onClick={onMigrateDemoData}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Sample Items to Cloud</span>
              </button>
            )}

            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
