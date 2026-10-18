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
import { Note } from '../types';

const COLLECTION_NAME = 'notes';

// Defensive payload truncation and sanitization matching firebase-blueprint.json
function sanitizeNotePayload(
  userId: string,
  data: Partial<Note>,
  existing?: Note
): Omit<Note, 'id'> {
  const now = new Date().toISOString();
  const title = (data.title || 'Untitled Note').trim().slice(0, 200);
  const content = (data.content || '').slice(0, 50000);
  const category = (data.category || 'General').trim().slice(0, 50);
  const color = (data.color || '#3b82f6').slice(0, 30);
  const pinned = Boolean(data.pinned);

  const tags = Array.isArray(data.tags)
    ? data.tags.slice(0, 20).map((t) => String(t).trim().slice(0, 50)).filter(Boolean)
    : [];

  return {
    userId,
    title,
    content,
    category,
    color,
    pinned,
    tags,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };
}

export function subscribeUserNotes(
  userId: string,
  onUpdate: (notes: Note[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: Note[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notes.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title || '',
          content: data.content || '',
          category: data.category || 'General',
          color: data.color || '#3b82f6',
          pinned: Boolean(data.pinned),
          tags: data.tags || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      // Sort in-memory: pinned first, then by updatedAt descending
      notes.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      onUpdate(notes);
    },
    (error) => {
      console.error('Snapshot error in subscribeUserNotes:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

export async function createNote(
  userId: string,
  noteData: {
    title: string;
    content: string;
    category?: string;
    color?: string;
    pinned?: boolean;
    tags?: string[];
  }
): Promise<string> {
  // Generate safe alphanumeric doc ID
  const newId = 'n_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  const docRef = doc(db, COLLECTION_NAME, newId);
  const payload = sanitizeNotePayload(userId, noteData);

  try {
    await setDoc(docRef, payload);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${newId}`);
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<Note>,
  existing: Note
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, noteId);
  const payload = sanitizeNotePayload(userId, { ...existing, ...data }, existing);

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${noteId}`);
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, noteId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${noteId}`);
  }
}
