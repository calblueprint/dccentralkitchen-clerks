import PropTypes from 'prop-types';
import React from 'react';
import Colors from '../constants/Colors';
import { displayDollarValue } from '../lib/checkoutUtils';
import { LineItem, LineItemRow } from '../styled/checkout';
import { Body, Subtitle } from './BaseComponents';

function TotalCard({ totalSale, totalPoints }) {
  return (
    <LineItem>
      <LineItemRow>
        <Subtitle>Total Sale</Subtitle>
        <Subtitle>{displayDollarValue(totalSale)}</Subtitle>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>Points Earned</Body>
        <Body color={Colors.secondaryText}>{`${totalPoints} pts`}</Body>
      </LineItemRow>
    </LineItem>
  );
}

export default TotalCard;

TotalCard.propTypes = {
  totalSale: PropTypes.number.isRequired,
  totalPoints: PropTypes.number.isRequired,
};
