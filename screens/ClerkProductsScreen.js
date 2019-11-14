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
    customerCost: object["Customer Cost"]
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

  addToCart() {}

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
    console.log(products);
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 2 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ScrollView
              horizontal={true}
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
            <FlatList
              // TODO @tommypoa refactor styles to use styled-components
              style={styles.container}
              keyExtractor={(item, _) => item.id}
              numColumns={3}
              data={products}
              renderItem={({ item }) => (
                // TODO @tommypoa: think it would be better to extract the `onPress` here,
                // and possibly create the Button wrapping a Product using a function as with other components, but in-file
                <Button onPress={() => this.addToCart()}>
                  <Product product={item} />
                </Button>
              )}
            ></FlatList>
          </ScrollView>
        </View>
        <ScrollView style={{ flex: 1 }}>
          <ProductCartCard product={products[0]} />
        </ScrollView>
      </View>
    );
  }
}

export default ClerkProductsScreen;
