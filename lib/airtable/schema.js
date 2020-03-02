/*
    THIS IS A GENERATED FILE
    Changes might be overwritten in the future, edit with caution!
*/

export const Tables = {
  Customers: 'Customers',
  PushTokens: 'Push Tokens',
  Clerks: 'Clerks',
  Transactions: 'Transactions',
  LineItems: 'Line Items',
  Stores: 'Stores',
  Products: 'Products',
  News: 'News',
  Receipts: 'Receipts',
  Recipes: 'Recipes',
  Resources: 'Resources'
};

export const Columns = {
  Customers: {
    primaryKey: `Primary Key`,
    firstName: `First Name`,
    lastName: `Last Name`,
    zipcode: `Zipcode`,
    phoneNumber: `Phone Number`,
    password: `Password`,
    points: `Points`,
    rewardsAvailable: `Rewards Available`,
    transactionIds: `Transactions`,
    receiptIds: `Receipts`,
    pushTokenIds: `Push Tokens`,
    name: `Name`,
    rewardsRedeemed: `Rewards Redeemed`,
    id: `id`
  },
  'Push Tokens': {
    primaryKey: `Primary Key`,
    createdDate: `Created Date`,
    customerId: `Customer`,
    customerName: `Customer Name`,
    token: `Token`,
    id: `id`
  },
  Clerks: {
    primaryKey: `Primary Key`,
    firstName: `First Name`,
    lastName: `Last Name`,
    password: `Password`,
    transactionIds: `Transactions`,
    storeId: `Store`,
    clerkName: `Clerk Name`,
    id: `id`,
    storeName: `Store Name`,
    storeId: `Store ID`
  },
  Transactions: {
    primaryKey: `Primary Key`,
    storeId: `Store`,
    productsPurchasedId: `Products Purchased`,
    customerId: `Customer`,
    receiptIds: `Receipts`,
    date: `Date`,
    pointsEarned: `Points Earned`,
    clerkId: `Clerk`,
    customerName: `Customer Name`,
    lineItems: `Line Items`,
    storeName: `Store Name`,
    id: `id`,
    rewardsApplied: `Rewards Applied`
  },
  'Line Items': {
    primaryKey: `Primary Key`,
    productId: `Product`,
    quantity: `Quantity`,
    totalPrice: `Total price`,
    productPrice: `Product price`,
    transactionId: `Transaction`,
    productFullName: `Product Full Name`,
    id: `id`
  },
  Stores: {
    primaryKey: `Primary Key`,
    ward: `Ward`,
    address: `Address`,
    storeHours: `Store Hours`,
    snapOrEbtAccepted: `SNAP or EBT Accepted`,
    couponProgramPartner: `Coupon Program Partner`,
    transactionIds: `Transactions`,
    latitude: `Latitude`,
    longitude: `Longitude`,
    id: `id`,
    clerkIds: `Clerks`,
    productIds: `Products`,
    storeName: `Store Name`,
    rewardsAccepted: `Rewards Accepted`
  },
  Products: {
    primaryKey: `Primary Key`,
    category: `Category`,
    customerCost: `Customer Cost`,
    points: `Points`,
    multiplier: `Multiplier`,
    id: `id`,
    lineItemIds: `Line Items`,
    name: `Name`,
    storeIds: `Stores`,
    image: `Image`,
    detail: `Detail`,
    fullName: `Full Name`
  },
  News: {
    primaryKey: `Primary Key`,
    created: `Created`,
    description: `Description`,
    id: `id`,
    postDate: `Post Date`,
    title: `Title`
  },
  Receipts: {
    primaryKey: `Primary Key`,
    transactionId: `Transaction`,
    attachments: `Attachments`,
    time: `Time`,
    customerId: `Customer`,
    customerName: `Customer Name`,
    id: `id`
  },
  Recipes: {
    primaryKey: `Primary Key`,
    servings: `Servings`,
    prepTimeminutes: `Prep Time (minutes)`,
    cookTimeminutes: `Cook Time (minutes)`,
    ingredients: `Ingredients`,
    instructions: `Instructions`,
    title: `Title`,
    field8: `Field 8`
  },
  Resources: {
    primaryKey: `Primary Key`,
    url: `URL`
  }
};
