import BASE from '../lib/common';

function createStoresData(record) {
  return {
    name: record.get('Store Name'),
    id: record.id
  };
}

export async function loadStoreData() {
  const storesTable = BASE('Stores').select({ view: 'Grid view' });
  try {
    let records = await storesTable.firstPage();
    var fullStores = records.map(record => createStoresData(record));
    return fullStores;
  } catch (err) {
    console.error(err);
    return []; // TODO @tommypoa: silent fails
  }
}

// lookupClerk searches for clerks based on their
// store name and numeric password. If the user is found, we return the clerk's first
// and last name. Otherwise, we will display an error on the login screen.
export async function lookupClerk(storeId, password) {
  return new Promise((resolve, reject) => {
    BASE('Clerks')
      .select({
        maxRecords: 1,
        filterByFormula: `AND({Store ID} = '${storeId}', {Password} = '${password}')`
      })
      .eachPage(
        function page(records, fetchNextPage) {
          if (records.length == 0) {
            reject(
              'Incorrect store name and password combination. Please try again.'
            );
          } else {
            records.forEach(function(record) {
              resolve(record.getId());
            });
          }
          fetchNextPage();
        },
        //TODO fix this
        function done(err) {
          if (err) {
            reject(err);
          }
        }
      );
  }).catch(err => {
    console.error('Error looking up clerk', err);
  });
}
