import { AsyncStorage } from 'react-native';
import {
  createLineItems,
  createTransactions,
  getAllProductss,
  updateCustomers,
  updateTransactions
} from './airtable/request';

// Adds a field 'imageUrl' to products
function createProductData(record) {
  return { ...record, quantity: 0, imageUrl: record.image ? record.image[0].url : null };
}

// Loads products from Airtable.
export async function loadProductsData() {
  const records = await getAllProductss();
  const products = records.map(record => createProductData(record));
  return products;
}

// Updates customer with points received from this transaction.
export async function updateCustomerPoints(customer, totalPoints, rewardsApplied) {
  updateCustomers(customer.id, {
    points: customer.points + totalPoints - rewardsApplied * 500,
    rewardsRedeemed: customer.rewardsRedeemed + rewardsApplied
  });
}

// TODO update this to be called line items or something more accurate for consistency
// Calculates a line item for each product type purchased.
async function calculateProductsPurchased(cart) {
  const itemIdPromises = [];

  cart.forEach(item => {
    itemIdPromises.push(createLineItems({ productId: [item.id], quantity: item.cartCount }));
  });
  const itemIds = await Promise.all(itemIdPromises);
  return itemIds;
}

// Creates a transaction from the customer's cart at checkout.
export async function addTransaction(customer, cart, currentPoints, totalPoints, rewardsApplied) {
  const storeId = await AsyncStorage.getItem('storeId');
  const clerkId = await AsyncStorage.getItem('clerkId');

  const transactionId = await createTransactions({
    customerId: [customer.id],
    storeId: [storeId],
    clerkId: [clerkId],
    pointsEarned: totalPoints,
    currentPoints,
    rewardsApplied
  });

  // A list of ids for line items from the transaction.
  const itemIds = await calculateProductsPurchased(cart);

  await updateTransactions(transactionId, { productsPurchasedId: itemIds });
}
