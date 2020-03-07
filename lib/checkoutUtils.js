import { AsyncStorage } from 'react-native';

import BASE from './common';

// TODO get rid of categories (deprecated)
export const categories = ['All', 'Cut Fruit & Packaged Products', 'Fruit', 'Vegetables', 'Frozen & Dried'];

// Creates a dictionary object from each product.
function createProductData(record) {
  record = record.fields;
  if (record.Image) {
    return {
      name: record.Name,
      id: record.id,
      category: record.Category,
      points: record.Points,
      customerCost: record['Customer Cost'],
      image: record.Image[0].url,
      cartCount: 0
    };
  }
  return {
    name: record.Name,
    id: record.id,
    category: record.Category,
    points: record.Points,
    customerCost: record['Customer Cost'],
    image: null,
    cartCount: 0
  };
}

// Creates a dictionary object from the user to make user
// information more accessible.
function createCustomerData(record) {
  record = record.fields;
  return {
    name: record.Name,
    id: record.id,
    points: record.Points,
    phoneNumber: record['Phone Number'],
    rewardsAvailable: record['Rewards Available'],
    rewardsRedeemed: record['Rewards Redeemed']
  };
}

// Loads products from Airtable.
export async function loadProductsData() {
  const productsTable = BASE('Products').select({ view: 'Grid view' });
  try {
    const records = await productsTable.firstPage();
    const fullProducts = records.map(record => createProductData(record));
    return fullProducts;
  } catch (err) {
    console.error(err);
    return []; // TODO @tommypoa: silent fails
  }
}

// Retrieves the user from AsyncStorage.
export async function getUser(id) {
  const customersTable = BASE('Customers');
  try {
    const record = await customersTable.find(id);
    const customer = createCustomerData(record);
    return customer;
  } catch (err) {
    console.error(err);
    return 'not a customer';
  }
}

// Updates customer with points received from this transaction.
export async function updateCustomerPoints(customer, totalPoints, rewardsApplied) {
  return BASE('Customers').update([
    {
      id: customer.id,
      fields: {
        Points: customer.points + totalPoints - rewardsApplied * 500,
        'Rewards Redeemed': customer.rewardsRedeemed + rewardsApplied
      }
    }
  ]);
}

// TODO update this to be called line items or something more accurate for consistency
// Calculates a line item for each product type purchased.
async function calculateProductsPurchased(cart) {
  const itemIds = [];
  const lineItemsTable = BASE('Line Items');
  for (let i = 0; i < cart.length; i++) {
    const [itemRecord] = await lineItemsTable.create([
      {
        fields: {
          Product: [cart[i].id],
          Quantity: cart[i].cartCount
        }
      }
    ]);
    const itemId = itemRecord.getId();
    itemIds.push(itemId);
  }
  return itemIds;
}

//
// Removed customer phone number from transaction bc its not necessary, also products purchased gets updated underneath
// Creates a transaction from the customer's cart at checkout.
export async function addTransaction(customer, cart, totalPoints, rewardsApplied) {
  const store = await AsyncStorage.getItem('storeId');
  const clerkId = await AsyncStorage.getItem('clerkId');

  const [transactionRecord] = await BASE('Transactions').create([
    {
      fields: {
        Customer: [customer.id],
        Store: [store],
        'Rewards Applied': rewardsApplied,
        'Points Earned': totalPoints,
        Clerk: [clerkId]
      }
    }
  ]);

  const transactionId = transactionRecord.getId();

  // A list of ids for line items from the transaction.
  const itemIds = await calculateProductsPurchased(cart);

  BASE('Transactions').update(
    [
      {
        id: transactionId,
        fields: {
          'Products Purchased': itemIds
        }
      }
    ],
    function(err) {
      if (err) {
        console.error('Error updating transactions with line items.', err);
      }
    }
  );
}
