import PropTypes from 'prop-types';
import React from 'react';
import { Modal, View } from 'react-native';
import Colors from '../../assets/Colors';
import { ButtonLabel, Title } from '../../components/BaseComponents';
import { ModalCenteredOpacityLayer, RewardAppliedContainer, RewardAvailableContainer } from '../../styled/checkout';
import { ColumnContainer, RoundedButtonContainer, RowContainer } from '../../styled/shared';

export default class RewardModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      rewardsApplied: 0,
      rewardStatus: [],
      totalPrice: 0,
      isLoading: true
    };
  }

  componentDidMount() {
    const { rewardsAvailable, rewardsApplied, totalPrice } = this.props;
    const rewardStatus = [];
    // Build initial status array
    for (let i = 0; i < rewardsAvailable; i += 1) {
      if (i < rewardsApplied) {
        rewardStatus.push(true);
      } else {
        rewardStatus.push(false);
      }
    }
    this.setState({
      rewardsApplied,
      rewardStatus,
      totalPrice,
      isLoading: false
    });
  }

  componentWillReceiveProps({ totalPrice }) {
    this.setState(prevState => ({ ...prevState, totalPrice }));
  }

  setModalVisible = visible => this.setState({ modalVisible: visible });

  handleShowModal = () => {
    const { totalPrice, rewardsAvailable, rewardsApplied } = this.props;
    if ((totalPrice < 5 && rewardsApplied === 0) || rewardsAvailable === 0) {
      return;
    }
    this.setModalVisible(!this.state.modalVisible);
  };

  handleApplyRewards = () => {
    // Communicate to parent component
    this.props.callback(this.state.rewardsApplied, this.state.totalPrice);
    this.setModalVisible(!this.state.modalVisible);
  };

  handleClear = () => {
    const clearedStatus = this.state.rewardStatus.map(_ => false);
    this.setState({
      rewardsApplied: 0,
      rewardStatus: clearedStatus,
      totalPrice: this.state.totalPrice + 5 * this.state.rewardsApplied
    });
  };

  updateReward = (i, apply) => {
    if (apply && this.state.totalPrice < 5) {
      return;
    }

    const rewardStatus = this.state.rewardStatus.slice();
    rewardStatus[i] = !rewardStatus[i];

    if (apply) {
      this.setState({
        rewardStatus,
        rewardsApplied: this.state.rewardsApplied + 1,
        totalPrice: this.state.totalPrice - 5
      });
    } else {
      this.setState({
        rewardStatus,
        rewardsApplied: this.state.rewardsApplied - 1,
        totalPrice: this.state.totalPrice + 5
      });
    }
  };

  // Generates rewards available as a list of TouchableOpacitys to display in modal
  generateRewardsAvailable = () => {
    return this.state.rewardStatus.map((appliedStatus, i) => {
      if (appliedStatus) {
        return (
          <RewardAppliedContainer key={i} onPress={() => this.updateReward(i, false)}>
            <ButtonLabel color={Colors.activeText}>$5 Reward Applied </ButtonLabel>
          </RewardAppliedContainer>
        );
      }
      return (
        <RewardAvailableContainer key={i} onPress={() => this.updateReward(i, true)}>
          <ButtonLabel color={Colors.activeText}>$5 Reward</ButtonLabel>
        </RewardAvailableContainer>
      );
    });
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }
    const { customer } = this.props;
    const disabled =
      (this.state.totalPrice < 5 && this.state.rewardsApplied === 0) || this.state.rewardsAvailable === 0;
    return (
      <RowContainer style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Modal
          animationType="none"
          supportedOrientations={['portrait', 'landscape']}
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!this.state.modalVisible);
          }}>
          <ModalCenteredOpacityLayer>
            <ColumnContainer
              style={{
                height: '75%',
                width: '60%',
                margin: 'auto',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: 'white'
              }}>
              <View>
                <Title>{customer.name} has the following rewards available:</Title>
              </View>

              <RowContainer
                style={{
                  width: 400,
                  height: 300,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                {this.generateRewardsAvailable()}
              </RowContainer>

              {/* Container for buttons at bottom */}
              <RowContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
                <RoundedButtonContainer color={Colors.activeText} onPress={() => this.handleClear()}>
                  <ButtonLabel>Clear All</ButtonLabel>
                </RoundedButtonContainer>
                <RoundedButtonContainer onPress={() => this.handleApplyRewards()}>
                  <ButtonLabel>Apply Rewards</ButtonLabel>
                </RoundedButtonContainer>
              </RowContainer>
            </ColumnContainer>
          </ModalCenteredOpacityLayer>
        </Modal>

        <RoundedButtonContainer
          disabled={disabled}
          width="179px"
          height="40px"
          color={disabled ? Colors.lighter : Colors.activeText}
          onPress={() => this.handleShowModal()}>
          <ButtonLabel color={Colors.lightest}>Apply Rewards</ButtonLabel>
        </RoundedButtonContainer>
      </RowContainer>
    );
  }
}

RewardModal.propTypes = {
  customer: PropTypes.object.isRequired,
  rewardsAvailable: PropTypes.number.isRequired,
  rewardsApplied: PropTypes.number.isRequired,
  totalPrice: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired
};
