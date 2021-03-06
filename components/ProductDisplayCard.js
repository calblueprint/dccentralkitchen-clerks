import PropTypes from 'prop-types';
import React from 'react';
import { Image } from 'react-native';
import Colors from '../constants/Colors';
import { ProductCard } from '../styled/checkout';
import { Body, Caption } from './BaseComponents';

/**
 * @prop
 * */

function ProductDisplayCard({ product }) {
  return (
    <ProductCard>
      <Image
        source={{
          uri: product.imageUrl,
          scale: 0.1,
        }}
        style={{
          width: 113,
          height: 87,
          marginBottom: 8,
        }}
        borderRadius={4}
      />
      <Body numberOfLines={1} ellipsizeMode="tail">
        {product.name}
      </Body>
      <Caption numberOfLines={1} ellipsizeMode="tail" color={Colors.secondaryText}>
        {product.detail}
      </Caption>
    </ProductCard>
  );
}

ProductDisplayCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    detail: PropTypes.string,
    imageUrl: PropTypes.string,
  }),
};

ProductDisplayCard.defaultProps = {
  product: {
    name: '',
    detail: '',
    imageUrl: '',
  },
};

export default ProductDisplayCard;
