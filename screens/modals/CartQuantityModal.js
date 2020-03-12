import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import Colors from '../../assets/Colors';
import { Body, ButtonLabel, Title } from '../../components/BaseComponents';
import LineItemCard from '../../components/LineItemCard';
import { ModalCenteredOpacityLayer, QuantityInput } from '../../styled/checkout';
import { ColumnContainer, RoundedButtonContainer, RowContainer } from '../../styled/shared';

export default class CartQuantityModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      lineItem: null,
      // Needs to be string type because it's TextInput
      currentQuantity: '0',
      isLoading: true
    };
  }

  componentDidMount() {
    const { lineItem } = this.props;
    const quantityInt = lineItem.quantity;
    this.setState({
      lineItem,
      currentQuantity: quantityInt.toString(),
      isLoading: false
    });
  }

  // Forces a re-render when new props are passed
  componentWillReceiveProps(nextProps) {
    const newQuantity = nextProps.lineItem.quantity;
    if (this.state.lineItem.quantity !== newQuantity) {
      this.setState(prevState => ({ ...prevState, lineItem: nextProps.lineItem }));
    }
  }

  setModalVisible = visible => this.setState({ modalVisible: visible });

  // For Cart modal, redundant check (should only show in cart if quantity > 0)
  handleShowModal = () => {
    const initialQuantity = this.state.lineItem.quantity;
    if (initialQuantity === 0) {
      return;
    }
    this.setModalVisible(!this.state.modalVisible);
  };

  // Communicate to parent component
  handleUpdateCart = () => {
    const initialQuantity = this.state.lineItem.quantity;
    const currentQuantityInt = parseInt(this.state.currentQuantity, 10);
    const priceDifference = (currentQuantityInt - initialQuantity) * this.state.lineItem.customerCost;
    this.props.callback(this.state.lineItem, currentQuantityInt, priceDifference);
    this.setModalVisible(!this.state.modalVisible);
  };

  // Update quantity (string)
  updateQuantity = quantity => {
    this.setState({ currentQuantity: quantity });
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }
    const { lineItem } = this.props;
    return (
      <View>
        <Modal
          animationType="none"
          supportedOrientations={['portrait', 'landscape']}
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!this.state.modalVisible);
          }}>
          {/* Opacity layer */}
          <ModalCenteredOpacityLayer>
            <ColumnContainer
              style={{
                height: '40%',
                width: '60%',
                margin: 'auto',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: 'white'
              }}>
              <RowContainer style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                  <FontAwesome5 name="times" size={24} color={Colors.activeText} />
                </TouchableOpacity>
              </RowContainer>
              <Title>Quantity of {lineItem.fullName}</Title>
              <ColumnContainer style={{ alignItems: 'flex-start' }}>
                <Body>Key in the quantity and tap UPDATE QUANTITY</Body>
                <Body>OR press the top left X to exit.</Body>
              </ColumnContainer>
              <QuantityInput
                textAlign="start"
                placeholder="Quantity"
                keyboardType="numeric"
                maxLength={3}
                onChangeText={this.updateQuantity}
                value={this.state.currentQuantity}
              />
              <RoundedButtonContainer onPress={() => this.handleUpdateCart()}>
                <ButtonLabel>Update Quantity</ButtonLabel>
              </RoundedButtonContainer>
            </ColumnContainer>
          </ModalCenteredOpacityLayer>
        </Modal>

        {lineItem.quantity > 0 && (
          <TouchableOpacity
            onPress={() => {
              this.setModalVisible(true);
            }}>
            <LineItemCard product={lineItem} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

CartQuantityModal.propTypes = {
  lineItem: PropTypes.object.isRequired,
  callback: PropTypes.func.isRequired
};
