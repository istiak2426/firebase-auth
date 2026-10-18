import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Task, TaskPriority, TaskStatus } from '../types';

const COLLECTION_NAME = 'tasks';

function sanitizeTaskPayload(
  userId: string,
  data: Partial<Task>,
  existing?: Task
): Omit<Task, 'id'> {
  const now = new Date().toISOString();
  const title = (data.title || 'Untitled Task').trim().slice(0, 200);
  const description = (data.description || '').slice(0, 5000);
  const status: TaskStatus =
    data.status === 'in_progress' || data.status === 'completed' ? data.status : 'todo';
  const priority: TaskPriority =
    data.priority === 'low' || data.priority === 'high' ? data.priority : 'medium';
  const dueDate = data.dueDate ? String(data.dueDate).slice(0, 50) : undefined;

  const tags = Array.isArray(data.tags)
    ? data.tags.slice(0, 20).map((t) => String(t).trim().slice(0, 50)).filter(Boolean)
    : [];

  const payload: Omit<Task, 'id'> = {
    userId,
    title,
    description,
    status,
    priority,
    tags,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };

  if (dueDate) {
    payload.dueDate = dueDate;
  }

  return payload;
}

export function subscribeUserTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tasks.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          dueDate: data.dueDate,
          tags: data.tags || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      // Sort tasks: Incomplete first, then by priority (high > medium > low), then by updatedAt desc
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        const diff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
        if (diff !== 0) return diff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      onUpdate(tasks);
    },
    (error) => {
      console.error('Snapshot error in subscribeUserTasks:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

export async function createTask(
  userId: string,
  taskData: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    tags?: string[];
  }
): Promise<string> {
  const newId = 't_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  const docRef = doc(db, COLLECTION_NAME, newId);
  const payload = sanitizeTaskPayload(userId, taskData);

  try {
    await setDoc(docRef, payload);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
  }
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<Task>,
  existing: Task
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, taskId);
  const payload = sanitizeTaskPayload(userId, { ...existing, ...data }, existing);

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${taskId}`);
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, taskId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${taskId}`);
  }
}
