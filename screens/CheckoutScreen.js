import PropTypes from 'prop-types';
import React from 'react';
import update from 'react-addons-update';
import { Alert, AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BackButton from '../components/BackButton';
import { Subhead, Title } from '../components/BaseComponents';
import { getCustomersById } from '../lib/airtable/request';
import { addTransaction, loadProductsData, updateCustomerPoints } from '../lib/checkoutUtils';
import { rewardDollarValue } from '../lib/constants';
import { ProductsContainer, SaleContainer, TopBar } from '../styled/checkout';
import { TextHeader } from '../styled/shared';
import QuantityModal from './modals/QuantityModal';
import RewardModal from './modals/RewardModal';

export default class CheckoutScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Populated in componentDidMount
      customer: null,
      cart: {},
      rewardsAvailable: 0,
      // Other state
      totalBalance: 0,
      rewardsApplied: 0,
      isLoading: true
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem('customerId');
    const customer = await getCustomersById(customerId);
    const products = await loadProductsData();
    const initialCart = {};

    // Initialize cart a'la Python dictionary, to make updating quantity cleaner
    // Cart contains line items, which have all initial product attributes, and a quantity
    products.forEach(product => {
      initialCart[product.id] = product;
    });

    this.setState({
      customer,
      cart: initialCart,
      rewardsAvailable: Math.floor(customer.rewardsAvailable),
      isLoading: false
    });
  }

  applyRewardsCallback = (rewardsApplied, totalBalance) => {
    console.log('\nrewards callback');
    console.log('rewards applied', rewardsApplied, 'total balance', totalBalance);
    // Update rewards in parent state
    this.setState({ rewardsApplied, totalBalance });
  };

  updateQuantityCallback = (product, quantity, priceDifference) => {
    const newBalance = this.state.totalBalance + priceDifference;
    console.log('\nquantity callback');
    console.log(quantity, priceDifference);
    // Undoing Rewards
    /* IF: 
      1) Quantity is increasing
      2) No rewards have been applied, or
      3) The new balance is non-negative
      No special handling */
    if (priceDifference >= 0 || this.state.rewardsApplied === 0 || newBalance >= 0) {
      console.log('newBalance', newBalance);
      this.setState(prevState => ({
        cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
        totalBalance: prevState.totalBalance + priceDifference
      }));
      // Special case: negative balance when rewards have been applied, but need to be restored
      // i.e rewardsValue * rewardsApplied > cartTotal after quantity drops
    } else if (newBalance < 0) {
      // MUST take absolute value first, otherwise will be incorrect
      const rewardsToUndo = Math.ceil(Math.abs(newBalance) / rewardDollarValue);
      console.assert(this.state.rewardsApplied > rewardsToUndo);
      // This keeps the "extra" reward unapplied by default. To swap it, take the remainder instead
      const updatedBalance = rewardDollarValue + (newBalance % rewardDollarValue); // rewardDollarValue + (- remainder) = "unapplying" an extra reward
      // Note: updatedBalance = newBalance % rewardDollarValue = prevState.totalBalance + (updatedRewardsApplied * rewardDollarValue) + priceDifference
      console.log(
        'priceDifference',
        priceDifference,
        'newbalance',
        newBalance,
        'totalbalance',
        this.state.totalBalance,
        'updatedBalance',
        updatedBalance,
        'rewardsApplied',
        this.state.rewardsApplied,
        'rewardsToUndo',
        rewardsToUndo
      );

      this.setState(prevState => ({
        cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
        totalBalance: rewardDollarValue + ((prevState.totalBalance + priceDifference) % rewardDollarValue),
        rewardsApplied: prevState.rewardsApplied - rewardsToUndo
      }));
    }
  };

  // Calculates total points earned from transaction
  // Accounts for lineItem individual point values and not allowing points to be earned with rewards daollrs
  getPointsEarned = () => {
    let pointsEarned = 0;
    // Iterate over lineItems in cart
    Object.values(this.state.cart).forEach(lineItem => {
      pointsEarned += lineItem.points * lineItem.quantity;
    });
    // Customer cannot earn points with rewards dollars; assumes a reward's point multiplier per dollar is 100 pts
    pointsEarned -= this.state.rewardsApplied * rewardDollarValue * 100;

    // TODO this might be a design edge case now that rewards applied can bring the technical balance to a negative
    if (pointsEarned < 0) {
      if (this.state.totalBalance > 0) {
        console.log(
          'Total points less than 0! This is likely a bug, unless the value of various items is < 100 pts per item, since the real balance is positive. '
        );
      }
      // Otherwise, expected - value of rewards applied > value of items in cart
      pointsEarned = 0;
    }
    return pointsEarned;
  };

  // Handles submit when clerk selects "CHECKOUT".
  handleSubmit = () => {
    const pointsEarned = this.getPointsEarned();
    this.displayConfirmation(pointsEarned);
  };

  // Displays a confirmation alert to the clerk.
  displayConfirmation = pointsEarned => {
    // Should not be able to check out if there isn't anything in the transaction.
    if (this.state.cart.length === 0) {
      Alert.alert('Empty Transaction', 'This transaction is empty. Please add items to the cart.', [
        {
          text: 'OK',
          style: 'cancel'
        }
      ]);
      return;
    }
    Alert.alert('Confirm Transaction', this.generateConfirmationMessage(pointsEarned), [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      // TODO should this be an await?
      { text: 'Confirm', onPress: () => this.confirmTransaction(pointsEarned) }
    ]);
  };

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage = pointsEarned => {
    const totalSale = this.state.totalBalance > 0 ? this.state.totalBalance : 0;
    let msg = 'Transaction Items:\n\n';
    // Iterate over lineItems in cart
    Object.values(this.state.cart).forEach(lineItem => {
      if (lineItem.quantity > 0) {
        msg = msg.concat(`${lineItem.quantity} x ${lineItem.name}\n`);
      }
    });
    msg = msg.concat(`\nRewards Redeemed: ${this.state.rewardsApplied}\n`);
    // Adding total price and total points earned to message. Must be called after getPointsEarned()
    // in handleSubmit() for updated amount.
    msg = msg.concat(`\nTotal Sale: $${totalSale.toFixed(2)}\n`);
    msg = msg.concat(`Total Points Earned: ${pointsEarned}`);
    return msg;
  };

  // Adds the transaction to the user's account and updates their points.
  confirmTransaction = async pointsEarned => {
    try {
      const transactionId = await addTransaction(
        this.state.customer,
        this.state.cart,
        pointsEarned,
        this.state.totalBalance,
        this.state.rewardsApplied
      );
      await updateCustomerPoints(this.state.customer, pointsEarned, this.state.rewardsApplied);
      this.props.navigation.navigate('Confirmation', { transactionId });
    } catch (err) {
      // TODO better handling - should prompt the user to try again, or at least say something is wrong with the service
      // Technically the only thing that could happen is a network failure, but likely indicates a change in column schema etc
      console.log('Error creating transaction in Airtable', err);
    }
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }

    const { cart, customer, totalBalance } = this.state;
    const totalSale = totalBalance > 0 ? totalBalance : 0;

    return (
      <View>
        <TopBar>
          <BackButton navigation={this.props.navigation} light={false} style={{ marginTop: 3, marginLeft: 24 }} />
          <Title> {'Customer: '.concat(customer.name)} </Title>
          {/* Duplicate, invisible element to have left-aligned BackButton */}
          <BackButton navigation={this.props.navigation} light={false} style={{ opacity: 0.0, disabled: true }} />
        </TopBar>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
          {/* Display products */}
          <ProductsContainer>
            {Object.entries(cart).map(([id, product]) => (
              <QuantityModal key={id} product={product} isLineItem={false} callback={this.updateQuantityCallback} />
            ))}
          </ProductsContainer>
          {/* Right column */}
          <SaleContainer>
            <Subhead>Current Sale</Subhead>
            {/* Cart container */}
            <View style={{ height: '40%', paddingBottom: '5%' }}>
              <ScrollView>
                {Object.entries(cart).map(([id, product]) => {
                  return (
                    product.quantity > 0 && (
                      <QuantityModal key={id} product={product} isLineItem callback={this.updateQuantityCallback} />
                    )
                  );
                })}
              </ScrollView>
            </View>
            <RewardModal
              totalBalance={totalBalance}
              customer={customer}
              rewardsAvailable={this.state.rewardsAvailable}
              rewardsApplied={this.state.rewardsApplied}
              callback={this.applyRewardsCallback}
            />
            <Text
              style={{
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
              Order Total ${totalSale.toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => this.handleSubmit()}>
              <TextHeader style={{ color: '#008550' }}>Checkout</TextHeader>
            </TouchableOpacity>
          </SaleContainer>
        </View>
      </View>
    );
  }
}

CheckoutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
