import React from 'react';
import { Cloud, ShieldCheck, ArrowRight, Zap, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SyncBannerProps {
  onSyncDemoData?: () => void;
  hasDemoData?: boolean;
}

export const SyncBanner: React.FC<SyncBannerProps> = ({
  onSyncDemoData,
  hasDemoData,
}) => {
  const { user, signInWithGoogle } = useAuth();

  if (user) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl mb-8 border border-indigo-700/50">
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Firebase Firestore & Auth Ready</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Connect Your Account for Instant Cloud Synchronization
          </h2>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            You are currently exploring in local sandbox mode. Sign in with Google to persist your notes,
            prioritized tasks, and tags directly into your personal encrypted Firestore cloud database.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-indigo-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Strict Firestore ABAC Rules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Real-Time Snapshot Sync</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm shadow-lg shadow-indigo-950/40 hover:shadow-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
            <ArrowRight className="w-4 h-4 ml-1 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
