import { getCustomersByPhoneNumber } from './airtable/request';
import { status } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function lookupCustomer(phoneNumber) {
  const records = await getCustomersByPhoneNumber(phoneNumber);

  let errorMsg = 'Invalid phone number';
  // No customer with this phone number
  if (records.length === 0) {
    return { status: status.NOT_FOUND, record: null, errorMsg };
  }
  if (records.length === 1) {
    // If found, no error message
    const customer = records[0];
    errorMsg = '';
    return { status: status.FOUND, record: customer, errorMsg };
  }
  // There is more than one customer registered with this phone number. Clerks should report to an admin, who can fix the database.
  errorMsg =
    'Database error: more than one customer is registered with this phone number. Please report this issue to an admin!';
  return { status: status.DUPLICATE, record: null, errorMsg };
}
