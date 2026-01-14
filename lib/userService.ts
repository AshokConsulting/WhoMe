import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  faceData: string;
  faceImageUrl?: string;
  profilePhotoUrl?: string;
  profilePhotoPath?: string;
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
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    if (userData?.profilePhotoPath) {
      try {
        const photoRef = ref(storage, userData.profilePhotoPath);
        await deleteObject(photoRef);
      } catch (error) {
        console.error('Error deleting profile photo:', error);
      }
    }
    
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const docSnapshot = await getDoc(doc(db, 'users', userId));
    
    if (!docSnapshot.exists()) {
      return null;
    }
    
    return { id: docSnapshot.id, ...docSnapshot.data() } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function uploadProfilePhoto(file: File, userId: string): Promise<{ url: string; path: string }> {
  try {
    const timestamp = Date.now();
    const fileName = `profiles/${userId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return { url, path: fileName };
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<User>, profilePhoto?: File): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData: any = { ...updates };
    
    if (profilePhoto) {
      const existingUser = await getUser(userId);
      
      if (existingUser?.profilePhotoPath) {
        try {
          const oldPhotoRef = ref(storage, existingUser.profilePhotoPath);
          await deleteObject(oldPhotoRef);
        } catch (error) {
          console.error('Error deleting old profile photo:', error);
        }
      }
      
      const { url, path } = await uploadProfilePhoto(profilePhoto, userId);
      updateData.profilePhotoUrl = url;
      updateData.profilePhotoPath = path;
    }
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
