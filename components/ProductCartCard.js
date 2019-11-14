import React from "react";
import { Image, View } from "react-native";

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
    </ProductCardContainer>
    // </View>
  );
}

export default ProductCartCard;
