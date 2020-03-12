import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TextInput, TouchableOpacity, View } from 'react-native';
import Colors from '../../assets/Colors';
import { ButtonLabel, Caption, Title } from '../../components/BaseComponents';
import ProductDisplayCard from '../../components/ProductDisplayCard';
import { ColumnContainer, RoundedButtonContainer, RowContainer } from '../../styled/shared';

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
      console.log('DISPLAY: will receive props running');
      console.log(newQuantity);
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
    console.log(this.state.product.quantity);
    const currentQuantityInt = parseInt(this.state.currentQuantity, 10);
    const priceDifference = (currentQuantityInt - initialQuantity) * this.state.product.customerCost;
    this.props.callback(this.state.product, currentQuantityInt, priceDifference);
    this.setModalVisible(!this.state.modalVisible);
  };

  handleClear = () => {
    this.setState({ currentQuantity: '0' });
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
          <RowContainer
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <ColumnContainer
              style={{
                height: '40%',
                width: '60%',
                margin: 'auto',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: 'white'
              }}>
              <Title>Quantity of {product.fullName}</Title>
              <Caption>Key in the quantity and tap ADD TO SALE</Caption>
              <Caption>OR press CLEAR to exit.</Caption>
              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                maxLength={3}
                onChangeText={this.updateQuantity}
                value={this.state.currentQuantity}
              />

              {/* Container for buttons at bottom */}
              <RowContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
                <RoundedButtonContainer color={Colors.activeText} onPress={() => this.handleClear()}>
                  <ButtonLabel>Clear</ButtonLabel>
                </RoundedButtonContainer>
                <RoundedButtonContainer onPress={() => this.handleUpdateCart()}>
                  <ButtonLabel>Add to Sale</ButtonLabel>
                </RoundedButtonContainer>
              </RowContainer>
            </ColumnContainer>
          </RowContainer>
        </Modal>

        <TouchableOpacity
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
