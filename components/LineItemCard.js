import React from 'react';
import Colors from '../constants/Colors';
import { calculateLineItemPrice, displayDollarValue } from '../lib/checkoutUtils';
import { LineItem, LineItemRow } from '../styled/checkout';
import { Body, Subhead } from './BaseComponents';

/**
 * @prop
 **/

function LineItemCard({ product }) {
  return (
    <LineItem>
      <LineItemRow>
        <Subhead>{product.name}</Subhead>
        <Subhead>{displayDollarValue(calculateLineItemPrice(product))}</Subhead>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>{product.detail}</Body>
        <Body color={Colors.secondaryText}>{product.points * product.quantity} pts</Body>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>Qty: {product.quantity}</Body>
      </LineItemRow>
    </LineItem>
  );
}

export default LineItemCard;
