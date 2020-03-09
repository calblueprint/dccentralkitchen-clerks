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
          <Body>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Nec sagittis aliquam malesuada bibendum arcu vitae. Enim praesent elementum facilisis
            leo. Vulputate mi sit amet mauris commodo quis imperdiet massa. Venenatis a condimentum vitae sapien
            pellentesque. Id consectetur purus ut faucibus pulvinar elementum.
          </Body>
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
          <SpaceBetweenRowContainer>
            <Body>Total:</Body>
            <Body>${transaction.totalPrice}</Body>
          </SpaceBetweenRowContainer>
        </ColumnContainer>
        <FilledButtonContainer onPress={() => this.handleSubmit()} width="236" height="46" style={{ borderRadius: 20 }}>
          <ButtonLabel>Next Customer</ButtonLabel>
        </FilledButtonContainer>
      </ColumnContainer>
    );
  }
}

ConfirmationScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
