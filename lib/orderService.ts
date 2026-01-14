import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

export interface OrderItem {
  menuItemId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id?: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: Timestamp;
  status: 'pending' | 'completed' | 'cancelled';
}

const ORDERS_COLLECTION = 'orders';

export const createOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string> => {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...orderData,
    orderDate: Timestamp.now()
  });
  
  return docRef.id;
};

export const getUserOrders = async (userId: string, limitCount: number = 10): Promise<Order[]> => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('orderDate', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];
};

export const getFrequentlyOrderedItems = async (userId: string): Promise<OrderItem[]> => {
  const orders = await getUserOrders(userId, 20);
  
  const itemFrequency = new Map<string, { item: OrderItem; count: number }>();
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const existing = itemFrequency.get(item.menuItemId);
      if (existing) {
        existing.count += item.quantity;
      } else {
        itemFrequency.set(item.menuItemId, { item, count: item.quantity });
      }
    });
  });
  
  const sortedItems = Array.from(itemFrequency.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(entry => entry.item);
  
  return sortedItems;
};
