import AsyncStorage from '@react-native-community/async-storage';
import { StackActions } from '@react-navigation/native';
import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import update from 'react-addons-update';
import { Alert, Dimensions, View } from 'react-native';
import AlertAsync from 'react-native-alert-async';
import * as Sentry from 'sentry-expo';
import BackButton from '../components/BackButton';
import BadgeIcon from '../components/BadgeIcon';
import { ButtonContainer, ButtonLabel, FilledButtonContainer, Title } from '../components/BaseComponents';
import CurrentSale from '../components/CurrentSale';
import Colors from '../constants/Colors';
import { isTablet } from '../constants/Layout';
import { rewardDollarValue } from '../constants/Rewards';
import { getCustomerById } from '../lib/airtable/request';
import {
  addTransaction,
  calculateEligibleRewards,
  createFakeTransaction,
  displayDollarValue,
  loadProductsData,
  updateCustomerPoints,
} from '../lib/checkoutUtils';
import { productCardPxHeight, productCardPxWidth } from '../lib/constants';
import { logErrorToSentry } from '../lib/logUtils';
import { BottomBar, ProductsContainer, TabContainer, TopBar } from '../styled/checkout';
import { ColumnContainer } from '../styled/shared';
import QuantityModal from './modals/QuantityModal';

export default class CheckoutScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Populated in componentDidMount
      customer: null,
      cart: {},
      lineItems: [],
      rewardsAvailable: 0,
      // Other state
      totalBalance: 0,
      rewardsApplied: 0,
      products: [],
      isLoading: true,
      showCurrentSale: isTablet,
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem('customerId');
    const customer = await getCustomerById(customerId);
    const products = await loadProductsData();
    const training = JSON.parse(await AsyncStorage.getItem('trainingMode'));
    // Initialize cart a'la Python dictionary, to make updating quantity cleaner
    // Cart contains all products as line items, which have all initial product attributes, and a quantity
    const initialCart = products.reduce((cart, product) => ({ ...cart, [product.id]: product }), {});

    this.setState({
      customer,
      products,
      cart: initialCart,
      rewardsAvailable: Math.floor(customer.rewardsAvailable),
      trainingMode: training,
      isLoading: false,
    });
  }

  applyRewardsCallback = (rewardsApplied, totalBalance) => {
    // Update rewards in parent state
    this.setState({ rewardsApplied, totalBalance });
  };

  updateQuantityCallback = (product, quantity, priceDifference) => {
    const newBalance = this.state.totalBalance + priceDifference;
    // Undoing Rewards
    /* IF: 
      1) Quantity is increasing
      2) No rewards have been applied, or
      3) The new balance is non-negative
      No special handling */
    // Add a new product to lineItems.
    if (quantity !== 0 && !this.state.lineItems.includes(product.id)) {
      this.setState((prevState) => ({
        lineItems: prevState.lineItems.concat(product.id),
      }));
    } else if (quantity === 0 && this.state.lineItems.includes(product.id)) {
      // Remove an item from lineItems.
      this.setState((prevState) => ({
        lineItems: prevState.lineItems.filter((id) => id !== product.id),
      }));
    }
    if (priceDifference >= 0 || this.state.rewardsApplied === 0 || newBalance >= 0) {
      this.setState((prevState) => ({
        cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
        totalBalance: prevState.totalBalance + priceDifference,
      }));
      // Special case: negative balance when rewards have been applied, but need to be restored
      // i.e rewardsValue * rewardsApplied > cartTotal after quantity drops
    } else if (newBalance < 0) {
      // MUST take absolute value first, otherwise will be incorrect
      const rewardsToUndo = Math.ceil(Math.abs(newBalance) / rewardDollarValue);
      // This keeps the "extra" reward UNAPPLIED by default. To swap it, take the remainder instead
      // updatedBalance: rewardDollarValue + (- remainder) = "unapplying" an extra reward
      this.setState((prevState) => ({
        cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
        totalBalance:
          // If the remainder is less than 0, updatedBalance = rewardDollarValue + (negative) remainder
          (prevState.totalBalance + priceDifference) % rewardDollarValue < 0
            ? rewardDollarValue + ((prevState.totalBalance + priceDifference) % rewardDollarValue)
            : (prevState.totalBalance + priceDifference) % rewardDollarValue,
        rewardsApplied: prevState.rewardsApplied - rewardsToUndo,
      }));
    }
  };

  // Handles submit when clerk selects "Complete Sale".
  completeSaleCallback = (transaction) => {
    this.displayConfirmation(transaction);
  };

  // Displays a confirmation alert to the clerk.
  displayConfirmation = async (transaction) => {
    // Should not be able to check out if there isn't anything in the transaction.
    if (this.state.rewardsApplied === 0) {
      const eligibleRewards = calculateEligibleRewards(
        this.state.rewardsAvailable,
        this.state.rewardsApplied,
        this.state.totalBalance
      );
      if (eligibleRewards && transaction.totalSale >= rewardDollarValue) {
        const continueWithoutRewards = await this.confirmNoRewards(eligibleRewards);
        if (!continueWithoutRewards) {
          Analytics.logEvent('GoBackApplyRewards', {
            name: 'Selected "Go back to apply rewards"',
            function: 'displayConfirmation',
            component: 'CheckoutScreen',
            eligible_rewards: eligibleRewards,
          });
          return;
        }
      }
    }
    Alert.alert('Confirm Sale', this.generateConfirmationMessage(transaction), [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'Confirm', onPress: () => this.confirmTransaction(transaction) },
    ]);
  };

  confirmNoRewards = async (eligibleRewards) => {
    const response = await AlertAsync(
      'Available rewards were not applied',
      'This customer could apply up to '.concat(eligibleRewards).concat(' rewards to this sale.'),
      [
        {
          text: 'Go back to apply rewards',
          style: 'cancel',
          onPress: () => false,
        },
        {
          text: 'Continue without rewards',
          onPress: () => true,
          style: 'default',
        },
      ]
    );
    return response;
  };

  generateConfirmationLine = (name, value) => {
    return `\n${name}: ${displayDollarValue(value)}`;
  };

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage = (transaction) => {
    let msg = Object.values(this.state.cart).reduce(
      (_msg, lineItem) =>
        lineItem.quantity > 0
          ? _msg.concat(`${lineItem.quantity} x ${lineItem.name} ${lineItem.detail || ''}\n`)
          : _msg,
      'Sale Items:\n\n'
    );
    msg = msg.concat(`\nRewards Redeemed: ${transaction.rewardsApplied}\n`);
    // Adding total price and total points earned to message.
    msg = msg.concat(this.generateConfirmationLine('Subtotal', transaction.subtotal));
    msg = msg.concat(this.generateConfirmationLine('Discount', transaction.discount));
    msg = msg.concat(this.generateConfirmationLine('Total Sale', transaction.totalSale));
    msg = msg.concat(`\nTotal Points Earned: ${transaction.pointsEarned}`);
    return msg;
  };

  // Adds the transaction to the user's account and updates their points.
  confirmTransaction = async (transaction) => {
    // Clerk Training: creates a local transaction object instead of creating transaction in Airtable
    if (JSON.parse(await AsyncStorage.getItem('trainingMode'))) {
      this.props.navigation.navigate('Confirmation', createFakeTransaction(transaction));
      return;
    }
    try {
      const transactionId = await addTransaction(this.state.customer, this.state.cart, transaction);
      await updateCustomerPoints(this.state.customer, transaction.pointsEarned, transaction.rewardsApplied);
      Analytics.logEvent('ConfirmTransaction', {
        name: 'Complete sale',
        function: 'confirmTransaction',
        component: 'CheckoutScreen',
        purpose: 'Transaction completed and confirmed.',
        transaction: transactionId,
      });
      Sentry.withScope((scope) => {
        scope.setExtra('transaction', transaction);
        scope.setExtra('transactionId', transactionId);
        Sentry.captureMessage('Transaction complete');
      });
      this.props.navigation.dispatch(StackActions.replace('Confirmation', { transactionId }));

      this.props.navigation.navigate('Confirmation', { transactionId });
    } catch (err) {
      // TODO better handling - should prompt the user to try again, or at least say something is wrong with the service
      // Technically the only thing that could happen is a network failure, but likely indicates a change in column schema etc
      Alert.alert(
        'Error creating transaction',
        'We were unable to create a transaction in Airtable. Please let an administrator know ASAP so they can fix this issue.',
        [{ text: 'OK' }]
      );
      logErrorToSentry({
        screen: 'CheckoutScreen',
        action: 'confirmTransaction',
        error: err,
      });
      console.log('Error creating transaction in Airtable', err);
    }
  };

  toggleShowCurrentSale = () => {
    this.setState((prevState) => ({ showCurrentSale: !prevState.showCurrentSale }));
  };

  // Returns index of the first product with a name starting with the given letter in products list.
  // If no product starting with that letter exists, find the next product.
  getIndexOfFirstProductAtLetter = (startLetter, endLetter) => {
    const prodList = this.state.products.filter(
      (product) =>
        product.name.charAt(0).toUpperCase() >= startLetter.toUpperCase() &&
        product.name.charAt(0) < endLetter.toUpperCase()
    );
    // There are no products in the letter range.
    if (prodList.length === 0) {
      // TODO: Shouldn't error out. Maybe have a nonfunctional button?
      console.log('No products in range', startLetter, 'to', endLetter);
      return null;
    }
    return this.state.products.indexOf(prodList[0]);
  };

  // Takes in strings tab label (i.e. "A-K") and starting letter (i.e. "A") and returns a
  // tab for the bottom alphabetical scroll bar.
  alphabeticalScrollTab = (startLetter, endLetter) => {
    const productContainerWidth = (Dimensions.get('screen').width * 4) / 6;

    const numItemsPerRow = Math.round(productContainerWidth / productCardPxWidth);

    return (
      <TabContainer
        onPress={() =>
          this.productScrollView.scrollTo({
            y:
              Math.floor(this.getIndexOfFirstProductAtLetter(startLetter, endLetter) / numItemsPerRow) *
              productCardPxHeight,
          })
        }>
        <Title>{startLetter.toUpperCase().concat(' - ').concat(endLetter.toUpperCase())}</Title>
      </TabContainer>
    );
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }

    const { cart, lineItems, customer, totalBalance, trainingMode } = this.state;

    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {(!isTablet && this.state.showCurrentSale) || (
          <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 2 }}>
            <ColumnContainer style={{ width: '100%' }}>
              <TopBar trainingColor={trainingMode}>
                <BackButton
                  navigation={this.props.navigation}
                  style={{ marginLeft: 24 }}
                  confirm={lineItems.length > 0}
                />
                <Title>
                  {'Customer: '
                    .concat(customer.name)
                    .concat(trainingMode ? '   |   Training Mode (sales will not be saved)' : '')}
                </Title>

                <ButtonContainer style={{ marginRight: 24 }} onPress={() => this.toggleShowCurrentSale()}>
                  <BadgeIcon badgeContent={this.state.lineItems.length.toString()} icon="shopping-basket" />
                </ButtonContainer>
              </TopBar>
              {this.state.showCurrentSale || (
                <FilledButtonContainer
                  height="50px"
                  style={{ paddingTop: 3, margin: 8 }}
                  color={lineItems.length === 0 ? Colors.lightestGreen : Colors.primaryGreen}
                  onPress={() => this.toggleShowCurrentSale()}>
                  <ButtonLabel>Apply Rewards & Checkout</ButtonLabel>
                </FilledButtonContainer>
              )}
            </ColumnContainer>
            <View style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
              {/* Display products */}
              <View style={{ display: 'flex', flex: 5, flexDirection: 'column' }}>
                <ProductsContainer
                  ref={(scrollView) => {
                    this.productScrollView = scrollView;
                  }}>
                  {Object.entries(cart).map(([id, product]) => (
                    <QuantityModal
                      key={id}
                      product={product}
                      isLineItem={false}
                      callback={this.updateQuantityCallback}
                    />
                  ))}
                </ProductsContainer>
                <BottomBar style={{ display: 'flex', flexDirection: 'row' }}>
                  {this.alphabeticalScrollTab('A', 'K')}
                  {this.alphabeticalScrollTab('L', 'S')}
                  {this.alphabeticalScrollTab('T', 'Z')}
                </BottomBar>
              </View>
            </View>
          </View>
        )}
        {this.state.showCurrentSale && (
          <CurrentSale
            lineItems={lineItems}
            cart={cart}
            totalBalance={totalBalance}
            rewardsAvailable={this.state.rewardsAvailable}
            rewardsApplied={this.state.rewardsApplied}
            customer={customer}
            applyRewardsCallback={this.applyRewardsCallback}
            completeSaleCallback={this.completeSaleCallback}
            updateQuantityCallback={this.updateQuantityCallback}
            toggleShowCallback={this.toggleShowCurrentSale}
          />
        )}
      </View>
    );
  }
}

CheckoutScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};
