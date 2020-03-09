import React from 'react';
import { Image } from 'react-native';
import { ProductCard } from '../styled/checkout.js';
import { Body, Caption } from '../components/BaseComponents';
import Colors from '../assets/Colors';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function ProductDisplayCard({ product }) {
  return (
    <ProductCard>
      <Image
        source={{
          uri: product.imageUrl,
          scale: 0.1
        }}
        style={{
          width: 113,
          height: 87
        }}
        borderRadius={4}
      />
      <Body>{product.name}</Body>
      <Caption color={Colors.secondaryText}>{product.detail}</Caption>
    </ProductCard>
  );
}

export default ProductDisplayCard;
