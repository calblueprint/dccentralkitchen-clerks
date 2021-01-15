import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { isTablet } from '../constants/Layout';
import { rewardDollarValue } from '../constants/Rewards';
import QuantityModal from '../screens/modals/QuantityModal';
import RewardModal from '../screens/modals/RewardModal';
import { SaleContainer } from '../styled/checkout';
import { ButtonContainer, ButtonLabel, FilledButtonContainer, Subtitle } from './BaseComponents';
import SubtotalCard from './SubtotalCard';
import TotalCard from './TotalCard';

export default function CurrentSale({
  lineItems,
  cart,
  totalBalance,
  rewardsAvailable,
  rewardsApplied,
  customer,
  applyRewardsCallback,
  toggleShowCallback,
  completeSaleCallback,
  updateQuantityCallback,
}) {
  // Calculates total points earned from transaction
  // Accounts for lineItem individual point values and not allowing points to be earned with rewards daollrs
  const getPointsEarned = () => {
    let earned = Object.values(cart).reduce((points, lineItem) => points + lineItem.points * lineItem.quantity, 0);
    // Customer cannot earn points with rewards dollars; assumes a reward's point multiplier per dollar is 100 pts
    earned -= rewardsApplied * rewardDollarValue * 100;

    // TODO this might be a design edge case now that rewards applied can bring the technical balance to a negative
    if (earned < 0) {
      if (totalBalance > 0) {
        console.log(
          'Total points less than 0! This is likely a bug, unless the value of various items is < 100 pts per item, since the real balance is positive. '
        );
      }
      // Otherwise, expected - value of rewards applied > value of items in cart
      earned = 0;
    }
    return earned;
  };

  const pointsEarned = getPointsEarned();
  const discount = rewardsApplied * rewardDollarValue;
  const actualDiscount = totalBalance < 0 ? discount + totalBalance : discount;
  const subtotal = totalBalance + actualDiscount;
  const totalSale = totalBalance > 0 ? totalBalance : 0;
  const scrollRef = useRef();

  const cartEmpty = Object.values(cart).reduce((empty, lineItem) => lineItem.quantity === 0 && empty, true);

  return (
    <SaleContainer>
      {!isTablet ? (
        <ButtonContainer style={{ marginTop: 40, marginLeft: 24 }} onPress={() => toggleShowCallback()}>
          <FontAwesome5 name="times" size={24} color={Colors.activeText} />
        </ButtonContainer>
      ) : (
        /* Empty view to maintain spacing */
        <View style={{ height: 64 }} />
      )}
      <View
        style={{
          paddingTop: 12,
          paddingLeft: 14,
          paddingRight: 14,
          paddingBottom: 0,
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
        }}>
        <Subtitle style={{ marginBottom: 16 }}>Current Sale</Subtitle>
        {/* Cart container */}
        <ScrollView
          style={{ paddingBottom: '5%' }}
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}>
          {lineItems.map((id) => {
            return (
              cart[id].quantity > 0 && (
                <QuantityModal key={id} product={cart[id]} isLineItem callback={updateQuantityCallback} />
              )
            );
          })}
        </ScrollView>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingTop: 8,
          }}>
          <RewardModal
            totalBalance={totalBalance}
            customer={customer}
            rewardsAvailable={rewardsAvailable}
            rewardsApplied={rewardsApplied}
            callback={applyRewardsCallback}
          />
          <View>
            <SubtotalCard subtotalPrice={subtotal} rewardsAmount={actualDiscount} />
            <TotalCard totalSale={totalSale} totalPoints={pointsEarned} />
          </View>
        </View>
      </View>
      <FilledButtonContainer
        width="100%"
        height="60px"
        style={{ paddingTop: 3 }}
        disabled={cartEmpty}
        color={cartEmpty ? Colors.lightestGreen : Colors.primaryGreen}
        onPress={() =>
          completeSaleCallback({
            discount: actualDiscount,
            subtotal,
            totalSale,
            pointsEarned,
            rewardsApplied, // for convenience
          })
        }>
        <ButtonLabel>Complete Sale</ButtonLabel>
      </FilledButtonContainer>
    </SaleContainer>
  );
}

CurrentSale.propTypes = {
  lineItems: PropTypes.array.isRequired,
  cart: PropTypes.object.isRequired,
  totalBalance: PropTypes.number.isRequired,
  rewardsAvailable: PropTypes.number.isRequired,
  rewardsApplied: PropTypes.number.isRequired,
  customer: PropTypes.object.isRequired,
  applyRewardsCallback: PropTypes.func.isRequired,
  toggleShowCallback: PropTypes.func.isRequired,
  completeSaleCallback: PropTypes.func.isRequired,
  updateQuantityCallback: PropTypes.func.isRequired,
};
