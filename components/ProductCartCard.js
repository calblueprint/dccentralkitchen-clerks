import React from 'react';
import { View } from 'react-native';
import { LineItem, LineItemRow } from '../styled/checkout.js';
import Colors from '../assets/Colors';
import { Subhead, Body } from '../components/BaseComponents';
import { calculateLineItemPrice } from '../lib/checkoutUtils';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function ProductCartCard({ product }) {
  return (
    // <View style={{ alignItems: 'center' }}>
    <LineItem>
      <LineItemRow>
        <Subhead>{product.name}</Subhead>
        <Subhead>${calculateLineItemPrice(product)}</Subhead>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>{product.detail}</Body>
        <Body color={Colors.secondaryText}>{product.points * product.cartCount} pts</Body>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>Qty: {product.cartCount}</Body>
      </LineItemRow>
    </LineItem>
    // </View>
  );
}

export default ProductCartCard;
