import React from "react";
import { Image, View } from "react-native";

import { ProductBody, ProductContainer } from "../styles.js";

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function Product({ product }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={{
          uri: product.image,
          scale: 0.3 // NOTE: you can use the small airtable thumbnails or rescale the original png
        }}
        style={{ width: 50, height: 50, borderRadius: 80 / 2 }}
      />
      <ProductBody>{product.name}</ProductBody>
    </View>
  );
}

export default Product;
