import React from 'react';
import { View } from 'react-native';
import { LineItem } from '../styled/checkout.js';
import Colors from '../assets/Colors';
import { Subhead, Body } from '../components/BaseComponents';

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
        <Subhead style={{ justifyContent: 'flex-start', textTransform: 'uppercase' }}>{product.name}</Subhead>
        <Subhead style={{ justifyContent: 'flex-end' }}>
          ${(product.customerCost * product.cartCount).toFixed(2)}
        </Subhead>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginLeft: 24,
          marginRight: 26
        }}>
        <Body style={{ justifyContent: 'flex-start' }} color={Colors.secondaryText}>
          {product.detail}
        </Body>
        <Subhead style={{ justifyContent: 'flex-end' }} color={Colors.secondaryText}>
          {product.points * product.cartCount} pts
        </Subhead>
      </View>
      {/* TODO: fix janky margin-top logic */}
      <Body style={{ marginLeft: 24, marginBottom: 11, marginTop: -5 }} color={Colors.secondaryText}>
        Qty: {product.cartCount}
      </Body>
    </LineItem>
    // </View>
  );
}

export default ProductCartCard;
