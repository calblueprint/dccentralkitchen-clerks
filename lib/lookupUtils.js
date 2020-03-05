import BASE from '../lib/common';

export async function getUser(table, id) {
  return BASE(table).find(id);
}

export async function lookupCustomer(phoneNumber) {
  return new Promise((resolve, reject) => {
    BASE('Customers')
      .select({
        maxRecords: 1,
        filterByFormula: `{Phone Number} = '${phoneNumber}'`
      })
      .eachPage(function page(records, fetchNextPage) {
        if (records.length == 0) {
          reject('Incorrect customer phone number. Please try again.');
        } else {
          records.forEach(function(record) {
            resolve(record.getId());
          });
        }
        fetchNextPage();
      });
  }).catch(err => {
    console.error('Error looking up customer', err);
  });
}
