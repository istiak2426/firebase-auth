import React from 'react';
import { AlertCircle, ExternalLink, X, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';

export const AuthErrorBanner: React.FC = () => {
  const { error, clearError } = useAuth();
  const [copied, setCopied] = React.useState(false);

  if (!error) return null;

  const isUnauthorizedDomain = error.includes('auth/unauthorized-domain');
  const isPopupBlocked = error.includes('auth/popup-blocked');
  const isPopupClosed = error.includes('auth/popup-closed-by-user');

  const consoleSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-100 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-1 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-bold text-rose-800 dark:text-rose-200">
              {isUnauthorizedDomain
                ? 'Localhost Domain Not Authorized in Firebase'
                : isPopupBlocked
                ? 'Sign-in Popup Was Blocked'
                : isPopupClosed
                ? 'Sign-in Window Closed'
                : 'Authentication Error'}
            </h4>

            {isUnauthorizedDomain && (
              <div className="space-y-2 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
                <p>
                  Firebase security blocks Google Sign-In from unauthorized domains. Because you are running on your PC, you need to add <code className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/70 rounded font-mono font-semibold">localhost</code> to your Firebase project&apos;s authorized domains.
                </p>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-200/60 dark:border-rose-800/60 space-y-1.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Quick 1-Minute Fix:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>
                      Open the{' '}
                      <a
                        href={consoleSettingsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700"
                      >
                        Firebase Authentication Settings
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>Scroll down to the <strong>Authorized domains</strong> section.</li>
                    <li>
                      Click <strong>Add domain</strong> and add:
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                          localhost
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('localhost')}
                          className="px-2 py-0.5 text-[11px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded flex items-center gap-1 text-slate-700 dark:text-slate-200"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </li>
                    <li>Click <strong>Save</strong> and click Google Sign-In again.</li>
                  </ol>
                </div>
              </div>
            )}

            {isPopupBlocked && (
              <p className="text-rose-700 dark:text-rose-300 text-xs">
                Your browser blocked the Google authentication popup window. Please click the popup icon in your browser URL bar, choose &quot;Always allow popups on localhost:3000&quot;, and click Sign In again.
              </p>
            )}

            {isPopupClosed && (
              <p className="text-rose-700 dark:text-rose-300 text-xs">
                The Google account selection popup was closed before finishing authentication. Click Google Sign-In to try again.
              </p>
            )}

            {!isUnauthorizedDomain && !isPopupBlocked && !isPopupClosed && (
              <p className="text-rose-700 dark:text-rose-300 text-xs font-mono break-all">
                {error}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={clearError}
          className="p-1 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
