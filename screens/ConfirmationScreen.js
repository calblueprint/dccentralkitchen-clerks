import PropTypes from 'prop-types';
import React from 'react';
import { Alert, AsyncStorage, Clipboard, View } from 'react-native';
import {
  Body,
  ButtonContainer,
  ButtonLabel,
  FilledButtonContainer,
  Subhead,
  Title,
} from '../components/BaseComponents';
import DrawerButton from '../components/DrawerButton';
import { getTransactionsById } from '../lib/airtable/request';
import { displayDollarValue } from '../lib/checkoutUtils';
import { logErrorToSentry } from '../lib/logUtils';
import { ColumnContainer, RowContainer, SpaceBetweenRowContainer } from '../styled/shared';

export default class ConfirmationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      isLoading: true,
    };
  }

  async componentDidMount() {
    try {
      // Could have done this by passing all info from CheckoutScreen,
      // But decided it was better to not silently fail if a transaction didn't make it to Airtable.
      let transaction = null;
      // Clerk training: use local transaction instead of getting it from Airtable.
      if (JSON.parse(await AsyncStorage.getItem('trainingMode'))) {
        transaction = this.props.route.params;
      } else {
        const { transactionId } = this.props.route.params;
        transaction = await getTransactionsById(transactionId);
      }
      this.setState({ transaction, isLoading: false });
    } catch (err) {
      logErrorToSentry({
        screen: 'Confirmation Screen',
        action: 'loadTransactions',
        error: err,
      });
      console.error('Confirmation screen: loading transaction ', err);
    }
  }

  handleSubmit = () => {
    this.props.navigation.navigate('CustomerLookup');
  };

  writeToClipboard = (copyText) => {
    Clipboard.setString(copyText);
    Alert.alert('Copied to Clipboard!', copyText);
  };

  render() {
    const { isLoading, transaction } = this.state;
    if (isLoading) {
      return null;
    }
    // Display last seven letters/digits as transaction code for Clerk to report issues
    const truncatedId = transaction.id.slice(-7);

    return (
      <View>
        <RowContainer
          style={{
            zIndex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            marginTop: 33,
            marginLeft: 29,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <DrawerButton navigation={this.props.navigation} light={false} />
          <Title style={{ marginLeft: 16 }}>{this.state.clerkName}</Title>
        </RowContainer>
        <ColumnContainer style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <ColumnContainer
            style={{ width: '33%', height: '35%', justifyContent: 'space-around', margin: 12, paddingBottom: 32 }}>
            <Title>Sale Summary</Title>
            <SpaceBetweenRowContainer>
              <Subhead>Transaction ID</Subhead>
              <ButtonContainer onLongPress={() => this.writeToClipboard(truncatedId)}>
                <Subhead style={{ textTransform: 'uppercase' }}>{truncatedId}</Subhead>
              </ButtonContainer>
            </SpaceBetweenRowContainer>
            <ColumnContainer style={{ width: '100%', justifyContent: 'space-around' }}>
              <SpaceBetweenRowContainer>
                <Body>Points Earned</Body>
                <Body>{`${transaction.pointsEarned} pts`}</Body>
              </SpaceBetweenRowContainer>
              <SpaceBetweenRowContainer>
                <Body>Rewards Redeemed</Body>
                <Body>{transaction.rewardsApplied}</Body>
              </SpaceBetweenRowContainer>
            </ColumnContainer>
            <ColumnContainer style={{ width: '100%', justifyContent: 'space-around' }}>
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
                <Body>{displayDollarValue(transaction.totalSale)}</Body>
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
      </View>
    );
  }
}

ConfirmationScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};
