import PropTypes from 'prop-types';
import React from 'react';
import Colors from '../constants/Colors';
import { displayDollarValue } from '../lib/checkoutUtils';
import { LineItem, LineItemRow } from '../styled/checkout';
import { Body } from './BaseComponents';

function SubtotalCard({ subtotalPrice, rewardsAmount }) {
  return (
    <LineItem>
      <LineItemRow>
        <Body>Subtotal</Body>
        <Body>{displayDollarValue(subtotalPrice)}</Body>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.primaryGreen}>Rewards</Body>
        <Body color={Colors.primaryGreen}>{displayDollarValue(rewardsAmount, false)}</Body>
      </LineItemRow>
    </LineItem>
  );
}

export default SubtotalCard;

SubtotalCard.propTypes = {
  subtotalPrice: PropTypes.number.isRequired,
  rewardsAmount: PropTypes.number.isRequired,
};
