import React from 'react';
import { Image } from 'react-native';
import { ProductCard, ItemName, ItemDetail } from '../styled/checkout.js';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function ProductDisplayCard({ product }) {
  return (
    <ProductCard>
      <Image
        source={{
          uri: product.image,
          scale: 0.1
        }}
        style={{
          width: 113,
          height: 87,
          marginLeft: 8,
          marginRight: 8,
          marginTop: 7
        }}
        borderRadius={4}
      />
      <ItemName>{product.name}</ItemName>
      <ItemDetail>{product.detail}</ItemDetail>
    </ProductCard>
  );
}

export default ProductDisplayCard;
