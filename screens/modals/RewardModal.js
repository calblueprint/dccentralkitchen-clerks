import { FontAwesome5 } from '@expo/vector-icons';
import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal } from 'react-native';
import {
  BigTitle,
  BigTitleButtonLabel,
  Body,
  ButtonContainer,
  ButtonLabel,
  FilledButtonContainer,
  RoundedButtonContainer,
  SquareButtonContainer,
  Title,
} from '../../components/BaseComponents';
import Colors from '../../constants/Colors';
import { rewardDollarValue } from '../../constants/Rewards';
import { calculateEligibleRewards, displayDollarValue } from '../../lib/checkoutUtils';
import {
  ModalCenteredOpacityLayer,
  ModalContainer,
  ModalContentContainer,
  ModalHeaderBar,
  SubtitleActive,
  SubtitleSecondary,
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
  // eslint-disable-next-line react/no-deprecated
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
          supportedOrientations={['landscape', 'portrait']}
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}>
          <ModalCenteredOpacityLayer>
            <ModalContainer>
              <ModalHeaderBar>
                <ButtonContainer style={{ marginLeft: 12 }} onPress={() => this.setModalVisible(false)}>
                  <FontAwesome5 name="times" size={24} color={Colors.activeText} />
                </ButtonContainer>
                <FilledButtonContainer height="100%" onPress={() => this.handleApplyRewards()}>
                  <ButtonLabel>Done</ButtonLabel>
                </FilledButtonContainer>
              </ModalHeaderBar>
              <ModalContentContainer>
                <Title>Apply rewards</Title>
                <Body color={Colors.secondaryText}>{`${customer.name} has ${rewardsAvailable} reward(s)`}</Body>
                <ColumnContainer style={{ marginVertical: 24 }}>
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
                  <Body color={Colors.error}>{errorShown ? 'Maximum rewards applied' : ' '}</Body>
                </ColumnContainer>
                {/* TODO make a component for this; pattern is in ConfirmationScreen too */}
                <SpaceBetweenRowContainer>
                  <SubtitleSecondary style={{ alignSelf: 'flex-start' }}>Subtotal</SubtitleSecondary>
                  <SubtitleSecondary style={{ alignSelf: 'flex-end' }}>
                    {displayDollarValue(totalBalance + discount)}
                  </SubtitleSecondary>
                </SpaceBetweenRowContainer>
                <SpaceBetweenRowContainer>
                  <SubtitleSecondary>Rewards</SubtitleSecondary>
                  <SubtitleSecondary>{displayDollarValue(actualDiscount, false)}</SubtitleSecondary>
                </SpaceBetweenRowContainer>
                <SpaceBetweenRowContainer>
                  <SubtitleActive>Total Sale</SubtitleActive>
                  <SubtitleActive>{displayDollarValue(totalSale)}</SubtitleActive>
                </SpaceBetweenRowContainer>
              </ModalContentContainer>
            </ModalContainer>
          </ModalCenteredOpacityLayer>
        </Modal>

        <RoundedButtonContainer
          style={{ margin: 12 }}
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
