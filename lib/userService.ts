import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  faceData: string;
  faceImageUrl?: string;
  registeredAt: Timestamp;
  lastGreeted?: Timestamp;
}

export async function registerUser(userData: Omit<User, 'id' | 'registeredAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      faceImageUrl: userData.faceData,
      registeredAt: Timestamp.now(),
    });
    
    return { id: docRef.id, ...userData, faceImageUrl: userData.faceData };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docSnapshot = querySnapshot.docs[0];
    return { id: docSnapshot.id, ...docSnapshot.data() } as User;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
