import { env } from '../environment';

const RecordIds = {
  testCustomerId: null,
  // Jeffry Poa
  testClerkId: null,
  // A&S Grocery
  testStoreId: null,
  testTransactionId: null,
};

// IDs from DEV base
if (env === 'dev') {
  RecordIds.testCustomerId = 'reckx2p4fwyfCgg3i';
  RecordIds.testClerkId = 'recuK1PmynsN0Mpbu';
  RecordIds.testStoreId = 'recq488vtYG0KUhk6';
  RecordIds.testTransactionId = 'recS2pXktslghQzQ9';

  // IDs from PROD base
} else if (env === 'prod') {
  RecordIds.testCustomerId = 'recqx32YmmACiRWMq';
  RecordIds.testClerkId = 'recgq59j7Cx9zsSYE';
  RecordIds.testStoreId = 'recw49LpAOInqvX3e';
  RecordIds.testTransactionId = 'recbzHBnoo0WhtoSy';
}

export default RecordIds;
