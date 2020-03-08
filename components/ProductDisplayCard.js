import React from 'react';
import { Image, View } from 'react-native';
import { ProductBody } from '../styled/checkout';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function ProductDisplayCard({ product }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image
        source={{
          uri: product.imageUrl,
          scale: 0.1
        }}
        style={{ width: 50, height: 50, borderRadius: 80 / 2 }}
      />
      <ProductBody>{product.name}</ProductBody>
    </View>
  );
}

export default ProductDisplayCard;
