import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Search,
  LogOut,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  FileText,
  CheckSquare,
  BarChart2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab, SyncState } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  syncState: SyncState;
  lastSyncTime?: Date | null;
  onRefreshSync?: () => void;
  totalNotesCount: number;
  totalTasksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  syncState,
  lastSyncTime,
  onRefreshSync,
  totalNotesCount,
  totalTasksCount,
}) => {
  const { user, signInWithGoogle, signOutUser, loading } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getSyncBadge = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Local Mode • Sign in to sync</span>
        </div>
      );
    }

    if (syncState === 'syncing') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Syncing to Firestore...</span>
        </div>
      );
    }

    return (
      <button
        onClick={onRefreshSync}
        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
        title="Firestore Real-time Connection Active"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Cloud Synced</span>
        <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
          {lastSyncTime ? `• ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '• Realtime'}
        </span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  SyncSphere
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Firebase Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-time synchronized workspace
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search notes, tasks, tags... (Press / to focus)"
                className="w-full pl-9 pr-9 py-2 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sync status & Auth */}
          <div className="flex items-center space-x-3 shrink-0">
            {getSyncBadge()}

            {loading ? (
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-1 pl-2 pr-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800 transition-colors"
                >
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate hidden sm:inline">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.email ? user.email[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                            {user.email ? user.email[0].toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {user.displayName || 'Google User'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Authenticated via Google</span>
                          </div>
                        </div>
                      </div>

                      <div className="py-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between py-1">
                          <span>Cloud Notes:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {totalNotesCount}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Cloud Tasks:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {totalTasksCount}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Firestore Database:</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
                            Connected
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            signOutUser();
                          }}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher row */}
        <div className="flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onTabChange('all')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Workspace Overview</span>
          </button>

          <button
            onClick={() => onTabChange('notes')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {totalNotesCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('tasks')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks & Actions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {totalTasksCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('insights')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'insights'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Cloud Insights & Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};
