import { FontAwesome5 } from '@expo/vector-icons';
import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, View } from 'react-native';
import { Body, ButtonContainer, ButtonLabel, FilledButtonContainer, Title } from '../../components/BaseComponents';
import LineItemCard from '../../components/LineItemCard';
import ProductDisplayCard from '../../components/ProductDisplayCard';
import Colors from '../../constants/Colors';
import {
  ModalCenteredOpacityLayer,
  ModalContainer,
  ModalContentContainer,
  ModalHeaderBar,
  QuantityInput,
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
      isLoading: true,
    };
  }

  componentDidMount() {
    const { product } = this.props;
    this.resetCurrentQuantity();
    this.setState({
      product,
      isLoading: false,
    });
  }

  // Forces a re-render when new props are passed
  // TODO: this is deprecated - may need to find an alternative to getDerivedStateFromProps
  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    const newQuantity = nextProps.product.quantity;
    if (this.state.currentQuantity !== newQuantity) {
      this.setState((prevState) => ({
        ...prevState,
        product: nextProps.product,
        currentQuantity: newQuantity === 0 ? '' : newQuantity.toString(),
      }));
    }
  }

  resetCurrentQuantity = () => {
    const { product } = this.props;
    const quantityInt = product.quantity;
    this.setState({ currentQuantity: quantityInt === 0 ? '' : quantityInt.toString() });
  };

  setModalVisible = (visible) => {
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
    Analytics.logEvent('ConfirmQuantity', {
      name: 'Apply product quantity',
      function: 'handleUpdateCart',
      component: 'QuantityModal',
      product: this.state.product.fullName,
      quantity: currentQuantityInt,
    });
    this.setModalVisible(!this.state.modalVisible);
  };

  // Update quantity (string)
  updateQuantity = (quantity) => {
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
          supportedOrientations={['landscape', 'portrait']}
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}>
          {/* Opacity layer */}
          <ModalCenteredOpacityLayer>
            <ModalContainer>
              <ModalHeaderBar>
                <ButtonContainer style={{ marginLeft: 12 }} onPress={() => this.setModalVisible(false)}>
                  <FontAwesome5 name="times" size={24} color={Colors.activeText} />
                </ButtonContainer>

                <FilledButtonContainer
                  height="100%"
                  color={currentQuantity === '' ? Colors.lightestGreen : Colors.primaryGreen}
                  disabled={currentQuantity === ''}
                  onPress={() => this.handleUpdateCart()}>
                  <ButtonLabel>Update Quantity</ButtonLabel>
                </FilledButtonContainer>
              </ModalHeaderBar>
              <ModalContentContainer>
                <Title>{`Quantity of ${product.fullName}`}</Title>
                <ColumnContainer>
                  <Body>Key in the quantity and tap UPDATE QUANTITY</Body>
                  <Body>OR press the top left X to exit.</Body>
                </ColumnContainer>
                <QuantityInput
                  style={{ marginTop: 24 }}
                  autoFocus
                  placeholder="Quantity"
                  onChangeText={this.updateQuantity}
                  value={currentQuantity}
                />
              </ModalContentContainer>
            </ModalContainer>
          </ModalCenteredOpacityLayer>
        </Modal>

        {isLineItem ? (
          product.quantity > 0 && (
            <ButtonContainer
              onPress={() => {
                this.setModalVisible(true);
                Analytics.logEvent('OpenQuantityModal', {
                  name: 'Open quantity modal',
                  function: 'onPress',
                  component: 'QuantityModal',
                  source: 'LineItemCard',
                  action: product.quantity > 0 ? 'update' : 'add_new',
                  product: product.fullName,
                  product_id: product.id,
                });
              }}>
              <LineItemCard product={product} />
            </ButtonContainer>
          )
        ) : (
          <ButtonContainer
            onPress={() => {
              this.setModalVisible(true);
              Analytics.logEvent('OpenQuantityModal', {
                name: 'Open quantity modal',
                function: 'onPress',
                component: 'QuantityModal',
                source: 'ProductDisplayCard',
                action: product.quantity > 0 ? 'update' : 'add_new',
                product: product.fullName,
                product_id: product.id,
              });
            }}>
            <ProductDisplayCard product={product} />
          </ButtonContainer>
        )}
      </View>
    );
  }
}

QuantityModal.propTypes = {
  product: PropTypes.object.isRequired,
  callback: PropTypes.func.isRequired,
  isLineItem: PropTypes.bool.isRequired,
};
