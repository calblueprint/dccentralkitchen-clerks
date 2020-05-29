import { FontAwesome5 } from '@expo/vector-icons';
import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import {
  BigTitle,
  BigTitleButtonLabel,
  Body,
  ButtonLabel,
  RoundedButtonContainer,
  SquareButtonContainer,
  Title,
} from '../../components/BaseComponents';
import Colors from '../../constants/Colors';
import { rewardDollarValue } from '../../constants/Rewards';
import { calculateEligibleRewards, displayDollarValue } from '../../lib/checkoutUtils';
import {
  ModalCenteredOpacityLayer,
  ModalContentContainer,
  ModalCopyContainer,
  SubheadActive,
  SubheadSecondary,
} from '../../styled/modal';
import { ColumnContainer, RowContainer, SpaceBetweenRowContainer } from '../../styled/shared';

export default class RewardModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      rewardsAvailable: 0,
      rewardsApplied: 0,
      // totalBalance can be negative, since this happens when we apply rewards with a greater value than cart total price
      totalBalance: 0,
      rewardsEligible: 0,
      errorShown: false,
      isLoading: true,
    };
  }

  componentDidMount() {
    const { rewardsAvailable, rewardsApplied, totalBalance } = this.props;
    this._updateState(rewardsAvailable, rewardsApplied, totalBalance);
    this.setState({ isLoading: false });
  }

  // Forces a re-render when new props are passed
  // TODO: this is deprecated - may need to find an alternative to getDerivedStateFromProps
  componentWillReceiveProps(nextProps) {
    const { rewardsAvailable, rewardsApplied, totalBalance } = nextProps;
    if (this.state.totalBalance !== totalBalance) {
      // Recalculate eligible rewards
      this._updateState(rewardsAvailable, rewardsApplied, totalBalance);
    }
  }

  _updateState = (rewardsAvailable, rewardsApplied, totalBalance) => {
    this.setState({
      rewardsAvailable,
      rewardsApplied,
      totalBalance,
      rewardsEligible: calculateEligibleRewards(rewardsAvailable, rewardsApplied, totalBalance),
    });
  };

  setModalVisible = (visible) => {
    // Reset state every time modal is re-opened
    const { rewardsAvailable, rewardsApplied, totalBalance } = this.props;
    if (visible) {
      this._updateState(rewardsAvailable, rewardsApplied, totalBalance);
    }
    Analytics.logEvent('OpenRewardsModal', {
      name: 'Open Rewards Modal',
      function: 'setModalVisible',
      component: 'RewardModal',
      rewards_available: rewardsAvailable,
      total_balance: totalBalance,
    });
    this.setState({ modalVisible: visible });
  };

  showError = (show) => {
    // Sets a 2s timeout for the showError
    this.setState({ errorShown: show }, () => setTimeout(() => this.setState({ errorShown: false }), 2000));
  };

  handleApplyRewards = () => {
    // Communicate to parent component
    Analytics.logEvent('ConfirmApplyRewards', {
      name: 'Apply Rewards',
      function: 'handleApplyRewards',
      component: 'RewardModal',
      rewards_available: this.state.rewardsAvailable,
      rewards_eligible: this.state.rewardsEligible,
      rewards_applied: this.state.rewardsApplied,
    });
    this.props.callback(this.state.rewardsApplied, this.state.totalBalance);
    this.setModalVisible(!this.state.modalVisible);
  };

  updateRewardsApplied = (addToApplied) => {
    if (addToApplied) {
      this.setState((prevState) => ({
        rewardsApplied: prevState.rewardsApplied + 1,
        totalBalance: prevState.totalBalance - rewardDollarValue,
      }));
    } else {
      this.setState((prevState) => ({
        rewardsApplied: prevState.rewardsApplied - 1,
        totalBalance: prevState.totalBalance + rewardDollarValue,
        errorShown: false,
      }));
    }
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }
    const { customer } = this.props;
    const { errorShown, modalVisible, totalBalance, rewardsApplied, rewardsAvailable, rewardsEligible } = this.state;
    const min = rewardsApplied === 0;
    const max = rewardsApplied === rewardsEligible;
    const discount = rewardDollarValue * rewardsApplied;
    const totalSale = totalBalance >= 0 ? totalBalance : 0;
    const actualDiscount = totalBalance < 0 ? discount + totalBalance : discount;

    return (
      <RowContainer style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Modal
          animationType="none"
          supportedOrientations={['landscape']}
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}>
          <ModalCenteredOpacityLayer>
            <ModalContentContainer width="50%" height="60%">
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  padding: 20,
                  paddingBottom: 0,
                }}
                onPress={() => this.setModalVisible(false)}>
                <FontAwesome5 name="times" size={24} color={Colors.activeText} />
              </TouchableOpacity>
              {/* Invisible element used to trick flexbox into spacin correctly with 'space-around' 
                even though 'cancel' button is pinned using position: absolute */}
              <View style={{ padding: 8 }}>{null}</View>
              <ModalCopyContainer style={{ marginLeft: '15%', alignSelf: 'flex-start' }}>
                <Title>Apply rewards</Title>
                <Body color={Colors.secondaryText}>{`${customer.name} has ${rewardsAvailable} reward(s)`}</Body>
              </ModalCopyContainer>
              <ColumnContainer style={{ width: '40%', margin: 16 }}>
                <SpaceBetweenRowContainer>
                  <BigTitle>{rewardsApplied}</BigTitle>
                  <RowContainer style={{ justifyContent: 'center' }}>
                    <SquareButtonContainer
                      disabled={min}
                      color={min ? Colors.lightestGreen : Colors.darkerGreen}
                      onPress={() => this.updateRewardsApplied(false)}>
                      <BigTitleButtonLabel>-</BigTitleButtonLabel>
                    </SquareButtonContainer>
                    <SquareButtonContainer
                      activeOpacity={max ? 1 : 0.2}
                      color={max ? Colors.lightestGreen : Colors.darkerGreen}
                      onPress={() => (max ? this.showError(true) : this.updateRewardsApplied(true))}>
                      <BigTitleButtonLabel>+</BigTitleButtonLabel>
                    </SquareButtonContainer>
                  </RowContainer>
                </SpaceBetweenRowContainer>
                {errorShown && (
                  <Body color={Colors.error} style={{ position: 'absolute', bottom: -32 }}>
                    Maximum rewards applied
                  </Body>
                )}
              </ColumnContainer>
              <ModalCopyContainer alignItems="center" style={{ width: '40%', margin: 16 }}>
                {/* TODO make a component for this; pattern is in ConfirmationScreen too */}
                <SpaceBetweenRowContainer>
                  <SubheadSecondary style={{ alignSelf: 'flex-start' }}>Subtotal</SubheadSecondary>
                  <SubheadSecondary style={{ alignSelf: 'flex-end' }}>
                    {displayDollarValue(totalBalance + discount)}
                  </SubheadSecondary>
                </SpaceBetweenRowContainer>
                <SpaceBetweenRowContainer>
                  <SubheadSecondary>Rewards</SubheadSecondary>
                  <SubheadSecondary>{displayDollarValue(actualDiscount, false)}</SubheadSecondary>
                </SpaceBetweenRowContainer>
                <SpaceBetweenRowContainer>
                  <SubheadActive>Total Sale</SubheadActive>
                  <SubheadActive>{displayDollarValue(totalSale)}</SubheadActive>
                </SpaceBetweenRowContainer>
              </ModalCopyContainer>
              <RoundedButtonContainer onPress={() => this.handleApplyRewards()}>
                <ButtonLabel>Done</ButtonLabel>
              </RoundedButtonContainer>
            </ModalContentContainer>
          </ModalCenteredOpacityLayer>
        </Modal>

        <RoundedButtonContainer
          width="179px"
          height="40px"
          color={Colors.activeText}
          onPress={() => this.setModalVisible(true)}>
          <ButtonLabel color={Colors.lightText}>Rewards</ButtonLabel>
        </RoundedButtonContainer>
      </RowContainer>
    );
  }
}

RewardModal.propTypes = {
  customer: PropTypes.object.isRequired,
  rewardsAvailable: PropTypes.number.isRequired,
  rewardsApplied: PropTypes.number.isRequired,
  totalBalance: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
};
