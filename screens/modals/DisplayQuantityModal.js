import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import Colors from '../../assets/Colors';
import { Body, ButtonLabel, Title } from '../../components/BaseComponents';
import ProductDisplayCard from '../../components/ProductDisplayCard';
import { ModalCenteredOpacityLayer, QuantityInput } from '../../styled/checkout';
import { ColumnContainer, RoundedButtonContainer } from '../../styled/shared';

export default class DisplayQuantityModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      product: null,
      // Needs to be string type because it's TextInput
      currentQuantity: '0',
      isLoading: true
    };
  }

  componentDidMount() {
    const { product } = this.props;
    const quantityInt = product.quantity;
    this.setState({
      product,
      currentQuantity: quantityInt.toString(10),
      isLoading: false
    });
  }

  // TODO is this needed? YES it is because it runs when new props are passed
  componentWillReceiveProps(nextProps) {
    const newQuantity = nextProps.product.quantity;
    if (this.state.product.quantity !== newQuantity) {
      this.setState(prevState => ({ ...prevState, product: nextProps.product }));
    }
  }

  setModalVisible = visible => this.setState({ modalVisible: visible });

  // For DisplayQuantityModal modal, don't allow to open modal (they should click on CartQuantityModal instead)
  handleShowModal = () => {
    const initialQuantity = this.state.product.quantity;
    if (initialQuantity > 0) {
      return;
    }
    this.setModalVisible(!this.state.modalVisible);
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
    this.setState({ currentQuantity: quantity });
  };

  render() {
    if (this.state.isLoading) {
      return null;
    }
    const { product } = this.props;
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
                alignItems: 'center',
                justifyContent: 'space-around',
                backgroundColor: 'white'
              }}>
              <ColumnContainer style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                  <FontAwesome5 name="times" size={24} color={Colors.activeText} />
                </TouchableOpacity>
              </ColumnContainer>
              <Title>Quantity of {product.fullName}</Title>
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

        <TouchableOpacity
          disabled={this.state.product.quantity > 0}
          onPress={() => {
            this.handleShowModal();
          }}>
          <ProductDisplayCard product={product} />
        </TouchableOpacity>
      </View>
    );
  }
}

DisplayQuantityModal.propTypes = {
  product: PropTypes.object.isRequired,
  callback: PropTypes.func.isRequired
};
