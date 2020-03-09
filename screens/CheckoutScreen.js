import PropTypes from 'prop-types';
import React from 'react';
import { Alert, AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ProductCartCard from '../components/ProductCartCard';
import ProductDisplayCard from '../components/ProductDisplayCard';
import { getCustomersById } from '../lib/airtable/request';
import { addTransaction, loadProductsData, updateCustomerPoints } from '../lib/checkoutUtils';
import { FlatListContainer } from '../styled/checkout';
import { TextHeader } from '../styled/shared';
import RewardModal from './checkout/RewardModal';

export default class CheckoutScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      currentPoints: 0,
      products: [],
      cart: [],
      totalPrice: 0,
      totalPoints: 0,
      rewardsApplied: 0,
      rewardsAvailable: 0,
      isLoading: true
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem('customerId');
    const customer = await getCustomersById(customerId);
    const productsData = await loadProductsData();

    this.setState({
      customer,
      currentPoints: customer.points,
      rewardsAvailable: customer.rewardsAvailable,
      products: productsData,
      isLoading: false
    });
  }

  applyRewardsCallback = (rewardsApplied, totalPrice) => {
    console.log(rewardsApplied, totalPrice);
    // Update rewards in parent state
    this.setState({ rewardsApplied });
  };

  // Sets total points earned from transaction in state.
  setTotalPoints = () => {
    let points = 0;
    for (let i = 0; i < this.state.cart.length; i += 1) {
      const cartItem = this.state.cart[i];
      points += cartItem.points * cartItem.cartCount;
    }
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

  // Adds one item of product type to cart.
  addToCart = item => {
    item.cartCount += 1;
    const currentCart = this.state.cart;
    let { totalPrice } = this.state;
    totalPrice += item.customerCost;
    const currentItem = currentCart.filter(product => product.id === item.id);
    if (currentItem.length === 0) {
      currentCart.push(item);
    }
    this.setState({
      cart: currentCart,
      totalPrice
    });
  };

  // Subtracts one item of product type from cart.
  removeFromCart = item => {
    item.cartCount -= 1;
    let currentCart = this.state.cart;
    currentCart = currentCart.filter(cartItem => cartItem.cartCount > 0);
    let { totalPrice } = this.state;
    totalPrice -= item.customerCost;
    this.setState({
      cart: currentCart,
      totalPrice
    });
  };

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage = totalPoints => {
    let msg = 'Transaction Items:\n\n';
    for (let i = 0; i < this.state.cart.length; i += 1) {
      // Adding all quantities of items in cart to message.
      const cartItem = this.state.cart[i];
      msg = msg.concat(`${cartItem.cartCount} x ${cartItem.name}\n`);
    }
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

    const { cart, customer, products, totalPrice } = this.state;

    return (
      // Temp fix for the horizontal orientation not showing Checkout Button
      <ScrollView>
        <TextHeader style={{ padding: '5%' }}> {'Customer: '.concat(customer.name)} </TextHeader>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {/* Display products */}
          <View>
            <FlatListContainer
              keyExtractor={product => product.id}
              numColumns={5}
              data={products}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => this.addToCart(item)}>
                  <ProductDisplayCard product={item} />
                </TouchableOpacity>
              )}
            />
          </View>
          {/* Right column */}
          <View>
            <TextHeader>Cart</TextHeader>
            {/* Cart container */}
            <View style={{ height: '40%', paddingBottom: '5%' }}>
              <ScrollView>
                {cart.map(product => (
                  <TouchableOpacity key={product.id} onPress={() => this.removeFromCart(product)}>
                    <ProductCartCard product={product} />
                  </TouchableOpacity>
                ))}
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
          </View>
        </View>
      </ScrollView>
    );
  }
}

CheckoutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
