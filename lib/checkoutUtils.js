import AsyncStorage from '@react-native-community/async-storage';
import { rewardDollarValue, rewardPointValue } from '../constants/Rewards';
import {
  createLineItem,
  createTransaction,
  getAllProducts,
  updateCustomer,
  updateTransaction,
} from './airtable/request';

// Adds a field 'imageUrl' to products
function createProductData(record) {
  return {
    ...record,
    points: Math.round(record.points),
    quantity: 0,
    imageUrl: record.image ? record.image[0].url : null,
  };
}

// Loads products from Airtable.
export async function loadProductsData() {
  const records = await getAllProducts();
  const products = records.map((record) => createProductData(record));
  return products;
}

// Updates customer with points received from this transaction.
export async function updateCustomerPoints(customer, totalPoints, rewardsApplied) {
  updateCustomer(customer.id, {
    points: (customer.points || 0) + totalPoints - rewardsApplied * rewardPointValue,
    rewardsRedeemed: customer.rewardsRedeemed + rewardsApplied,
  });
}

// Calculates a line item for each product type purchased.
async function calculateLineItems(cart) {
  const itemIdPromises = [];

  // Iterate over lineItems in cart
  Object.values(cart).forEach((lineItem) => {
    if (lineItem.quantity) {
      itemIdPromises.push(createLineItem({ productId: lineItem.id, quantity: lineItem.quantity }));
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

  const transactionId = await createTransaction({
    customerId: customer.id,
    currentPoints: customer.points || 0,
    storeId,
    clerkId,
    pointsEarned,
    rewardsApplied,
    subtotal,
    discount,
    totalSale,
  });

  // A list of ids for line items from the transaction.
  const itemIds = await calculateLineItems(cart);

  await updateTransaction(transactionId, { productsPurchasedIds: itemIds });

  return transactionId;
}

// Calculate eligible rewards
/* If negative balance exists, no additional rewards allowed!
  Must take into account the current rewards applied
  */
export function calculateEligibleRewards(rewardsAvailable, rewardsApplied, totalBalance) {
  const additionalRewardsAllowed = totalBalance > 0 ? Math.ceil(totalBalance / rewardDollarValue) : 0;
  const additionalRewardsAvailable = rewardsAvailable - rewardsApplied;
  const additionalRewardsEligible = Math.min(additionalRewardsAllowed, additionalRewardsAvailable);
  return rewardsApplied + additionalRewardsEligible;
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

// Clerk training: create a locally stored transaction
export function createFakeTransaction(transaction) {
  return {
    ...transaction,
    id: 'ABCDXYZ',
  };
}
