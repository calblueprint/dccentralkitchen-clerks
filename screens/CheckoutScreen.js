import PropTypes from 'prop-types';
import React from 'react';
import { Alert, AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ButtonLabel, FilledButtonContainer, Subhead, Title } from '../components/BaseComponents';
import BackButton from '../components/BackButton';
import ProductCartCard from '../components/ProductCartCard';
import ProductDisplayCard from '../components/ProductDisplayCard';
import SubtotalCard from '../components/SubtotalCard';
import TotalCard from '../components/TotalCard';
import { getCustomersById } from '../lib/airtable/request';
import { addTransaction, loadProductsData, updateCustomerPoints } from '../lib/checkoutUtils';
import {
  BottomBar,
  FlatListContainer,
  ProductsContainer,
  SaleContainer,
  TabContainer,
  TopBar
} from '../styled/checkout';
import { TextHeader } from '../styled/shared';

export default class CheckoutScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      currentPoints: 0,
      products: [],
      cart: [],
      isLoading: true,
      subtotalPrice: 0,
      totalPrice: 0,
      totalPoints: 0,
      rewardsApplied: 0,
      rewardsAvailable: 0
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem('customerId');
    const customer = await getCustomersById(customerId);
    const productsData = await loadProductsData();

    this.setState({
      customer: customer,
      rewardsAvailable: Math.floor(customer.rewardsAvailable),
      products: productsData,
      isLoading: false
    });
  }

  // Handles submit when clerk selects "CHECKOUT".
  handleSubmit = () => {
    this.displayConfirmation(this.state.totalPoints);
  };

  // Adds one item of product type to cart.
  addToCart(item) {
    item.cartCount += 1;
    const currentCart = this.state.cart;
    const currentItem = currentCart.filter(product => product.id === item.id);
    let { totalPrice, subtotalPrice, totalPoints } = this.state;
    subtotalPrice += item.customerCost;
    totalPrice += item.customerCost;
    totalPoints += item.points;
    if (currentItem.length === 0) {
      currentCart.push(item);
    }
    this.setState({
      cart: currentCart,
      totalPrice,
      subtotalPrice,
      totalPoints
    });
  }

  // Subtracts one item of product type from cart.
  removeFromCart(item) {
    item.cartCount -= 1;
    let currentCart = this.state.cart;
    currentCart = currentCart.filter(cartItem => cartItem.cartCount > 0);
    let { totalPrice, subtotalPrice, totalPoints } = this.state;
    totalPrice -= item.customerCost;
    subtotalPrice -= item.customerCost;
    totalPoints -= item.points;
    this.setState({
      cart: currentCart,
      totalPrice,
      subtotalPrice,
      totalPoints
    });
  }

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage(totalPoints) {
    let msg = 'Transaction Items:\n\n';
    for (let i = 0; i < this.state.cart.length; i += 1) {
      // Adding all quantities of items in cart to message.
      const cartItem = this.state.cart[i];
      msg = msg.concat(`${cartItem.cartCount} x ${cartItem.name}\n`);
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
      const transactionId = await addTransaction(
        this.state.customer,
        this.state.cart,
        this.state.currentPoints,
        this.state.totalPoints,
        this.state.totalPrice,
        this.state.rewardsApplied
      );
      await updateCustomerPoints(this.state.customer, this.state.totalPoints, this.state.rewardsApplied);
      this.props.navigation.navigate('Confirmation', { transactionId });
    } catch (err) {
      // TODO better handling - should prompt the user to try again, or at least say something is wrong with the service
      // Technically the only thing that could happen is a network failure, but likely indicates a change in column schema etc
      console.log(err);
    }
  }

  // Displays a confirmation alert to the clerk.
  displayConfirmation(totalPoints) {
    // Should not be able to check out if there isn't anything in the transaction.
    if (totalPoints === 0) {
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
        onPress: () => console.log('Canceled'),
        style: 'cancel'
      },
      // TODO should this be an await?
      { text: 'Confirm', onPress: () => this.confirmTransaction() }
    ]);
  }

  applyReward() {
    // Cannot apply reward if total price is less than 5
    if (this.state.totalPrice < 5) {
      return;
    }
    this.setState(prevState => ({
      rewardsApplied: prevState.rewardsApplied + 1,
      rewardsAvailable: prevState.rewardsAvailable - 1,
      totalPrice: prevState.totalPrice - 5,
      totalPoints: prevState.totalPoints - 500
    }));
  }

  removeReward() {
    this.setState(prevState => ({
      rewardsApplied: prevState.rewardsApplied - 1,
      rewardsAvailable: prevState.rewardsAvailable + 1,
      totalPrice: prevState.totalPrice + 5,
      totalPoints: prevState.totalPoints + 500
    }));
  }

  // Generates rewards available as a list of TouchableOpacitys to display on checkout screen.
  generateRewardsAvailable() {
    const rewardsAvailable = [];
    for (let i = 0; i < this.state.rewardsAvailable; i += 1) {
      rewardsAvailable.push(
        <TouchableOpacity key={i} onPress={() => this.applyReward()}>
          <Text>APPLY $5 REWARD</Text>
        </TouchableOpacity>
      );
    }
    return rewardsAvailable;
  }

  // Generates rewards applied as a list of TouchableOpacitys to display on checkout screen.
  generateRewardsApplied() {
    const rewardsApplied = [];
    for (let i = 0; i < this.state.rewardsApplied; i += 1) {
      rewardsApplied.push(
        <TouchableOpacity key={i} onPress={() => this.removeReward()}>
          <Text>$5 REWARD APPLIED</Text>
        </TouchableOpacity>
      );
    }
    return rewardsApplied;
  }

  // Returns index of the first product with a name starting with the given letter in products list.
  // If no product starting with that letter exists, find the next product.
  getIndexOfFirstProductAtLetter(letter) {
    let prodList = this.state.products.filter(product => product.name.charAt(0) === letter);
    let nextLetter = letter;
    while (prodList.length === 0) {
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
      prodList = this.state.products.filter(product => product.name.charAt(0) === nextLetter);
    }
    return this.state.products.indexOf(prodList[0]);
  }

  render() {
    if (this.state.isLoading) {
      return null; // TODO @tommypoa waiting (flavicon?)
    }

    const { cart, customer, products, totalPoints, totalPrice, subtotalPrice, rewardsApplied } = this.state;

    return (
      // Temp fix for the horizontal orientation not showing Checkout Button
      <ScrollView ref={view => (this._scrollView = view)}>
        <TopBar>
          <BackButton navigation={this.props.navigation} light={false} style={{ marginTop: 3, marginLeft: 24 }} />
          <Title> {'Customer: '.concat(customer.name)} </Title>
          {/* Duplicate, invisible element to have left-aligned BackButton */}
          <BackButton navigation={this.props.navigation} light={false} style={{ opacity: 0.0, disabled: true }} />
        </TopBar>
        <View style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
          {/* Display products */}
          <ProductsContainer>
            <FlatListContainer
              keyExtractor={product => product.id}
              numColumns={5}
              data={products}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => this.addToCart(item)}>
                  <ProductDisplayCard product={item} />
                </TouchableOpacity>
              )}
              style={{ padding: 4 }}
            />
            <BottomBar style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
              {/* TODO: Replace 3 with 5 */}
              <TabContainer
                onPress={() =>
                  this._scrollView.scrollTo({
                    y: Math.floor(this.getIndexOfFirstProductAtLetter('A') / 5) * 160 + 55
                  })
                }>
                <Title>A-K</Title>
              </TabContainer>
              <TabContainer
                onPress={() =>
                  this._scrollView.scrollTo({
                    y: Math.floor(this.getIndexOfFirstProductAtLetter('E') / 5) * 160 + 55
                  })
                }>
                <Title>L-S</Title>
              </TabContainer>
              <TabContainer
                onPress={() =>
                  this._scrollView.scrollTo({
                    y: Math.floor(this.getIndexOfFirstProductAtLetter('T') / 5) * 160 + 55
                  })
                }>
                <Title>T-Z</Title>
              </TabContainer>
            </BottomBar>
          </ProductsContainer>
          {/* Right column */}
          <SaleContainer>
            <View style={{ paddingTop: 13, paddingLeft: 14, paddingBottom: 7 }}>
              <Subhead>Current Sale</Subhead>
              {/* Cart container */}
              <View style={{ height: '40%', paddingBottom: '5%', alignItems: 'center' }}>
                <ScrollView>
                  {cart.map(product => (
                    <TouchableOpacity key={product.id} onPress={() => this.removeFromCart(product)}>
                      <ProductCartCard product={product} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ height: '20%', paddingBottom: '5%' }}>
                <TextHeader>Rewards Applied</TextHeader>
                <ScrollView style={{ alignSelf: 'flex-end' }}>{this.generateRewardsApplied()}</ScrollView>
              </View>
              <View style={{ height: '20%', paddingBottom: '5%' }}>
                <TextHeader>Rewards Available</TextHeader>
                <ScrollView style={{ alignSelf: 'flex-end' }}>{this.generateRewardsAvailable()}</ScrollView>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                overflow: 'auto',
                alignItems: 'center'
              }}>
              {/* When different types of rewards are created, we can add rewards amount to state. For now, rewards
              amount is equal to rewards applied * 5. */}
              <SubtotalCard subtotalPrice={subtotalPrice.toFixed(2)} rewardsAmount={rewardsApplied * 5} />
              <TotalCard totalPrice={totalPrice.toFixed(2)} totalPoints={totalPoints} />
              <FilledButtonContainer width="100%" style={{ marginBottom: 0 }} onPress={() => this.handleSubmit()}>
                <ButtonLabel>Complete Purchase</ButtonLabel>
              </FilledButtonContainer>
            </View>
          </SaleContainer>
        </View>
      </ScrollView>
    );
  }
}

CheckoutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
