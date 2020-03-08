import React from 'react';
import {
  Alert,
  AsyncStorage,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ProductCartCard from '../components/ProductCartCard';
import ProductDisplayCard from '../components/ProductDisplayCard';
import {
  addTransaction,
  categories,
  getUser,
  loadProductsData,
  updateCustomerPoints
} from '../lib/checkoutUtils';
import { FlatListContainer } from '../styled/checkout.js';
import { ScrollCategory, TextHeader } from '../styled/shared';

// TODO figure out how to break these state-modifying functions into helper files?
// TODO note edge cases that fail with current workflow

// TODO research styling for tablets to be both horizontal and vertical friendly
export default class CheckoutScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      fullProducts: [],
      products: [],
      filter: null,
      cart: [],
      isLoading: true,
      totalPrice: 0,
      totalPoints: 0,
      rewardsApplied: 0,
      rewardsAvailable: 0
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem('customerId');
    const customer = await getUser(customerId);
    const productsData = await loadProductsData();

    this.setState({
      customer: customer,
      rewardsAvailable: Math.floor(customer.rewardsAvailable),
      fullProducts: productsData,
      products: productsData,
      isLoading: false
    });
  }

  // Adds one item of product type to cart.
  addToCart(item) {
    item.cartCount++;
    var currentCart = this.state.cart;
    var currentItem = currentCart.filter(product => product.id == item.id);
    var totalPrice = this.state.totalPrice;
    totalPrice = totalPrice + item.customerCost;
    if (currentItem.length == 0) {
      currentCart.push(item);
    }
    this.setState({
      cart: currentCart,
      totalPrice: totalPrice
    });
  }

  // Subtracts one item of product type from cart.
  removeFromCart(item) {
    item.cartCount--;
    var currentCart = this.state.cart;
    currentCart = currentCart.filter(item => item.cartCount > 0);
    var totalPrice = this.state.totalPrice;
    totalPrice = totalPrice - item.customerCost;
    this.setState({
      cart: currentCart,
      totalPrice: totalPrice
    });
  }

  handleCategoryPress = filter => {
    const toSet =
      filter == 'All'
        ? this.state.fullProducts
        : this.state.fullProducts.filter(product =>
            product.category.includes(filter)
          );
    this.setState({ products: toSet });
  };

  // TODO why is this async
  // Sets total points earned from transaction in state.
  async setTotalPoints() {
    var points = 0;
    return new Promise((resolve, reject) => {
      for (var i = 0; i < this.state.cart.length; i++) {
        const cartItem = this.state.cart[i];
        points = points + cartItem['points'] * cartItem['cartCount'];
      }
      points = points - this.state.rewardsApplied * 500;
      if (points < 0) {
        reject(points);
      }
      resolve(points);
      this.setState({ totalPoints: points });
    }).catch(err => {
      console.error('Error setting total points', err);
    });
  }

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage(totalPoints) {
    var msg = 'Transaction Items:\n\n';
    for (var i = 0; i < this.state.cart.length; i++) {
      // Adding all quantities of items in cart to message.
      const cartItem = this.state.cart[i];
      msg = msg.concat(`${cartItem['cartCount']} x ${cartItem['name']}\n`);
    }
    // Adding total price and total points earned to message. Must be called after setTotalPoints()
    // in handleSubmit() for updated amount.
    msg = msg.concat(`\nTotal Price: $${this.state.totalPrice.toFixed(2)}\n`);
    msg = msg.concat(`Total Points Earned: ${totalPoints}`);
    return msg;
  }

  // Adds the transaction to the user's account and updates their points.
  async confirmTransaction() {
    try {
      await addTransaction(
        this.state.customer,
        this.state.cart,
        this.state.totalPoints,
        this.state.rewardsApplied
      );
      await updateCustomerPoints(
        this.state.customer,
        this.state.totalPoints,
        this.state.rewardsApplied,
        this.props.navigation
      );
    } catch (err) {
      console.log(err);
    }
  }

  // Displays a confirmation alert to the clerk.
  displayConfirmation(totalPoints) {
    // Should not be able to check out if there isn't anything in the transaction.
    if (totalPoints == 0) {
      Alert.alert(
        'Empty Transaction',
        'This transaction is empty. Please add items to the cart.',
        [
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    Alert.alert(
      'Confirm Transaction',
      this.generateConfirmationMessage(totalPoints),
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Canceled'),
          style: 'cancel'
        },
        { text: 'Confirm', onPress: () => this.confirmTransaction() }
      ]
    );
  }

  // Handles submit when clerk selects "CHECKOUT".
  async handleSubmit() {
    await this.setTotalPoints().then(totalPoints =>
      this.displayConfirmation(totalPoints)
    );
  }

  applyReward() {
    if (this.state.totalPrice < 5) {
      return;
    }
    const newRewardsApplied = this.state.rewardsApplied + 1;
    const newRewardsAvail = this.state.rewardsAvailable - 1;
    const newCustomer = this.state.customer;
    const newPrice = this.state.totalPrice - 5;
    this.setState({
      rewardsApplied: newRewardsApplied,
      rewardsAvailable: newRewardsAvail,
      customer: newCustomer,
      totalPrice: newPrice
    });
  }

  removeReward() {
    const newRewardsApplied = this.state.rewardsApplied - 1;
    const newRewardsAvail = this.state.rewardsAvailable + 1;
    const newCustomer = this.state.customer;
    const newPrice = this.state.totalPrice + 5;
    this.setState({
      rewardsApplied: newRewardsApplied,
      rewardsAvailable: newRewardsAvail,
      customer: newCustomer,
      totalPrice: newPrice
    });
  }

  // Generates rewards available as a list of TouchableOpacitys to display on checkout screen.
  generateRewardsAvailable() {
    // TODO make this a .map call
    var rewards = [];
    for (var i = 0; i < this.state.rewardsAvailable; i++) {
      rewards.push(
        <TouchableOpacity key={i} onPress={() => this.applyReward()}>
          <Text>APPLY $5 REWARD</Text>
        </TouchableOpacity>
      );
    }
    return rewards;
  }

  // Generates rewards applied as a list of TouchableOpacitys to display on checkout screen.
  generateRewardsApplied() {
    // TODO make this a .map call
    var rewards = [];
    for (var i = 0; i < this.state.rewardsApplied; i++) {
      rewards.push(
        <TouchableOpacity key={i} onPress={() => this.removeReward()}>
          <Text>REMOVE $5 REWARD</Text>
        </TouchableOpacity>
      );
    }
    return rewards;
  }

  render() {
    const products = this.state.products;
    const cart = this.state.cart;
    if (this.state.isLoading) {
      return null; // TODO @tommypoa waiting (flavicon?)
    }
    return (
      // Temp fix for the horizontal orientation not showing Checkout Button
      <ScrollView>
        <View style={{ flex: 1 }}>
          <TextHeader style={{ padding: '5%' }}>
            Customer: {this.state.customer.name}
          </TextHeader>
          <View style={{ flexDirection: 'row' }}>
            {/* <ScrollView
              style={{ flex: 1 }}
              showsHorizontalScrollIndicator={false}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => this.handleCategoryPress(category)}>
                  <ScrollCategory> {category} </ScrollCategory>
                </TouchableOpacity>
              ))}
            </ScrollView> */}
            <View style={{ flex: 2 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <FlatListContainer
                  keyExtractor={(item, _) => item.id}
                  numColumns={3}
                  data={products}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => this.addToCart(item)}>
                      <ProductDisplayCard product={item} />
                    </TouchableOpacity>
                  )}></FlatListContainer>
              </ScrollView>
            </View>
            <View style={{ flex: 2 }}>
              <View style={{ height: '40%', paddingBottom: '5%' }}>
                <TextHeader>Cart</TextHeader>
                <ScrollView style={{ alignSelf: 'flex-start' }}>
                  {cart.map(product => (
                    <TouchableOpacity
                      key={product.id}
                      onPress={() => this.removeFromCart(product)}>
                      <ProductCartCard product={product} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ height: '20%', paddingBottom: '5%' }}>
                <TextHeader>Rewards Applied</TextHeader>
                <ScrollView style={{ alignSelf: 'flex-end' }}>
                  {this.generateRewardsApplied()}
                </ScrollView>
              </View>
              <View style={{ height: '20%', paddingBottom: '5%' }}>
                <TextHeader>Rewards Available</TextHeader>
                <ScrollView style={{ alignSelf: 'flex-end' }}>
                  {this.generateRewardsAvailable()}
                </ScrollView>
              </View>
              <Text
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                Order Total ${this.state.totalPrice.toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => this.handleSubmit()}>
                <TextHeader style={{ color: '#008550' }}>Checkout</TextHeader>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}
