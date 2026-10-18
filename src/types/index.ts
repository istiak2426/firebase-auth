export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  color: string;
  pinned: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  theme?: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';
export type ActiveTab = 'all' | 'notes' | 'tasks' | 'insights';
