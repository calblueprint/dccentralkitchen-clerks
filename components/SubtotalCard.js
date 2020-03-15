import React from 'react';
import { LineItem, LineItemRow } from '../styled/checkout.js';
import Colors from '../assets/Colors';
import { Body } from '../components/BaseComponents';

/**
 * @prop
 **/

// TODO @tommypoa to use styled-components
function SubtotalCard({ subtotalPrice, rewardsAmount }) {
  return (
    <LineItem>
      <LineItemRow>
        <Body>Subtotal</Body>
        <Body>${subtotalPrice}</Body>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.primaryGreen}>Rewards</Body>
        <Body color={Colors.primaryGreen}>-${rewardsAmount}.00</Body>
      </LineItemRow>
    </LineItem>
  );
}

export default SubtotalCard;
