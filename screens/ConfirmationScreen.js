import PropTypes from 'prop-types';
import React from 'react';
import { Body, ButtonLabel, FilledButtonContainer, Title } from '../components/BaseComponents';
import { getTransactionsById } from '../lib/airtable/request';
import { displayDollarValue } from '../lib/checkoutUtils';
import { ColumnContainer, SpaceBetweenRowContainer } from '../styled/shared';

export default class ConfirmationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      isLoading: true
    };
  }

  async componentDidMount() {
    try {
      // Could have done this by passing all info from CheckoutScreen,
      // But decided it was better to not silently fail if a transaction didn't make it to AirTable.
      const { transactionId } = this.props.navigation.state.params;
      const transaction = await getTransactionsById(transactionId);
      this.setState({ transaction, isLoading: false });
    } catch (err) {
      console.error(err);
    }
  }

  handleSubmit = () => {
    this.props.navigation.navigate('CustomerLookup');
  };

  render() {
    const { isLoading, transaction } = this.state;
    if (isLoading) {
      return null;
    }

    return (
      <ColumnContainer style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <ColumnContainer style={{ width: '33%', justifyContent: 'space-around', margin: 12, paddingBottom: 32 }}>
          <Title>Purchase Summary</Title>
          <ColumnContainer style={{ width: '100%%', justifyContent: 'space-around', margin: 12 }}>
            <SpaceBetweenRowContainer>
              <Body>Points Earned</Body>
              <Body>{transaction.pointsEarned} pts</Body>
            </SpaceBetweenRowContainer>
            <SpaceBetweenRowContainer style={{ paddingBottom: 12 }}>
              <Body>Rewards Redeemed</Body>
              <Body>{transaction.rewardsApplied}</Body>
            </SpaceBetweenRowContainer>
            <SpaceBetweenRowContainer>
              <Body>Subtotal</Body>
              <Body>{displayDollarValue(transaction.discount)}</Body>
            </SpaceBetweenRowContainer>
            {transaction.rewardsApplied > 0 && (
              <SpaceBetweenRowContainer>
                <Body>Total Discounts</Body>
                <Body>{displayDollarValue(transaction.discount)}</Body>
              </SpaceBetweenRowContainer>
            )}
            <SpaceBetweenRowContainer>
              <Body>Total Sale</Body>
              <Body>{displayDollarValue(transaction.totalPrice)}</Body>
            </SpaceBetweenRowContainer>
          </ColumnContainer>
        </ColumnContainer>
        <FilledButtonContainer
          onPress={() => this.handleSubmit()}
          width="33%"
          height="40px"
          style={{ borderRadius: 20 }}>
          <ButtonLabel>Next Customer</ButtonLabel>
        </FilledButtonContainer>
      </ColumnContainer>
    );
  }
}

ConfirmationScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
