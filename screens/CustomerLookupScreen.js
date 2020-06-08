import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Keyboard, View } from 'react-native';
import * as Sentry from 'sentry-expo';
import { ButtonContainer, ButtonLabel, RoundedButtonContainer, Title } from '../components/BaseComponents';
import DismissKeyboard from '../components/DismissKeyboard';
import DrawerButton from '../components/DrawerButton';
import ErrorMessage from '../components/ErrorMessage';
import Colors from '../constants/Colors';
import { status } from '../lib/constants';
import { logErrorToSentry } from '../lib/logUtils';
import { formatPhoneNumberInput, lookupCustomer } from '../lib/lookupUtils';
import { CheckInContainer, CheckInContentContainer, TextField } from '../styled/checkin';
import { RowContainer } from '../styled/shared';

export default class CustomerLookupScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clerkName: '',
      phoneNumber: '',
      errorMsg: '',
      errorShown: false,
    };
  }

  // TODO: this is currently not being used
  // Clears error state and phoneNumber entered so far
  async componentDidMount() {
    await this._reset();
  }

  _reset = async () => {
    const clerkName = await AsyncStorage.getItem('clerkName');
    // Clerk Training: pre-fill customer (Summer Strawberry) phone number
    if (JSON.parse(await AsyncStorage.getItem('trainingMode'))) {
      this.setState({ clerkName, phoneNumber: '(111) 222-3344', errorMsg: '' });
    } else {
      this.setState({ clerkName, phoneNumber: '', errorMsg: '' });
    }
  };

  _asyncCustomerFound = async (customerRecord) => {
    await AsyncStorage.setItem('customerId', customerRecord.id);
    Analytics.logEvent('CustomerFound', {
      name: 'Customer lookup successful',
      function: '_asyncCustomerFound',
      component: 'CustomerLookupScreen',
      customer_id: customerRecord.id,
      customer_name: customerRecord.name,
    });
    this.props.navigation.navigate('Checkout');
  };

  handleSubmit = async () => {
    try {
      const lookupResult = await lookupCustomer(this.state.phoneNumber);
      let customerRecord = null;

      let customerNotFound = true;
      switch (lookupResult.status) {
        case status.FOUND:
          customerNotFound = false;
          customerRecord = lookupResult.record;
          this._asyncCustomerFound(customerRecord);
          Sentry.configureScope((scope) => {
            scope.setTag('currentCustomer', customerRecord.primaryKey);
            Sentry.captureMessage('Customer found');
          });
          this.setState({
            phoneNumber: JSON.parse(await AsyncStorage.getItem('trainingMode')) ? '(111) 222-3344' : '',
          });
          break;
        case status.NOT_FOUND:
          console.log('No customer found with this phone number');
          logErrorToSentry({
            screen: 'CustomerLookupScreen',
            action: 'handleSubmit',
            error: 'No customer found with this phone number',
          });
          break;
        case status.DUPLICATE:
          console.log('Database malformed! Two users found with this phone number');
          logErrorToSentry({
            screen: 'CustomerLookupScreen',
            action: 'handleSubmit',
            error: 'Database malformed! Two users found with this phone number',
          });
          break;
        default:
          return;
      }
      if (JSON.parse(await AsyncStorage.getItem('trainingMode'))) {
        this.setState({ errorMsg: lookupResult.errorMsg, phoneNumber: '(111) 222-3344' });
      } else {
        this.setState({ errorMsg: lookupResult.errorMsg, errorShown: customerNotFound });
      }
    } catch (err) {
      logErrorToSentry({
        screen: 'CustomerLookupScreen',
        action: 'handleSubmit',
        error: err,
      });
      console.error('Customer Lookup Screen: ', err);
    }
  };

  render() {
    const customerPermission = this.state.phoneNumber.length === 14;
    return (
      <DismissKeyboard>
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
              alignItems: 'center',
            }}>
            <DrawerButton navigation={this.props.navigation} />
            <Title style={{ marginLeft: 16 }}>{this.state.clerkName}</Title>
          </RowContainer>

          <CheckInContainer color={Colors.bgLight}>
            <CheckInContentContainer>
              <Title>Enter customer phone number</Title>
              <TextField
                clearButtonMode="always"
                selectionColor={Colors.primaryGreen}
                style={{ marginTop: 32 }}
                error={this.state.errorShown}
                placeholder="ex. (123) 456-7890"
                keyboardType="number-pad"
                maxLength={14}
                onChangeText={(text) => this.setState({ phoneNumber: formatPhoneNumberInput(text), errorShown: false })}
                value={this.state.phoneNumber}
              />
              <ErrorMessage
                errorMsg={this.state.errorMsg}
                buttonMsg="Register this phone number"
                callback={() => {
                  Keyboard.dismiss();
                  this.props.navigation.navigate('RegisterCustomer', { prefillPhoneNumber: this.state.phoneNumber });
                }}
                errorShown={this.state.errorShown}
              />
              <RoundedButtonContainer
                style={{ marginTop: 16 }}
                color={customerPermission ? Colors.primaryGreen : Colors.lightestGreen}
                width="253px"
                height="40px"
                onPress={() => this.handleSubmit()}
                disabled={!customerPermission}>
                <ButtonLabel color={Colors.lightText}>Next</ButtonLabel>
              </RoundedButtonContainer>
              <ButtonContainer
                style={{ marginTop: 4 }}
                width="253px"
                height="40px"
                onPress={() => {
                  Keyboard.dismiss();
                  this.props.navigation.navigate('RegisterCustomer');
                }}>
                <ButtonLabel noCaps color={Colors.primaryGreen}>
                  Register a Customer
                </ButtonLabel>
              </ButtonContainer>
            </CheckInContentContainer>
          </CheckInContainer>
        </View>
      </DismissKeyboard>
    );
  }
}

CustomerLookupScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};
