import React from "react";
import { View, FlatList, AsyncStorage, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import Product from "../components/Product";
import ProductCartCard from "../components/ProductCartCard";
import { BASE } from "../lib/common";
import {
  Button,
  ScrollCategory,
  styles,
  ProductCardContainer
} from "../styles";

const categories = [
  // Hard-coded for now -- should find a way to extract this information dynamically?
  "All",
  "Cut Fruit & Packaged Products",
  "Fruit",
  "Vegetables",
  "Frozen & Dried"
];

var customer;

async function loadProductsData() {
  const productsTable = BASE("Products").select({ view: "Grid view" });
  try {
    var records = await productsTable.firstPage();
    var fullProducts = records.map(record => createProductData(record));
    return fullProducts;
  } catch (err) {
    console.error(err);
    return []; // TODO @tommypoa: silent fails
  }
}

async function getUser(table, id) {
  const customersTable = BASE("Customers");
  try {
    var record = await customersTable.find(id);
    var customer = createCustomerData(record);
    return customer;
  } catch (err) {
    console.error(err);
    return "not a customer";
  }
}

function createProductData(record) {
  object = record.fields;
  return {
    name: object["Name"],
    id: record.id,
    category: object["Category"],
    points: object["Points"],
    customerCost: object["Customer Cost"],
    cartCount: 0
  };
}

function createCustomerData(record) {
  object = record.fields;
  return {
    name: object["Name"],
    id: record.id,
    points: object["Points"],
    phoneNumber: object["Phone Number"],
    rewards: object["Rewards"]
  };
}

export class ClerkProductsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      fullProducts: [],
      products: [],
      filter: null,
      cart: [],
      isLoading: true,
      totalPrice: 0,
      totalPoints: 0
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem("customerId");

    const customer = await getUser("Customers", customerId);

    const productsData = await loadProductsData();
    this.setState({
      customer: customer,
      fullProducts: productsData,
      products: productsData,
      isLoading: false
    });
  }

  async updateCustomerPoints() {
    return new Promise((resolve, reject) => {
      BASE("Customers").update(
        [
          {
            id: this.state.customer.id,
            fields: {
              Points: this.state.customer.points + this.state.totalPoints
            }
          }
        ],
        function(err) {
          if (err) {
            console.error("points", err);
            return;
          }
        }
      );
    });
  }

  async calculateProductsPurchased(transactionId) {
    var itemIds = [];
    const lineItemsTable = BASE("Line Items");
    for (var i = 0; i < this.state.cart.length; i++) {
      var itemId = await new Promise((resolve, reject) => {
        lineItemsTable.create(
          [
            {
              fields: {
                Transactions: [transactionId],
                Product: [this.state.cart[i].id],
                Quantity: this.state.cart[i].cartCount
              }
            }
          ],
          function(err, records) {
            if (err) {
              console.error("line item", err);
              reject(err, "Couldn't create line item");
            }
            records.forEach(function(record) {
              console.log(record.getId());
              resolve(record.getId());
            });
          }
        );
      });
      itemIds.push(itemId);
    }
    console.log("item ids", itemIds);
    return itemIds;
  }

  async addTransaction() {
    var store = await AsyncStorage.getItem("storeId");
    var transactionId = await new Promise((resolve, reject) => {
      BASE("Transactions").create(
        [
          {
            fields: {
              "Customer Lookup (Phone #)": this.state.customer.phoneNumber,
              Customer: [this.state.customer.id],
              Store: [store],
              "Products Purchased": [],
              "Points Rewarded": this.state.totalPoints
            }
          }
        ],
        function(err, records) {
          if (err) {
            console.error("transaction", err);
            reject(err, "Couldn't add transaction");
          }
          records.forEach(function(record) {
            console.log(record.getId());
            resolve(record.getId());
          });
        }
      );
    });

    var itemIds = await this.calculateProductsPurchased(transactionId);

    BASE("Transactions").update(
      [
        {
          id: transactionId,
          fields: {
            "Products Purchased": itemIds
          }
        }
      ],
      function(err) {
        if (err) {
          console.error("updating products", err);
          return;
        }
      }
    );
  }

  addToCart(item) {
    item.cartCount++;
    var currentCart = this.state.cart;
    var currentItem = currentCart.filter(product => product.id == item.id);
    var totalPrice = this.state.totalPrice;
    totalPrice = totalPrice + item.customerCost;
    if (currentItem.length == 0) {
      currentCart.push(item);
    }
    this.setState({
      cart: currentCart,
      totalPrice: totalPrice
    });
  }

  removeFromCart(item) {
    item.cartCount--;
    var currentCart = this.state.cart;
    currentCart = currentCart.filter(item => item.cartCount > 0);
    var totalPrice = this.state.totalPrice;
    totalPrice = totalPrice - item.customerCost;
    this.setState({
      cart: currentCart,
      totalPrice: totalPrice
    });
  }

  handleCategoryPress = filter => {
    const toSet =
      filter == "All"
        ? this.state.fullProducts
        : this.state.fullProducts.filter(product =>
            product.category.includes(filter)
          );
    this.setState({ products: toSet });
  };

  async handleSubmit() {
    var points = 0;
    for (var i = 0; i < this.state.cart.length; i++) {
      const cartItem = this.state.cart[i];
      points = points + cartItem["points"] * cartItem["cartCount"];
    }
    this.setState({ totalPoints: points });
    await this.addTransaction();
    await this.updateCustomerPoints();
  }

  render() {
    const products = this.state.products;
    const cart = this.state.cart;
    if (this.state.isLoading) {
      return null; // TODO @tommypoa waiting (flavicon?)
    }
    return (
      <View style={{ flex: 1, marginTop: "15%" }}>
        <Text style={{ padding: "5%" }}>
          Customer: {this.state.customer.name}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <ScrollView
            style={{ flex: 1 }}
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category, index) => (
              <Button
                key={index}
                onPress={() => this.handleCategoryPress(category)}
              >
                <ScrollCategory> {category} </ScrollCategory>
              </Button>
            ))}
          </ScrollView>
          <View style={{ flex: 2 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FlatList
                // TODO @tommypoa refactor styles to use styled-components
                style={styles.container}
                keyExtractor={(item, _) => item.id}
                numColumns={3}
                data={products}
                renderItem={({ item }) => (
                  // TODO @tommypoa: think it would be better to extract the `onPress` here,
                  // and possibly create the Button wrapping a Product using a function as with other components, but in-file
                  <Button onPress={() => this.addToCart(item)}>
                    <Product product={item} />
                  </Button>
                )}
              ></FlatList>
            </ScrollView>
          </View>
          <View style={{ flex: 2 }}>
            <ScrollView style={{ alignSelf: "flex-start" }}>
              {cart.map((product, index) => (
                <Button onPress={() => this.removeFromCart(product)}>
                  <ProductCartCard product={product} />
                </Button>
              ))}
            </ScrollView>
            <Text style={{ alignSelf: "flex-end" }}>
              Order Total ${this.state.totalPrice.toFixed(2)}
            </Text>
            <Button
              style={{ alignSelf: "flex-end", textAlign: "center" }}
              onPress={() => this.handleSubmit()}
            >
              <Text>COMPLETE</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

export default ClerkProductsScreen;
