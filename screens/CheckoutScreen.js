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
import { addTransaction, displayDollarValue, loadProductsData, updateCustomerPoints } from '../lib/checkoutUtils';
import { rewardDollarValue } from '../lib/constants';
import { BottomBar, ProductsContainer, SaleContainer, TabContainer, TopBar } from '../styled/checkout';
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
      products: [],
      isLoading: true
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem('customerId');
    const customer = await getCustomersById(customerId);
    const products = await loadProductsData();

    // Initialize cart a'la Python dictionary, to make updating quantity cleaner
    // Cart contains line items, which have all initial product attributes, and a quantity
    const initialCart = products.reduce((cart, product) => ({ ...cart, [product.id]: product }), {});

    this.setState({
      customer,
      cart: initialCart,
      rewardsAvailable: Math.floor(customer.rewardsAvailable),
      products,
      isLoading: false
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
    if (priceDifference >= 0 || this.state.rewardsApplied === 0 || newBalance >= 0) {
      this.setState(prevState => ({
        cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
        totalBalance: prevState.totalBalance + priceDifference
      }));
      // Special case: negative balance when rewards have been applied, but need to be restored
      // i.e rewardsValue * rewardsApplied > cartTotal after quantity drops
    } else if (newBalance < 0) {
      // MUST take absolute value first, otherwise will be incorrect
      const rewardsToUndo = Math.ceil(Math.abs(newBalance) / rewardDollarValue);
      // This keeps the "extra" reward UNAPPLIED by default. To swap it, take the remainder instead
      // updatedBalance: rewardDollarValue + (- remainder) = "unapplying" an extra reward
      this.setState(prevState => ({
        cart: update(prevState.cart, { [product.id]: { quantity: { $set: quantity } } }),
        totalBalance:
          // If the remainder is less than 0, updatedBalance = rewardDollarValue + (negative) remainder
          (prevState.totalBalance + priceDifference) % rewardDollarValue < 0
            ? rewardDollarValue + ((prevState.totalBalance + priceDifference) % rewardDollarValue)
            : (prevState.totalBalance + priceDifference) % rewardDollarValue,
        rewardsApplied: prevState.rewardsApplied - rewardsToUndo
      }));
    }
  };

  // Calculates total points earned from transaction
  // Accounts for lineItem individual point values and not allowing points to be earned with rewards daollrs
  getPointsEarned = () => {
    let pointsEarned = Object.values(this.state.cart).reduce(
      (points, lineItem) => points + lineItem.points * lineItem.quantity,
      0
    );
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
    const { rewardsApplied, totalBalance } = this.state;

    // Calculate actual discount and sale; handle negative balances
    const discount = rewardsApplied * rewardDollarValue;
    const subtotal = totalBalance + discount;
    const totalSale = totalBalance > 0 ? totalBalance : 0;
    const actualDiscount = totalBalance < 0 ? discount + totalBalance : discount;
    const pointsEarned = this.getPointsEarned();

    // Passed through displayConfirmation to generateConfirmationMessage and confirmTransaction
    const transactionInfo = {
      discount: actualDiscount,
      subtotal,
      totalSale,
      pointsEarned,
      rewardsApplied // for convenience
    };
    this.displayConfirmation(transactionInfo);
  };

  // Displays a confirmation alert to the clerk.
  displayConfirmation = transactionInfo => {
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
    Alert.alert('Confirm Transaction', this.generateConfirmationMessage(transactionInfo), [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      { text: 'Confirm', onPress: () => this.confirmTransaction(transactionInfo) }
    ]);
  };

  // Generates the confirmation message based on items in cart, points earned,
  // and total spent.
  generateConfirmationMessage = transactionInfo => {
    let msg = Object.values(this.state.cart).reduce(
      (msg, lineItem) => (lineItem.quantity > 0 ? msg.concat(`${lineItem.quantity} x ${lineItem.name}\n`) : msg),
      'Transaction Items:\n\n'
    );
    msg = msg.concat(`\nRewards Redeemed: ${transactionInfo.rewardsApplied}\n`);
    // Adding total price and total points earned to message. Must be called after getPointsEarned() in handleSubmit() for updated amount.
    msg = msg.concat(this.generateConfirmationLine('Subtotal', transactionInfo.subtotal));
    msg = msg.concat(this.generateConfirmationLine('Discount', transactionInfo.discount));
    msg = msg.concat(this.generateConfirmationLine('Total Sale', transactionInfo.totalSale));
    msg = msg.concat(`\nTotal Points Earned: ${transactionInfo.pointsEarned}`);
    return msg;
  };

  // Adds the transaction to the user's account and updates their points.
  confirmTransaction = async transactionInfo => {
    try {
      const transactionId = await addTransaction(this.state.customer, this.state.cart, transactionInfo);
      await updateCustomerPoints(this.state.customer, transactionInfo.pointsEarned, transactionInfo.rewardsApplied);
      this.props.navigation.navigate('Confirmation', { transactionId });
    } catch (err) {
      // TODO better handling - should prompt the user to try again, or at least say something is wrong with the service
      // Technically the only thing that could happen is a network failure, but likely indicates a change in column schema etc
      console.log('Error creating transaction in Airtable', err);
    }
  };

  // Returns index of the first product with a name starting with the given letter in products list.
  // If no product starting with that letter exists, find the next product.
  getIndexOfFirstProductAtLetter = letter => {
    let prodList = this.state.products.filter(product => product.name.charAt(0) === letter);
    let nextLetter = letter;
    while (prodList.length === 0) {
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
      prodList = this.state.products.filter(product => product.name.charAt(0) === nextLetter);
    }
    return this.state.products.indexOf(prodList[0]);
  };

  generateConfirmationLine = (name, value) => {
    return `\n${name}: ${displayDollarValue(value)}`;
  };

  // Takes in strings tab label (i.e. "A-K") and starting letter (i.e. "A") and returns a
  // tab for the bottom alphabetical scroll bar.
  alphabeticalScrollTab = (label, letter) => {
    return (
      <TabContainer
        onPress={() =>
          this._scrollView.scrollTo({
            y: Math.floor(this.getIndexOfFirstProductAtLetter(letter) / 5) * 160
          })
        }>
        <Title>{label}</Title>
      </TabContainer>
    );
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }

    const { cart, customer, totalBalance } = this.state;
    const totalSale = totalBalance > 0 ? totalBalance : 0;
    const pointsEarned = this.getPointsEarned();
    const subtotal = totalBalance + this.state.rewardsApplied * rewardDollarValue;

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
          <View style={{ display: 'flex', flex: 5, flexDirection: 'column' }}>
            <ProductsContainer
              ref={scrollView => {
                this._scrollView = scrollView;
              }}>
              {Object.entries(cart).map(([id, product]) => (
                <QuantityModal key={id} product={product} isLineItem={false} callback={this.updateQuantityCallback} />
              ))}
            </ProductsContainer>
            <BottomBar style={{ display: 'flex', flexDirection: 'row' }}>
              {this.alphabeticalScrollTab('A-K', 'A')}
              {this.alphabeticalScrollTab('L-S', 'L')}
              {this.alphabeticalScrollTab('T-Z', 'T')}
            </BottomBar>
          </View>
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
              <View style={{ height: '60%' }}>
                <Subhead>Current Sale</Subhead>
                {/* Cart container */}
                <View style={{ height: '100%', paddingBottom: '5%' }}>
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
              {/* Should be greyed out if totalPrice < 5 */}
              <View>
                <RewardModal
                  totalBalance={totalBalance}
                  customer={customer}
                  rewardsAvailable={this.state.rewardsAvailable}
                  rewardsApplied={this.state.rewardsApplied}
                  callback={this.applyRewardsCallback}
                />
                {/* When different types of rewards are created, we can add rewards amount to state. For now, rewards
              amount is equal to rewards applied * 5. */}
                <SubtotalCard subtotalPrice={subtotal.toFixed(2)} rewardsAmount={this.state.rewardsApplied * 5} />
                <TotalCard totalPrice={totalSale.toFixed(2)} totalPoints={pointsEarned} />
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
