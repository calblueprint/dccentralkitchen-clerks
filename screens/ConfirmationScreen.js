import PropTypes from 'prop-types';
import React from 'react';
import { Body, ButtonLabel, FilledButtonContainer, Title } from '../components/BaseComponents';
import { getTransactionsById } from '../lib/airtable/request';
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

  async handleSubmit() {
    try {
      this.props.navigation.navigate('CustomerLookup');
    } catch (err) {
      console.error('AsyncStorage: ', err);
    }
  }

  render() {
    const { isLoading, transaction } = this.state;
    if (isLoading) {
      return null;
    }
    return (
      <ColumnContainer style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <ColumnContainer style={{ width: '33%', paddingBottom: 48 }}>
          <Title>Purchase Recorded! </Title>
        </ColumnContainer>
        <ColumnContainer style={{ width: '33%', justifyContent: 'space-around', margin: 12, paddingBottom: 48 }}>
          <Title>Purchase Total</Title>
          <SpaceBetweenRowContainer>
            <Body>Points Earned:</Body>
            <Body>{transaction.pointsEarned}</Body>
          </SpaceBetweenRowContainer>
          <SpaceBetweenRowContainer>
            <Body>Rewards Redeemed:</Body>
            <Body>{transaction.rewardsApplied}</Body>
          </SpaceBetweenRowContainer>

          {transaction.rewardsApplied > 0 && (
            <SpaceBetweenRowContainer>
              <Body>Total Discounts:</Body>
              <Body>${(transaction.rewardsApplied * 5).toFixed(2)}</Body>
            </SpaceBetweenRowContainer>
          )}
          <SpaceBetweenRowContainer>
            <Body>Total:</Body>
            <Body>${transaction.totalPrice.toFixed(2)}</Body>
          </SpaceBetweenRowContainer>
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
