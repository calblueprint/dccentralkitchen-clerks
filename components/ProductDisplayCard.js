import React from 'react';
import { Image } from 'react-native';
import Colors from '../assets/Colors';
import { ProductCard } from '../styled/checkout';
import { Body, Caption } from './BaseComponents';

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
          height: 87,
          marginBottom: 8
        }}
        borderRadius={4}
      />
      <Body>{product.name}</Body>
      <Caption color={Colors.secondaryText}>{product.detail}</Caption>
    </ProductCard>
  );
}

export default ProductDisplayCard;
