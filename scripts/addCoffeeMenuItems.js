const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || serviceAccount.project_id + '.appspot.com'
});

const db = admin.firestore();

const products = [
  { id: '1', name: 'Espresso', price: 2.50, category: 'coffee', image: 'photo-1708430651927-20e2e1f1e8f7.jpeg' },
  { id: '2', name: 'Cappuccino', price: 3.75, category: 'coffee', image: 'photo-1645445644664-8f44112f334c.jpeg' },
  { id: '3', name: 'Latte', price: 4.00, category: 'coffee', image: 'photo-1582152747136-af63c112fce5.jpeg' },
  { id: '4', name: 'Americano', price: 3.00, category: 'coffee', image: 'photo-1669872484166-e11b9638b50e.jpeg' },
  { id: '5', name: 'Mocha', price: 4.50, category: 'coffee', image: 'photo-1618576230663-9714aecfb99a.jpeg' },
  { id: '6', name: 'Flat White', price: 4.25, category: 'coffee', image: 'photo-1727080409436-356bdc609899.jpeg' },
  { id: '7', name: 'Cold Brew', price: 4.00, category: 'coffee', image: 'photo-1561641377-f7456d23aa9b.jpeg' },
  { id: '8', name: 'Macchiato', price: 3.50, category: 'coffee', image: 'photo-1674642387246-463a03b100be.jpeg' },
  { id: '9', name: 'Croissant', price: 3.50, category: 'pastry', image: 'photo-1733997926055-fdb6ba24692b.jpeg' },
  { id: '10', name: 'Blueberry Muffin', price: 3.00, category: 'pastry', image: 'photo-1607958996333-41aef7caefaa.jpeg' },
  { id: '11', name: 'Chocolate Cookie', price: 2.50, category: 'pastry', image: 'photo-1623659945014-d166115a8e20.jpeg' },
  { id: '12', name: 'Bagel', price: 2.75, category: 'pastry', image: 'photo-1707144289499-8903dc4929c7.jpeg' },
  { id: '13', name: 'Cinnamon Roll', price: 4.00, category: 'pastry', image: 'photo-1645995575875-ea6511c9d127.jpeg' },
  { id: '14', name: 'Banana Bread', price: 3.25, category: 'pastry', image: 'photo-1569762404472-026308ba6b64.jpeg' },
  { id: '15', name: 'Orange Juice', price: 3.50, category: 'other', image: 'photo-1641659735894-45046caad624.jpeg' },
  { id: '16', name: 'Bottled Water', price: 1.50, category: 'other', image: 'photo-1536939459926-301728717817.jpeg' },
];

const categoryMapping = {
  'coffee': 'Beverages',
  'pastry': 'Breakfast',
  'other': 'Beverages'
};

const descriptions = {
  'Espresso': 'Rich and bold espresso shot, the perfect pick-me-up',
  'Cappuccino': 'Classic Italian coffee with steamed milk and foam',
  'Latte': 'Smooth espresso with steamed milk and light foam',
  'Americano': 'Espresso diluted with hot water for a lighter taste',
  'Mocha': 'Chocolate-flavored espresso drink with steamed milk',
  'Flat White': 'Velvety microfoam over a double shot of espresso',
  'Cold Brew': 'Smooth, refreshing cold-steeped coffee',
  'Macchiato': 'Espresso marked with a dollop of foamed milk',
  'Croissant': 'Buttery, flaky French pastry baked fresh daily',
  'Blueberry Muffin': 'Moist muffin loaded with fresh blueberries',
  'Chocolate Cookie': 'Decadent chocolate chip cookie, soft and chewy',
  'Bagel': 'Fresh-baked bagel, perfect with cream cheese',
  'Cinnamon Roll': 'Sweet, gooey cinnamon roll with cream cheese frosting',
  'Banana Bread': 'Moist and flavorful homemade banana bread',
  'Orange Juice': 'Freshly squeezed orange juice, 100% natural',
  'Bottled Water': 'Premium bottled water, refreshing and pure'
};



async function addMenuItem(product) {
  try {
    console.log(`\nProcessing: ${product.name}`);
    
    const menuItem = {
      title: product.name,
      description: descriptions[product.name] || `Delicious ${product.name}`,
      price: product.price,
      category: categoryMapping[product.category] || 'Beverages',
      available: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    console.log(`  Adding to Firestore...`);
    const docRef = await db.collection('menuItems').add(menuItem);
    console.log(`  ✓ Successfully added ${product.name} (ID: ${docRef.id})`);
    
    return docRef.id;
  } catch (error) {
    console.error(`  ✗ Error adding ${product.name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Starting to add coffee shop menu items...\n');
  console.log(`Total items to add: ${products.length}`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const product of products) {
    try {
      await addMenuItem(product);
      successCount++;
    } catch (error) {
      failCount++;
    }
  }
  
  
  console.log('\n' + '='.repeat(50));
  console.log(`\nCompleted!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total: ${products.length}`);
  console.log('\n' + '='.repeat(50));
  
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
