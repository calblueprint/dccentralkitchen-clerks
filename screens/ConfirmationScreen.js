import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { Body, ButtonLabel, FilledButtonContainer, Title } from '../components/BaseComponents';
import { getTransactionsById } from '../lib/airtable/request';

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
      <View>
        <Title>Purchase Recorded! </Title>
        <Body>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Nec sagittis aliquam malesuada bibendum arcu vitae. Enim praesent elementum facilisis leo.
          Vulputate mi sit amet mauris commodo quis imperdiet massa. Venenatis a condimentum vitae sapien pellentesque.
          Id consectetur purus ut faucibus pulvinar elementum.
        </Body>
        <Title>Purchase Total</Title>
        <Body>Points Earned: {transaction.pointsEarned}</Body>
        <Body>Rewards Redeemed: {transaction.rewardsRedeemed}</Body>
        <Body>Total: ${transaction.totalPrice}</Body>
        <FilledButtonContainer onPress={() => this.handleSubmit()}>
          <ButtonLabel>Next Customer</ButtonLabel>
        </FilledButtonContainer>
      </View>
    );
  }
}

ConfirmationScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
