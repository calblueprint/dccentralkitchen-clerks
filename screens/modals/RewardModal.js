import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import Colors from '../../assets/Colors';
import { Body, ButtonLabel, Title } from '../../components/BaseComponents';
import { ModalCenteredOpacityLayer } from '../../styled/modal';
import { ColumnContainer, RoundedButtonContainer, RowContainer } from '../../styled/shared';

export default class RewardModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      rewardsAvailable: 0,
      rewardsApplied: 0,
      totalPrice: 0,
      isLoading: true
    };
  }

  componentDidMount() {
    const { rewardsAvailable, rewardsApplied, totalPrice } = this.props;
    this.setState({
      rewardsAvailable,
      rewardsApplied,
      totalPrice,
      isLoading: false
    });
  }

  // Forces a re-render when new props are passed
  componentWillReceiveProps(nextProps) {
    if (this.state.totalPrice !== nextProps.totalPrice) {
      this.setState(prevState => ({ ...prevState, totalPrice: nextProps.totalPrice }));
    }
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

  updateReward = (i, apply) => {
    if (apply && this.state.totalPrice < 5) {
      return;
    }

    if (apply) {
      this.setState({
        rewardsApplied: this.state.rewardsApplied + 1,
        totalPrice: this.state.totalPrice - 5
      });
    } else {
      this.setState({
        rewardsApplied: this.state.rewardsApplied - 1,
        totalPrice: this.state.totalPrice + 5
      });
    }
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
          supportedOrientations={['landscape']}
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
              {/* Icon is fixed, while the rest grows, so flex: 1 is used here */}
              {/* For some reason, gap between is really large. Used top: -20 to remedy it */}
              <ColumnContainer style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', top: -20 }}>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-start',
                    justifyContent: 'center',
                    padding: 20,
                    paddingBottom: 0
                  }}
                  onPress={() => this.setModalVisible(false)}>
                  <FontAwesome5 name="times" size={24} color={Colors.activeText} />
                </TouchableOpacity>
                <ColumnContainer>
                  <Title>Apply rewards</Title>
                  <Body>
                    {customer.name} has {this.state.rewardsAvailable} rewards
                  </Body>
                </ColumnContainer>
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
                  }}></RowContainer>
                <RoundedButtonContainer onPress={() => this.handleApplyRewards()}>
                  <ButtonLabel>Done</ButtonLabel>
                </RoundedButtonContainer>
              </ColumnContainer>
            </ColumnContainer>
          </ModalCenteredOpacityLayer>
        </Modal>

        <RoundedButtonContainer
          disabled={disabled}
          width="179px"
          height="40px"
          color={disabled ? Colors.lighter : Colors.activeText}
          onPress={() => this.handleShowModal()}>
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
  totalPrice: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired
};
