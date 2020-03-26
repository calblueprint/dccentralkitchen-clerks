import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage } from 'react-native';
import { Body, ButtonLabel, FilledButtonContainer, Subhead, Title } from '../components/BaseComponents';
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
      let transaction = null;
      if (JSON.parse(await AsyncStorage.getItem('trainingMode'))) {
        transaction = this.props.navigation.state.params;
      } else {
        const { transactionId } = this.props.navigation.state.params;
        transaction = await getTransactionsById(transactionId);
      }
      this.setState({ transaction, isLoading: false });
    } catch (err) {
      console.error('Confirmation screen: loading transaction ', err);
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
    // Display last seven letters/digits as transaction code for Clerk to report issues
    const truncatedId = transaction.id.slice(-7);

    return (
      <ColumnContainer style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <ColumnContainer
          style={{ width: '33%', height: '35%', justifyContent: 'space-around', margin: 12, paddingBottom: 32 }}>
          <Title>Purchase Summary</Title>
          <SpaceBetweenRowContainer>
            <Subhead>Transaction ID</Subhead>
            <Subhead style={{ textTransform: 'uppercase' }}>{truncatedId}</Subhead>
          </SpaceBetweenRowContainer>
          <ColumnContainer style={{ width: '100%%', justifyContent: 'space-around' }}>
            <SpaceBetweenRowContainer>
              <Body>Points Earned</Body>
              <Body>{transaction.pointsEarned} pts</Body>
            </SpaceBetweenRowContainer>
            <SpaceBetweenRowContainer>
              <Body>Rewards Redeemed</Body>
              <Body>{transaction.rewardsApplied}</Body>
            </SpaceBetweenRowContainer>
          </ColumnContainer>
          <ColumnContainer style={{ width: '100%%', justifyContent: 'space-around' }}>
            <SpaceBetweenRowContainer>
              <Body>Subtotal</Body>
              <Body>{displayDollarValue(transaction.subtotal)}</Body>
            </SpaceBetweenRowContainer>
            {transaction.rewardsApplied > 0 && (
              <SpaceBetweenRowContainer>
                <Body>Rewards</Body>
                <Body>{displayDollarValue(transaction.discount, false)}</Body>
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
