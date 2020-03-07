import React from 'react';
import { View } from 'react-native';
import {
  LineItem,
  LineItemDetail,
  LineItemName,
  LineItemPoints,
  LineItemPrice,
  LineItemQuantity
} from '../styled/checkout.js';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function ProductCartCard({ product }) {
  return (
    // <View style={{ alignItems: 'center' }}>
    <LineItem>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginLeft: 24,
          marginRight: 26,
          marginTop: 13
        }}>
        <LineItemName style={{ justifyContent: 'flex-start' }}>
          {product.name}
        </LineItemName>
        <LineItemPrice style={{ justifyContent: 'flex-end' }}>
          ${(product.customerCost * product.cartCount).toFixed(2)}
        </LineItemPrice>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginLeft: 24,
          marginRight: 26
        }}>
        <LineItemDetail style={{ justifyContent: 'flex-start' }}>
          {product.detail}
        </LineItemDetail>
        <LineItemPoints style={{ justifyContent: 'flex-end' }}>
          {product.points * product.cartCount} pts
        </LineItemPoints>
      </View>
      <LineItemQuantity
        style={{ marginLeft: 24, marginBottom: 11, marginTop: 0 }}>
        Qty: {product.cartCount}
      </LineItemQuantity>
    </LineItem>
    // </View>
  );
}

export default ProductCartCard;
