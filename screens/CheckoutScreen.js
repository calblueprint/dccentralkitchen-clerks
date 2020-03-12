import PropTypes from 'prop-types';
import React from 'react';
import update from 'react-addons-update';
import { Alert, AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Subhead, Title } from '../components/BaseComponents';
import { getCustomersById } from '../lib/airtable/request';
import { addTransaction, loadProductsData, updateCustomerPoints } from '../lib/checkoutUtils';
import { ProductsContainer, SaleContainer, TopBar } from '../styled/checkout';
import { TextHeader } from '../styled/shared';
import CartQuantityModal from './modals/CartQuantityModal';
import DisplayQuantityModal from './modals/DisplayQuantityModal';
import RewardModal from './modals/RewardModal';

export default class CheckoutScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Populated in componentDidMount
      customer: null,
      cart: {},
      currentPoints: 0,
      rewardsAvailable: 0,
      // Other state
      totalPoints: 0,
      totalPrice: 0,
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
      currentPoints: customer.points,
      rewardsAvailable: Math.floor(customer.rewardsAvailable),
      isLoading: false
    });
  }

  applyRewardsCallback = (rewardsApplied, totalPrice) => {
    // Update rewards in parent state
    this.setState({ rewardsApplied, totalPrice });
  };

  updateQuantityCallback = (product, quantity, priceDifference) => {
    console.log(priceDifference);
    this.setState(prevState => ({
      cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
      totalPrice: prevState.totalPrice + priceDifference
    }));
    console.log('Callback running');
    console.log(this.state.cart[product.id].quantity);
  };

  // Sets total points earned from transaction in state.
  setTotalPoints = () => {
    let points = 0;
    // Iterate over lineItems in cart
    Object.values(this.state.cart).forEach(lineItem => {
      points += lineItem.points * lineItem.quantity;
    });
    points -= this.state.rewardsApplied * 500;
    if (points < 0) {
      console.error('Total points less than 0!');
    }
    this.setState({ totalPoints: points });
    return points;
  };

  // Handles submit when clerk selects "CHECKOUT".
  handleSubmit = () => {
    const totalPoints = this.setTotalPoints();
    this.displayConfirmation(totalPoints);
  };

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage = totalPoints => {
    let msg = 'Transaction Items:\n\n';
    // Iterate over lineItems in cart
    Object.values(this.state.cart).forEach(lineItem => {
      msg = msg.concat(`${lineItem.quantity} x ${lineItem.name}\n`);
    });
    msg = msg.concat(`\nRewards Redeemed: ${this.state.rewardsApplied}\n`);
    // Adding total price and total points earned to message. Must be called after setTotalPoints()
    // in handleSubmit() for updated amount.
    msg = msg.concat(`\nTotal Price: $${this.state.totalPrice.toFixed(2)}\n`);
    msg = msg.concat(`Total Points Earned: ${totalPoints}`);
    return msg;
  };

  // Adds the transaction to the user's account and updates their points.
  confirmTransaction = async () => {
    try {
      await addTransaction(
        this.state.customer,
        this.state.cart,
        this.state.currentPoints,
        this.state.totalPoints,
        this.state.rewardsApplied
      );
      await updateCustomerPoints(this.state.customer, this.state.totalPoints, this.state.rewardsApplied);
      this.props.navigation.goBack();
    } catch (err) {
      // TODO better handling - should prompt the user to try again, or at least say something is wrong with the service
      // Technically the only thing that could happen is a network failure, but likely indicates a change in column schema etc
      console.log(err);
    }
  };

  // Displays a confirmation alert to the clerk.
  displayConfirmation = totalPoints => {
    // Should not be able to check out if there isn't anything in the transaction.
    if (totalPoints === 0 && this.state.cart.length === 0) {
      Alert.alert('Empty Transaction', 'This transaction is empty. Please add items to the cart.', [
        {
          text: 'OK',
          style: 'cancel'
        }
      ]);
      return;
    }
    Alert.alert('Confirm Transaction', this.generateConfirmationMessage(totalPoints), [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      // TODO should this be an await?
      { text: 'Confirm', onPress: () => this.confirmTransaction() }
    ]);
  };

  render() {
    if (this.state.isLoading) {
      return null; // TODO @tommypoa waiting (flavicon?)
    }

    const { cart, customer, totalPrice } = this.state;

    return (
      // Temp fix for the horizontal orientation not showing Checkout Button
      <ScrollView>
        <TopBar>
          <Title> {'Customer: '.concat(customer.name)} </Title>
        </TopBar>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          {/* Display products */}
          <ProductsContainer>
            {Object.entries(cart).map(([id, product]) => (
              <DisplayQuantityModal key={id} product={product} callback={this.updateQuantityCallback} />
            ))}
          </ProductsContainer>
          {/* Right column */}
          <SaleContainer>
            <Subhead>Current Sale</Subhead>
            {/* Cart container */}
            <View style={{ height: '40%', paddingBottom: '5%' }}>
              <ScrollView>
                {Object.entries(cart).map(([id, product]) => {
                  return product.quantity > 0 ? (
                    <CartQuantityModal key={id} lineItem={product} callback={this.updateQuantityCallback} />
                  ) : null;
                })}
              </ScrollView>
            </View>
            {/* Should be greyed out if totalPrice < 5 */}
            <RewardModal
              totalPrice={totalPrice}
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
              Order Total ${totalPrice.toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => this.handleSubmit()}>
              <TextHeader style={{ color: '#008550' }}>Checkout</TextHeader>
            </TouchableOpacity>
          </SaleContainer>
        </View>
      </ScrollView>
    );
  }
}

CheckoutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
