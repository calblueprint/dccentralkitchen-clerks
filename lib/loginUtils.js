/* eslint-disable import/prefer-default-export */
import { getClerksByIds, getStoresById } from './airtable/request';
import { status } from './constants';

// lookupClerk searches for clerks based on the store ID (from the picker) and numeric password.
// If the user is found, we return the record. Otherwise, we will display an error on the login screen.
export async function lookupClerk(storeId, pin) {
  let errorMsg = 'Invalid PIN';
  const currStore = await getStoresById(storeId);

  // No clerks registered at this store
  if (!('clerkIds' in currStore)) {
    return { status: status.NOT_FOUND, record: null, errorMsg };
  }

  const clerks = await getClerksByIds(currStore.clerkIds);
  // Iterate through clerks at this store, and find the one with this password.
  const matching = clerks.filter((clerk) => clerk.pin === pin);

  if (matching.length === 0) {
    // Incorrect password
    return { status: status.FOUND, record: null, errorMsg };
  }

  if (matching.length === 1) {
    const clerk = matching[0];
    // If match, no error message
    errorMsg = '';
    return { status: status.MATCH, record: clerk, errorMsg };
  }

  // There is more than one Clerk registered for this store with this password. Clerks should report to an admin, who can fix their accounts.
  errorMsg =
    'Database error: more than one clerk found with this PIN at this store. Please alert an admin to fix this issue for you!';
  return { status: status.DUPLICATE, record: null, errorMsg };
}
