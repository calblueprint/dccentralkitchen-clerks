import React from "react";
import { Image, View, Text } from "react-native";

import { ProductBody, ProductCardContainer } from "../styles.js";

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function ProductCartCard({ product }) {
  return (
    // <View style={{ alignItems: 'center' }}>
    <ProductCardContainer>
      <ProductBody>{product.name}</ProductBody>
      <Text>{product.cartCount}</Text>
    </ProductCardContainer>
    // </View>
  );
}

export default ProductCartCard;
