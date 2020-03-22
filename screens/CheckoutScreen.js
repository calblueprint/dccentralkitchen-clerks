import PropTypes from 'prop-types';
import React from 'react';
import update from 'react-addons-update';
import { Alert, AsyncStorage, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BackButton from '../components/BackButton';
import { ButtonLabel, FilledButtonContainer, Subhead, Title } from '../components/BaseComponents';
import SubtotalCard from '../components/SubtotalCard';
import TotalCard from '../components/TotalCard';
import { getCustomersById } from '../lib/airtable/request';
import { addTransaction, loadProductsData, updateCustomerPoints } from '../lib/checkoutUtils';
import { ProductsContainer, SaleContainer, TopBar } from '../styled/checkout';
import QuantityModal from './modals/QuantityModal';
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
      subtotalPrice: 0,
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
    this.setState(prevState => ({
      cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
      totalPrice: prevState.totalPrice + priceDifference
    }));
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
    this.displayConfirmation(this.state.totalPoints);
  };

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage = totalPoints => {
    let msg = 'Transaction Items:\n\n';
    // Iterate over lineItems in cart
    Object.values(this.state.cart).forEach(lineItem => {
      if (lineItem.quantity > 0) {
        msg = msg.concat(`${lineItem.quantity} x ${lineItem.name}\n`);
      }
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

    const { cart, customer, subtotalPrice, totalPrice, totalPoints } = this.state;

    return (
      <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1 }}>
        <TopBar>
          <BackButton navigation={this.props.navigation} light={false} style={{ marginTop: 3, marginLeft: 24 }} />
          <Title> {'Customer: '.concat(customer.name)} </Title>
          {/* Duplicate, invisible element to have left-aligned BackButton */}
          <BackButton navigation={this.props.navigation} light={false} style={{ opacity: 0.0, disabled: true }} />
        </TopBar>
        <View style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
          {/* Display products */}
          <ProductsContainer>
            {Object.entries(cart).map(([id, product]) => (
              <QuantityModal key={id} product={product} isLineItem={false} callback={this.updateQuantityCallback} />
            ))}

            <BottomBar style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
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
            <View
              style={{
                paddingTop: 13,
                paddingLeft: 14,
                paddingRight: 14,
                paddingBottom: 0,
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1
              }}>
              <View>
                <Subhead>Current Sale</Subhead>
                {/* Cart container */}
                <View style={{ flex: 'auto', height: '60%', paddingBottom: '5%' }}>
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
              </View>
              {/* <View style={{ display: 'flex', marginBottom: 0, justifyContent: 'flex-end' }}> */}
              {/* Should be greyed out if totalPrice < 5 */}
              <View>
                <RewardModal
                  totalPrice={totalPrice}
                  customer={customer}
                  rewardsAvailable={this.state.rewardsAvailable}
                  rewardsApplied={this.state.rewardsApplied}
                  callback={this.applyRewardsCallback}
                  style={{ backgroundColor: 'green' }}
                />
                {/* When different types of rewards are created, we can add rewards amount to state. For now, rewards
              amount is equal to rewards applied * 5. */}
                <SubtotalCard subtotalPrice={subtotalPrice.toFixed(2)} rewardsAmount={this.state.rewardsApplied * 5} />
                <TotalCard totalPrice={totalPrice.toFixed(2)} totalPoints={totalPoints} />
              </View>
            </View>
            <FilledButtonContainer onPress={() => this.handleSubmit()}>
              <ButtonLabel>Complete Purchase</ButtonLabel>
            </FilledButtonContainer>
          </SaleContainer>
        </View>
      </View>
    );
  }
}

CheckoutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
