import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { UserProfile } from '../types';

const COLLECTION_NAME = 'users';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      userId: data.userId,
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL,
      theme: data.theme || 'system',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${userId}`);
  }
}

export async function syncUserProfile(
  userId: string,
  profile: {
    displayName: string;
    email: string;
    photoURL?: string;
    theme?: 'light' | 'dark' | 'system';
  }
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const now = new Date().toISOString();

  try {
    const existingSnap = await getDoc(docRef);
    const existing = existingSnap.exists() ? existingSnap.data() : null;

    const payload: UserProfile = {
      userId,
      displayName: (profile.displayName || 'User').slice(0, 100),
      email: (profile.email || '').slice(0, 120),
      photoURL: profile.photoURL ? profile.photoURL.slice(0, 500) : undefined,
      theme: profile.theme || 'system',
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${userId}`);
  }
}
