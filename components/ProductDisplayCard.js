import React from 'react';
import { Image, View } from 'react-native';
import { ProductBody } from '../styled/checkout.js';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function ProductDisplayCard({ product }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image
        source={{
          uri: product.image,
          scale: 0.1
        }}
        style={{ width: 50, height: 50, borderRadius: 80 / 2 }}
      />
      <ProductBody>{product.name}</ProductBody>
    </View>
  );
}

export default ProductDisplayCard;