import React from 'react';
import { Text } from 'react-native';
import { ProductBody, ProductCardContainer } from '../styled/checkout.js';

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
