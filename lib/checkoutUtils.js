import { AsyncStorage } from 'react-native';
import {
  createLineItems,
  createTransactions,
  getAllProductss,
  updateCustomers,
  updateTransactions
} from './airtable/request';
import { rewardPointValue } from './constants';

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
    points: customer.points + totalPoints - rewardsApplied * rewardPointValue,
    rewardsRedeemed: customer.rewardsRedeemed + rewardsApplied
  });
}

// TODO update this to be called line items or something more accurate for consistency
// Calculates a line item for each product type purchased.
async function calculateProductsPurchased(cart) {
  const itemIdPromises = [];

  // Iterate over lineItems in cart
  Object.values(cart).forEach(lineItem => {
    if (lineItem.quantity) {
      itemIdPromises.push(createLineItems({ productId: [lineItem.id], quantity: lineItem.quantity }));
    }
  });

  const itemIds = await Promise.all(itemIdPromises);
  return itemIds;
}

// Creates a transaction from the customer's cart at checkout.
export async function addTransaction(customer, cart, transaction) {
  const storeId = await AsyncStorage.getItem('storeId');
  const clerkId = await AsyncStorage.getItem('clerkId');

  const { discount, subtotal, totalSale, pointsEarned, rewardsApplied } = transaction;

  const transactionId = await createTransactions({
    customerId: [customer.id],
    storeId: [storeId],
    clerkId: [clerkId],
    currentPoints: customer.points,
    pointsEarned,
    rewardsApplied,
    subtotal,
    discount,
    totalPrice: totalSale
  });

  // A list of ids for line items from the transaction.
  const itemIds = await calculateProductsPurchased(cart);

  await updateTransactions(transactionId, { productsPurchasedId: itemIds });

  return transactionId;
}

export function calculateLineItemPrice(product) {
  return product.customerCost * product.quantity;
}

export function displayDollarValue(amount, positive = true) {
  const dollarValue = '$'.concat(amount.toFixed(2).toString());
  if (positive) {
    return dollarValue;
  }
  return '-'.concat(dollarValue);
}
export function createFakeTransaction(transaction) {
  return {
    ...transaction,
    id: 'ABCXYZ',
    totalPrice: transaction.totalSale
  };
}
