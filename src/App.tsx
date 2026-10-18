/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { SyncBanner } from './components/SyncBanner';
import { NotesSection } from './components/NotesSection';
import { TasksSection } from './components/TasksSection';
import { InsightsSection } from './components/InsightsSection';
import { NoteModal } from './components/NoteModal';
import { TaskModal } from './components/TaskModal';
import {
  subscribeUserNotes,
  createNote,
  updateNote,
  deleteNote,
} from './services/notesService';
import {
  subscribeUserTasks,
  createTask,
  updateTask,
  deleteTask,
} from './services/tasksService';
import { syncUserProfile } from './services/profileService';
import { INITIAL_DEMO_NOTES, INITIAL_DEMO_TASKS } from './data/mockData';
import { Note, Task, ActiveTab, SyncState, TaskStatus } from './types';
import { Plus, FileText, CheckSquare, Sparkles } from 'lucide-react';

function WorkspaceApp() {
  const { user, loading: authLoading } = useAuth();

  const [notes, setNotes] = useState<Note[]>(() => {
    const cached = localStorage.getItem('syncsphere_guest_notes');
    return cached ? JSON.parse(cached) : INITIAL_DEMO_NOTES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem('syncsphere_guest_tasks');
    return cached ? JSON.parse(cached) : INITIAL_DEMO_TASKS;
  });

  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Unsubscribe listeners references
  const noteUnsubRef = useRef<(() => void) | null>(null);
  const taskUnsubRef = useRef<(() => void) | null>(null);

  // Real-time Firestore Listeners when authenticated
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setSyncState('syncing');

      // Sync user profile record at /users/{uid}
      syncUserProfile(user.uid, {
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
      }).catch((err) => console.error('Failed to sync user profile:', err));

      // Subscribe to notes
      const unsubNotes = subscribeUserNotes(
        user.uid,
        (syncedNotes) => {
          setNotes(syncedNotes);
          setSyncState('synced');
          setLastSyncTime(new Date());
        },
        (err) => {
          console.error('Notes subscription error:', err);
          setSyncState('error');
        }
      );
      noteUnsubRef.current = unsubNotes;

      // Subscribe to tasks
      const unsubTasks = subscribeUserTasks(
        user.uid,
        (syncedTasks) => {
          setTasks(syncedTasks);
          setSyncState('synced');
          setLastSyncTime(new Date());
        },
        (err) => {
          console.error('Tasks subscription error:', err);
          setSyncState('error');
        }
      );
      taskUnsubRef.current = unsubTasks;

      return () => {
        if (unsubNotes) unsubNotes();
        if (unsubTasks) unsubTasks();
      };
    } else {
      // Guest mode: load demo or local state
      const cachedNotes = localStorage.getItem('syncsphere_guest_notes');
      setNotes(cachedNotes ? JSON.parse(cachedNotes) : INITIAL_DEMO_NOTES);

      const cachedTasks = localStorage.getItem('syncsphere_guest_tasks');
      setTasks(cachedTasks ? JSON.parse(cachedTasks) : INITIAL_DEMO_TASKS);

      setSyncState('offline');
      setLastSyncTime(null);
    }
  }, [user, authLoading]);

  // Persist guest changes to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('syncsphere_guest_notes', JSON.stringify(notes));
    }
  }, [notes, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('syncsphere_guest_tasks', JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>(['General', 'Work', 'Personal', 'Ideas']);
    notes.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [notes]);

  // Note CRUD operations
  const handleSaveNote = async (data: {
    title: string;
    content: string;
    category: string;
    color: string;
    pinned: boolean;
    tags: string[];
  }) => {
    setSyncState('syncing');
    try {
      if (user) {
        if (editingNote) {
          await updateNote(user.uid, editingNote.id, data, editingNote);
        } else {
          await createNote(user.uid, data);
        }
      } else {
        // Local mode
        const now = new Date().toISOString();
        if (editingNote) {
          setNotes((prev) =>
            prev.map((n) =>
              n.id === editingNote.id
                ? { ...n, ...data, updatedAt: now }
                : n
            )
          );
        } else {
          const newLocalNote: Note = {
            id: 'local_' + Date.now().toString(36),
            userId: 'guest',
            ...data,
            createdAt: now,
            updatedAt: now,
          };
          setNotes((prev) => [newLocalNote, ...prev]);
        }
      }
      setSyncState('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Failed to save note:', err);
      setSyncState('error');
      throw err;
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (user) {
      setSyncState('syncing');
      try {
        await deleteNote(user.uid, note.id);
        setSyncState('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        console.error('Failed to delete note:', err);
        setSyncState('error');
      }
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    }
  };

  const handleTogglePin = async (note: Note) => {
    const updatedPinned = !note.pinned;
    if (user) {
      setSyncState('syncing');
      try {
        await updateNote(user.uid, note.id, { pinned: updatedPinned }, note);
        setSyncState('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        console.error('Failed to toggle pin:', err);
        setSyncState('error');
      }
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, pinned: updatedPinned } : n))
      );
    }
  };

  // Task CRUD operations
  const handleSaveTask = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    tags: string[];
  }) => {
    setSyncState('syncing');
    try {
      if (user) {
        if (editingTask) {
          await updateTask(user.uid, editingTask.id, data, editingTask);
        } else {
          await createTask(user.uid, data);
        }
      } else {
        const now = new Date().toISOString();
        if (editingTask) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === editingTask.id
                ? { ...t, ...data, updatedAt: now }
                : t
            )
          );
        } else {
          const newLocalTask: Task = {
            id: 'local_task_' + Date.now().toString(36),
            userId: 'guest',
            ...data,
            createdAt: now,
            updatedAt: now,
          };
          setTasks((prev) => [newLocalTask, ...prev]);
        }
      }
      setSyncState('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Failed to save task:', err);
      setSyncState('error');
      throw err;
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (user) {
      setSyncState('syncing');
      try {
        await deleteTask(user.uid, task.id);
        setSyncState('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        console.error('Failed to delete task:', err);
        setSyncState('error');
      }
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
  };

  const handleUpdateTaskStatus = async (task: Task, newStatus: TaskStatus) => {
    if (user) {
      setSyncState('syncing');
      try {
        await updateTask(user.uid, task.id, { status: newStatus }, task);
        setSyncState('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        console.error('Failed to update task status:', err);
        setSyncState('error');
      }
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    }
  };

  // Migrate sample items to real Cloud collection
  const handleMigrateSampleData = async () => {
    if (!user) return;
    setSyncState('syncing');
    try {
      for (const n of INITIAL_DEMO_NOTES) {
        await createNote(user.uid, {
          title: n.title,
          content: n.content,
          category: n.category,
          color: n.color,
          pinned: n.pinned,
          tags: n.tags,
        });
      }
      for (const t of INITIAL_DEMO_TASKS) {
        await createTask(user.uid, {
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          tags: t.tags,
        });
      }
      setSyncState('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Migration error:', err);
      setSyncState('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        syncState={syncState}
        lastSyncTime={lastSyncTime}
        totalNotesCount={notes.length}
        totalTasksCount={tasks.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SyncBanner
          onSyncDemoData={handleMigrateSampleData}
          hasDemoData={!user}
        />

        {activeTab === 'all' && (
          <div className="space-y-10">
            {/* Quick Actions Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Workspace Dashboard
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time synced notes and prioritized actions in one place
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsNoteModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Notes Section Preview */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Cloud Notes ({notes.length})
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All Notes &rarr;
                </button>
              </div>
              <NotesSection
                notes={notes.slice(0, 6)}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onOpenNewNote={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                onEditNote={(note) => {
                  setEditingNote(note);
                  setIsNoteModalOpen(true);
                }}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePin}
              />
            </section>

            {/* Tasks Section Preview */}
            <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Action Tasks ({tasks.length})
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open Task Board &rarr;
                </button>
              </div>
              <TasksSection
                tasks={tasks}
                searchQuery={searchQuery}
                onOpenNewTask={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onUpdateStatus={handleUpdateTaskStatus}
              />
            </section>
          </div>
        )}

        {activeTab === 'notes' && (
          <NotesSection
            notes={notes}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onOpenNewNote={() => {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            }}
            onEditNote={(note) => {
              setEditingNote(note);
              setIsNoteModalOpen(true);
            }}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksSection
            tasks={tasks}
            searchQuery={searchQuery}
            onOpenNewTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onUpdateStatus={handleUpdateTaskStatus}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsSection
            notes={notes}
            tasks={tasks}
            onMigrateDemoData={handleMigrateSampleData}
            canMigrate={Boolean(user && notes.length <= 1)}
          />
        )}
      </main>

      {/* Note Creation / Editing Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
        categories={categories}
      />

      {/* Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceApp />
    </AuthProvider>
  );
}
