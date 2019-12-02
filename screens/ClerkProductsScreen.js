import React from "react";
import { View, FlatList } from "react-native";
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

class ClerkProductsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fullProducts: [],
      products: [],
      filter: null,
      cart: [],
      isLoading: true
    };
  }

  async componentDidMount() {
    const productsData = await loadProductsData();
    this.setState({
      fullProducts: productsData,
      products: productsData,
      isLoading: false
    });
  }

  addToCart(item) {
    item.cartCount++;
    var currentCart = this.state.cart;
    var currentItem = currentCart.filter(product => product.id == item.id);
    if (currentItem.length == 0) {
      currentCart.push(item);
    }
    this.setState({
      cart: currentCart
    });
  }

  removeFromCart(item) {
    item.cartCount--;
    var currentCart = this.state.cart;
    currentCart = currentCart.filter(item => item.cartCount > 0);
    this.setState({
      cart: currentCart
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

  render() {
    const products = this.state.products;
    const cart = this.state.cart;
    if (this.state.isLoading) {
      return null; // TODO @tommypoa waiting (flavicon?)
    }
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <ScrollView style={{ flex: 1 }} showsHorizontalScrollIndicator={false}>
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
        <ScrollView style={{ flex: 3 }}>
          {cart.map((product, index) => (
            <Button onPress={() => this.removeFromCart(product)}>
              <ProductCartCard product={product} />
            </Button>
          ))}
        </ScrollView>
      </View>
    );
  }
}

export default ClerkProductsScreen;
