import PropTypes from 'prop-types';
import React from 'react';
import { Modal, TextInput, TouchableHighlight, View } from 'react-native';
import Colors from '../../assets/Colors';
import { ButtonLabel, Caption, Title } from '../../components/BaseComponents';
import LineItemCard from '../../components/LineItemCard';
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

  componentWillReceiveProps({ lineItem }) {
    this.setState(prevState => ({ ...prevState, lineItem }));
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
              <Title>Quantity of {lineItem.fullName}</Title>
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

        {lineItem.quantity === 0 && (
          <TouchableHighlight
            onPress={() => {
              this.setModalVisible(true);
            }}>
            <LineItemCard product={lineItem} />
          </TouchableHighlight>
        )}
      </View>
    );
  }
}

CartQuantityModal.propTypes = {
  lineItem: PropTypes.object.isRequired,
  callback: PropTypes.func.isRequired
};
