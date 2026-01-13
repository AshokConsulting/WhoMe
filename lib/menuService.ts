import { db, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface MenuItem {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  imagePath?: string;
  available: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const MENU_COLLECTION = 'menuItems';

export const uploadMenuImage = async (file: File, itemId: string): Promise<{ url: string; path: string }> => {
  try {
    const timestamp = Date.now();
    const fileName = `menu/${itemId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    console.log('Uploading image to Firebase Storage:', fileName);
    await uploadBytes(storageRef, file);
    console.log('Image uploaded successfully, getting download URL...');
    const url = await getDownloadURL(storageRef);
    console.log('Download URL obtained:', url);
    
    return { url, path: fileName };
  } catch (error: any) {
    console.error('Firebase Storage upload error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error('Firebase Storage is not properly configured. Please check Storage Rules in Firebase Console.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Firebase Storage bucket not found. Please enable Storage in Firebase Console.');
    }
    
    throw error;
  }
};

export const deleteMenuImage = async (imagePath: string): Promise<void> => {
  if (!imagePath) return;
  
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export const createMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File): Promise<string> => {
  const docRef = await addDoc(collection(db, MENU_COLLECTION), {
    ...menuItem,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  if (imageFile) {
    const { url, path } = await uploadMenuImage(imageFile, docRef.id);
    await updateDoc(docRef, {
      imageUrl: url,
      imagePath: path
    });
  }
  
  return docRef.id;
};

export const updateMenuItem = async (id: string, menuItem: Partial<MenuItem>, imageFile?: File): Promise<void> => {
  const docRef = doc(db, MENU_COLLECTION, id);
  const updateData: any = {
    ...menuItem,
    updatedAt: Timestamp.now()
  };
  
  if (imageFile) {
    const existingDoc = await getDoc(docRef);
    const existingData = existingDoc.data();
    
    if (existingData?.imagePath) {
      await deleteMenuImage(existingData.imagePath);
    }
    
    const { url, path } = await uploadMenuImage(imageFile, id);
    updateData.imageUrl = url;
    updateData.imagePath = path;
  }
  
  await updateDoc(docRef, updateData);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const docRef = doc(db, MENU_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.imagePath) {
      await deleteMenuImage(data.imagePath);
    }
  }
  
  await deleteDoc(docRef);
};

export const getMenuItem = async (id: string): Promise<MenuItem | null> => {
  const docRef = doc(db, MENU_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MenuItem;
  }
  
  return null;
};

export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  const q = query(collection(db, MENU_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as MenuItem[];
};

export const getMenuItemsByCategory = async (category: string): Promise<MenuItem[]> => {
  const allItems = await getAllMenuItems();
  return allItems.filter(item => item.category === category);
};
