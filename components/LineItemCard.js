import PropTypes from 'prop-types';
import React from 'react';
import Colors from '../constants/Colors';
import { calculateLineItemPrice, displayDollarValue } from '../lib/checkoutUtils';
import { LineItem, LineItemRow } from '../styled/checkout';
import { Body, Subhead } from './BaseComponents';

/**
 * @prop
 * */

function LineItemCard({ product }) {
  return (
    <LineItem>
      <LineItemRow>
        <Subhead>{product.name}</Subhead>
        <Subhead>{displayDollarValue(calculateLineItemPrice(product))}</Subhead>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>{product.detail}</Body>
        <Body color={Colors.secondaryText}>{`${product.points * product.quantity} pts`}</Body>
      </LineItemRow>
      <LineItemRow>
        <Body color={Colors.secondaryText}>{`Qty: ${product.quantity}`}</Body>
      </LineItemRow>
    </LineItem>
  );
}

LineItemCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    detail: PropTypes.string,
    points: PropTypes.number,
    quantity: PropTypes.number,
  }),
};

LineItemCard.defaultProps = {
  product: {
    name: '',
    detail: '',
    points: 0,
    quantity: 0,
  },
};

export default LineItemCard;
