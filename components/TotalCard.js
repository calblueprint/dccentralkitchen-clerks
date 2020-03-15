import React from 'react';
import { LineItem, LineItemRow } from '../styled/checkout.js';
import Colors from '../assets/Colors';
import { Body, Subhead } from '../components/BaseComponents';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function TotalCard({ totalPrice, totalPoints }) {
  return (
    <LineItem>
      <LineItemRow>
        <Subhead>Total</Subhead>
        <Subhead>${totalPrice}</Subhead>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>Points Earned</Body>
        <Body color={Colors.secondaryText}>{totalPoints} pts</Body>
      </LineItemRow>
    </LineItem>
  );
}

export default TotalCard;
