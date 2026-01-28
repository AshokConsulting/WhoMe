import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const PRODUCTS_COLLECTION = 'products';

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  return docRef.id;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy('category', 'asc'),
    orderBy('name', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productRef);
};

export const seedDefaultProducts = async (): Promise<void> => {
  const existingProducts = await getAllProducts();
  
  if (existingProducts.length > 0) {
    console.log('Products already exist, skipping seed');
    return;
  }

  const defaultProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Espresso', price: 2.50, category: 'coffee', image: 'https://images.unsplash.com/photo-1645445644664-8f44112f334c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Rich and bold shot of pure coffee perfection' },
    { name: 'Cappuccino', price: 3.75, category: 'coffee', image: 'https://images.unsplash.com/photo-1708430651927-20e2e1f1e8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Espresso with steamed milk and velvety foam' },
    { name: 'Latte', price: 4.00, category: 'coffee', image: 'https://images.unsplash.com/photo-1582152747136-af63c112fce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Smooth espresso with creamy steamed milk' },
    { name: 'Americano', price: 3.00, category: 'coffee', image: 'https://images.unsplash.com/photo-1669872484166-e11b9638b50e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Espresso diluted with hot water for a lighter taste' },
    { name: 'Mocha', price: 4.50, category: 'coffee', image: 'https://images.unsplash.com/photo-1618576230663-9714aecfb99a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Chocolate and espresso blend with steamed milk' },
    { name: 'Flat White', price: 4.25, category: 'coffee', image: 'https://images.unsplash.com/photo-1727080409436-356bdc609899?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Double shot espresso with microfoam milk' },
    { name: 'Cold Brew', price: 4.00, category: 'coffee', image: 'https://images.unsplash.com/photo-1561641377-f7456d23aa9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Smooth, refreshing coffee steeped for 12 hours' },
    { name: 'Macchiato', price: 3.50, category: 'coffee', image: 'https://images.unsplash.com/photo-1674642387246-463a03b100be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Espresso marked with a dollop of foam' },
    { name: 'Croissant', price: 3.50, category: 'pastry', image: 'https://images.unsplash.com/photo-1733997926055-fdb6ba24692b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Buttery, flaky French pastry baked fresh daily' },
    { name: 'Blueberry Muffin', price: 3.00, category: 'pastry', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Moist muffin bursting with fresh blueberries' },
    { name: 'Chocolate Cookie', price: 2.50, category: 'pastry', image: 'https://images.unsplash.com/photo-1623659945014-d166115a8e20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Chewy cookie loaded with chocolate chips' },
    { name: 'Bagel', price: 2.75, category: 'pastry', image: 'https://images.unsplash.com/photo-1707144289499-8903dc4929c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Freshly baked bagel with cream cheese' },
    { name: 'Cinnamon Roll', price: 4.00, category: 'pastry', image: 'https://images.unsplash.com/photo-1645995575875-ea6511c9d127?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Sweet roll with cinnamon and cream cheese frosting' },
    { name: 'Banana Bread', price: 3.25, category: 'pastry', image: 'https://images.unsplash.com/photo-1569762404472-026308ba6b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Moist homemade bread with ripe bananas' },
    { name: 'Orange Juice', price: 3.50, category: 'other', image: 'https://images.unsplash.com/photo-1641659735894-45046caad624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Freshly squeezed orange juice, vitamin-rich' },
    { name: 'Bottled Water', price: 1.50, category: 'other', image: 'https://images.unsplash.com/photo-1536939459926-301728717817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', description: 'Pure spring water, perfectly chilled' },
  ];

  console.log('Seeding default products...');
  for (const product of defaultProducts) {
    await createProduct(product);
  }
  console.log('Default products seeded successfully');
};
