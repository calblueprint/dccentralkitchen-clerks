import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import Colors from '../../assets/Colors';
import {
  BigTitle,
  BigTitleLabel,
  Body,
  ButtonLabel,
  RoundedButtonContainer,
  SquareButtonContainer,
  Title
} from '../../components/BaseComponents';
import { displayDollarValue } from '../../lib/checkoutUtils';
import {
  ModalCenteredOpacityLayer,
  ModalContentContainer,
  ModalCopyContainer,
  SubheadActive,
  SubheadSecondary
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
      showError: false,
      isLoading: true
    };
  }

  componentDidMount() {
    const { rewardsAvailable, rewardsApplied, totalBalance } = this.props;
    // TODO make reward value data in AirTable
    const rewardValue = 5;
    // Calculate eligible rewards
    const rewardsAllowed = Math.ceil(totalBalance / rewardValue);
    const rewardsEligible = Math.min(rewardsAllowed, rewardsAvailable);
    console.log(this.props);
    console.log(rewardsEligible);
    this.setState({
      rewardsAvailable,
      rewardsApplied,
      totalBalance,
      rewardsEligible,
      isLoading: false
    });
  }

  // Forces a re-render when new props are passed
  componentWillReceiveProps(nextProps) {
    // TODO make reward value data in AirTable
    const rewardValue = 5;
    const { rewardsAvailable, totalBalance } = nextProps;
    if (this.state.totalBalance !== totalBalance) {
      // Recalculate eligible rewards (available/applied are unaffected)
      const rewardsAllowed = Math.ceil(totalBalance / rewardValue);
      const rewardsEligible = Math.min(rewardsAllowed, rewardsAvailable);
      console.log(nextProps);
      console.log(rewardsEligible);
      this.setState(prevState => ({ ...prevState, totalBalance, rewardsEligible }));
    }
  }

  setModalVisible = visible => this.setState({ modalVisible: visible });

  toggleVisibility = () => {
    this.setModalVisible(!this.state.modalVisible);
  };

  showError = show => {
    // Sets a 2s timeout for the showError
    this.setState({ showError: show }, () => setTimeout(() => this.setState({ showError: false }), 2000));
  };

  handleApplyRewards = () => {
    // Communicate to parent component
    this.props.callback(this.state.rewardsApplied, this.state.totalBalance);
    this.setModalVisible(!this.state.modalVisible);
  };

  updateRewardsApplied = addToApplied => {
    // TODO make reward value data in AirTable
    const rewardValue = 5;
    if (addToApplied) {
      this.setState(prevState => ({
        rewardsApplied: prevState.rewardsApplied + 1,
        totalBalance: prevState.totalBalance - rewardValue
      }));
    } else {
      this.setState(prevState => ({
        rewardsApplied: prevState.rewardsApplied - 1,
        totalBalance: prevState.totalBalance + rewardValue
      }));
    }
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }
    const { customer } = this.props;
    const { showError, modalVisible, totalBalance, rewardsApplied, rewardsAvailable, rewardsEligible } = this.state;
    // TODO pull rewardValue from Airtable
    const rewardValue = 5;
    const min = rewardsApplied === 0;
    const max = rewardsApplied === rewardsEligible;
    const discount = rewardValue * rewardsApplied;
    const totalSale = totalBalance >= 0 ? totalBalance : 0;
    return (
      <RowContainer style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Modal
          animationType="none"
          supportedOrientations={['landscape']}
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            this.toggleVisibility();
          }}>
          <ModalCenteredOpacityLayer>
            <ModalContentContainer width="50%" height="60%">
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  padding: 20,
                  paddingBottom: 0
                }}
                onPress={() => this.setModalVisible(false)}>
                <FontAwesome5 name="times" size={24} color={Colors.activeText} />
              </TouchableOpacity>
              {/* Invisible element used to trick flexbox into spacin correctly with 'space-around' 
                even though 'cancel' button is pinned using position: absolute */}
              <View style={{ padding: 8 }}>{null}</View>
              <ModalCopyContainer style={{ marginLeft: '15%', alignSelf: 'flex-start' }}>
                <Title>Apply rewards</Title>
                <Body color={Colors.secondaryText}>
                  {customer.name} has {rewardsAvailable} rewards
                </Body>
              </ModalCopyContainer>
              <ColumnContainer style={{ width: '40%', margin: 16 }}>
                <SpaceBetweenRowContainer>
                  <BigTitle>{rewardsApplied}</BigTitle>
                  <RowContainer style={{ justifyContent: 'center' }}>
                    <SquareButtonContainer
                      disabled={min}
                      color={min ? Colors.lightestGreen : Colors.darkerGreen}
                      onPress={() => this.updateRewardsApplied(false)}>
                      <BigTitleLabel>-</BigTitleLabel>
                    </SquareButtonContainer>
                    <SquareButtonContainer
                      activeOpacity={max ? 1 : 0.2}
                      color={max ? Colors.lightestGreen : Colors.darkerGreen}
                      onPress={() => (max ? this.showError(true) : this.updateRewardsApplied(true))}>
                      <BigTitleLabel>+</BigTitleLabel>
                    </SquareButtonContainer>
                  </RowContainer>
                </SpaceBetweenRowContainer>
                {showError && (
                  <Body color={Colors.error} style={{ position: 'absolute', bottom: -32 }}>
                    Maximum rewards applied
                  </Body>
                )}
              </ColumnContainer>
              <ModalCopyContainer alignItems={'center'} style={{ width: '40%', margin: 16 }}>
                {/* TODO make a component for this; pattern is in ConfirmationScreen too */}
                <SpaceBetweenRowContainer>
                  <SubheadSecondary style={{ alignSelf: 'flex-start' }}>Subtotal</SubheadSecondary>
                  <SubheadSecondary style={{ alignSelf: 'flex-end' }}>
                    {displayDollarValue(totalBalance + discount)}
                  </SubheadSecondary>
                </SpaceBetweenRowContainer>
                <SpaceBetweenRowContainer>
                  <SubheadSecondary>Rewards</SubheadSecondary>
                  <SubheadSecondary>{displayDollarValue(discount, false)}</SubheadSecondary>
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
          onPress={() => this.toggleVisibility()}>
          <ButtonLabel color={Colors.lightest}>Rewards</ButtonLabel>
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
  callback: PropTypes.func.isRequired
};
