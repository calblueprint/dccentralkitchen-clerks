import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, View } from 'react-native';
import Colors from '../assets/Colors';
import BackButton from '../components/BackButton';
import { ButtonLabel, RoundedButtonContainer, Title } from '../components/BaseComponents';
import { status } from '../lib/constants';
import { lookupCustomer } from '../lib/lookupUtils';
import { CheckInContainer, CheckInContentContainer, TextField } from '../styled/checkin';
import { RowContainer } from '../styled/shared';

export default class CustomerLookupScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clerkName: '',
      phoneNumber: '',
      errorMsg: '',
      customerPermission: false
    };
  }

  // TODO: this is currently not being used
  // Clears error state and phoneNumber entered so far
  async componentDidMount() {
    const clerkName = await AsyncStorage.getItem('clerkName');
    // Clerk Training: pre-fill customer phone number for Summer Strawberry
    const phoneNumber = clerkName === 'Sunny Citrus' ? '1112223344' : '';
    this.setState({ clerkName, phoneNumber, errorMsg: null });
  }

  _asyncCustomerFound = async customerRecord => {
    await AsyncStorage.setItem('customerId', customerRecord.id);
    this.props.navigation.navigate('Checkout');
  };

  _formatPhoneNumber = phoneNumber => {
    const onlyNumeric = phoneNumber.replace('[^0-9]', '');
    const formatted = `(${onlyNumeric.slice(0, 3)}) ${onlyNumeric.slice(3, 6)}-${onlyNumeric.slice(6, 10)}`;
    return formatted;
  };

  customerPermissionHandler = phoneNumber => {
    let customerPermission = false;
    if (phoneNumber.length === 10) {
      customerPermission = true;
    }
    this.setState({ phoneNumber, customerPermission });
  };

  handleSubmit = async () => {
    const formattedPhoneNumber = this._formatPhoneNumber(this.state.phoneNumber);

    try {
      const lookupResult = await lookupCustomer(formattedPhoneNumber);
      let customerRecord = null;

      switch (lookupResult.status) {
        case status.FOUND:
          customerRecord = lookupResult.record;
          this._asyncCustomerFound(customerRecord);
          break;
        // TODO for production, we should have some sort of logging mechanism (i.e replacing console logs)
        case status.NOT_FOUND:
          console.log('No customer registered with this phone number');
          break;
        case status.DUPLICATE:
          console.log('Database malformed! Two users found with this phone number');
          break;
        default:
          return;
      }
      this.setState({ errorMsg: lookupResult.errorMsg, phoneNumber: '' });
    } catch (err) {
      console.error('Customer Lookup Screen: ', err);
    }
  };

  render() {
    return (
      <View>
        <RowContainer
          style={{
            zIndex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            marginTop: 33,
            marginLeft: 29,
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}>
          <BackButton navigation={this.props.navigation} light={false} />
          <Title style={{ marginLeft: 16 }}>{this.state.clerkName}</Title>
        </RowContainer>

        <CheckInContainer color={Colors.lightest}>
          <CheckInContentContainer>
            <Title>Enter customer phone number</Title>
            <TextField
              style={{ marginTop: 32 }}
              placeholder="(123) 456-7890"
              keyboardType="number-pad"
              maxLength={10}
              onChangeText={text => this.customerPermissionHandler(text)}
              value={this.state.phoneNumber}
            />
            <RoundedButtonContainer
              style={{ marginTop: 32 }}
              color={this.state.customerPermission ? Colors.primaryGreen : Colors.lightestGreen}
              width="253px"
              height="40px"
              onPress={() => this.handleSubmit()}
              disabled={!this.state.customerPermission}>
              <ButtonLabel color="white">Next</ButtonLabel>
            </RoundedButtonContainer>
          </CheckInContentContainer>
        </CheckInContainer>
      </View>
    );
  }
}

CustomerLookupScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
