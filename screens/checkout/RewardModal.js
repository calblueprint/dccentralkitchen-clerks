import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Modal, ScrollView, TouchableHighlight, View } from 'react-native';
import Colors from '../../assets/Colors';
import { ButtonLabel, FilledButtonContainer, Title } from '../../components/BaseComponents';
import { RewardAppliedContainer, RewardAvailableContainer } from '../../styled/checkout';

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
    const { totalPrice } = this.props;
    if (totalPrice < 5) {
      return;
    }
    this.setModalVisible(!this.state.modalVisible);
  };

  handleApplyRewards = () => {
    // Communicate to parent component
    this.props.callback(this.state.rewardsApplied, this.state.totalPrice);
    this.setModalVisible(!this.state.modalVisible);
  };

  handleClear = async () => {
    const clearedStatus = this.state.rewardStatus.map(_ => false);
    await this.setState({ rewardsApplied: 0, rewardStatus: clearedStatus });
    this.handleApplyRewards();
  };

  updateReward = (i, apply) => {
    console.log(this.state.totalPrice);
    if (apply && this.state.totalPrice <= 5) {
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
    return (
      <View style={{ width: '100%' }}>
        <Modal
          animationType="none"
          supportedOrientations={['portrait', 'landscape']}
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <View
              style={{
                height: '75%',
                width: '60%',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'colummn',
                alignItems: 'center',
                backgroundColor: 'white'
              }}>
              <View>
                <Title>{customer.name} has the following rewards available:</Title>
              </View>

              <ScrollView
                style={{
                  width: 400
                }}
                contentContainerStyle={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-around'
                }}>
                {this.generateRewardsAvailable()}
              </ScrollView>

              {/* Container for buttons at bottom */}
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <FilledButtonContainer
                  style={{ borderRadius: '20px' }}
                  width="160px"
                  height="39px"
                  color={Colors.activeText}
                  onPress={() => this.handleClear()}>
                  <ButtonLabel>Clear</ButtonLabel>
                </FilledButtonContainer>
                <FilledButtonContainer
                  style={{ borderRadius: '20px' }}
                  width="160px"
                  height="39px"
                  onPress={() => this.handleApplyRewards()}>
                  <ButtonLabel>Apply Rewards</ButtonLabel>
                </FilledButtonContainer>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableHighlight
          onPress={() => {
            this.setModalVisible(true);
          }}>
          <FilledButtonContainer
            style={{ borderRadius: '20px' }}
            width="179px"
            height="40px"
            color={this.state.totalPrice < 5 && this.state.rewardsApplied === 0 ? Colors.lighter : Colors.activeText}
            onPress={() => this.handleShowModal()}>
            <ButtonLabel color={Colors.lightest}>Apply Rewards</ButtonLabel>
          </FilledButtonContainer>
        </TouchableHighlight>
      </View>
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
