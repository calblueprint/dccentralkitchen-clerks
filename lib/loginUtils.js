import { getAllStores, getClerksByIds, getStoresById } from './airtable/request';
import { status } from './constants';

export async function loadStoreData() {
  const stores = await getAllStores();
  return stores;
}

// lookupClerk searches for clerks based on the store ID (from the picker) and numeric password.
// If the user is found, we return the record. Otherwise, we will display an error on the login screen.
export async function lookupClerk(storeId, pin) {
  const currStore = await getStoresById(storeId);
  const clerks = await getClerksByIds(currStore.clerkIds);
  let errorMsg = 'Invalid PIN';

  // No clerk at this store
  if (clerks.length === 0) {
    return { status: status.NOT_FOUND, record: null, storeName: `${currStore.storeName}`, errorMsg };
  }

  // Iterate through clerks at this store, and find the one with this PIN.
  const matching = clerks.filter((clerk) => clerk.pin === pin);
  if (matching.length === 0) {
    // Invalid PIN
    return { status: status.FOUND, record: null, storeName: `${currStore.storeName}`, errorMsg };
  }

  if (matching.length === 1) {
    const clerk = matching[0];
    // If match, no error message
    errorMsg = '';
    return { status: status.MATCH, record: clerk, storeName: `${currStore.storeName}`, errorMsg };
  }

  // There is more than one Clerk registered for this store with this password. Clerks should report to an admin, who can fix their accounts.
  errorMsg =
    'Error: more than one clerk found with this PIN at this store. Please alert an admin to fix this issue for you.';
  return { status: status.DUPLICATE, record: null, storeName: `${currStore.storeName}`, errorMsg };
}
