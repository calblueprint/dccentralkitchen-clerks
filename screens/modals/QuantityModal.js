import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import Colors from '../../assets/Colors';
import { Body, ButtonLabel, RoundedButtonContainer, Title } from '../../components/BaseComponents';
import LineItemCard from '../../components/LineItemCard';
import ProductDisplayCard from '../../components/ProductDisplayCard';
import {
  ModalCenteredOpacityLayer,
  ModalContentContainer,
  ModalCopyContainer,
  QuantityInput
} from '../../styled/modal';
import { ColumnContainer } from '../../styled/shared';

export default class QuantityModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      product: null,
      // Needs to be string type because it's TextInput
      currentQuantity: '',
      isLoading: true
    };
  }

  componentDidMount() {
    const { product } = this.props;
    this.resetCurrentQuantity();
    this.setState({
      product,
      isLoading: false
    });
  }

  // Forces a re-render when new props are passed
  // TODO: this is deprecated - may need to find an alternative to getDerivedStateFromProps
  componentWillReceiveProps(nextProps) {
    const newQuantity = nextProps.product.quantity;
    if (this.state.currentQuantity !== newQuantity) {
      this.setState(prevState => ({
        ...prevState,
        product: nextProps.product,
        currentQuantity: newQuantity === 0 ? '' : newQuantity.toString()
      }));
    }
  }

  resetCurrentQuantity = () => {
    const { product } = this.props;
    const quantityInt = product.quantity;
    this.setState({ currentQuantity: quantityInt === 0 ? '' : quantityInt.toString() });
  };

  setModalVisible = visible => {
    // Reset state every time modal is re-opened
    if (visible) {
      this.resetCurrentQuantity();
    }
    this.setState({ modalVisible: visible });
  };

  // Communicate to parent component
  handleUpdateCart = () => {
    const initialQuantity = this.state.product.quantity;
    const currentQuantityInt = parseInt(this.state.currentQuantity, 10);
    const priceDifference = (currentQuantityInt - initialQuantity) * this.state.product.customerCost;
    this.props.callback(this.state.product, currentQuantityInt, priceDifference);
    this.setModalVisible(!this.state.modalVisible);
  };

  // Update quantity (string)
  updateQuantity = quantity => {
    // Only allow blank or integer input (no punctuation)
    if (!Number.isInteger(parseInt(quantity, 10)) && quantity !== '') {
      return;
    }
    this.setState({ currentQuantity: quantity });
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }
    const { product, isLineItem } = this.props;
    const { currentQuantity } = this.state;
    return (
      <View>
        <Modal
          animationType="none"
          supportedOrientations={['landscape']}
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}>
          {/* Opacity layer */}
          <ModalCenteredOpacityLayer>
            <ModalContentContainer>
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
              {/* Invisible element used to trick flexbox into spacin correctly with 'space-around' even though 'cancel' button is pinned using position: absolute */}
              <View>{null}</View>
              <ModalCopyContainer>
                <Title>Quantity of {product.fullName}</Title>
                <ColumnContainer>
                  <Body>Key in the quantity and tap UPDATE QUANTITY</Body>
                  <Body>OR press the top left X to exit.</Body>
                </ColumnContainer>
              </ModalCopyContainer>
              <QuantityInput
                autoFocus
                placeholder="Quantity"
                onChangeText={this.updateQuantity}
                value={currentQuantity}
              />
              <RoundedButtonContainer
                color={currentQuantity === '' ? Colors.lightestGreen : Colors.primaryGreen}
                disabled={currentQuantity === ''}
                onPress={() => this.handleUpdateCart()}>
                <ButtonLabel>Update Quantity</ButtonLabel>
              </RoundedButtonContainer>
            </ModalContentContainer>
          </ModalCenteredOpacityLayer>
        </Modal>

        {isLineItem ? (
          product.quantity > 0 && (
            <TouchableOpacity
              onPress={() => {
                this.setModalVisible(true);
              }}>
              <LineItemCard product={product} />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            onPress={() => {
              this.setModalVisible(true);
            }}>
            <ProductDisplayCard product={product} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

QuantityModal.propTypes = {
  product: PropTypes.object.isRequired,
  callback: PropTypes.func.isRequired,
  isLineItem: PropTypes.bool.isRequired
};
