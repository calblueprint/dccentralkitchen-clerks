import AsyncStorage from '@react-native-community/async-storage';
import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import * as Sentry from 'sentry-expo';
import {
  Body,
  ButtonContainer,
  ButtonLabel,
  RoundedButtonContainer,
  Subtitle,
  Title,
} from '../components/BaseComponents';
import CloseButton from '../components/CloseButton';
import DismissKeyboard from '../components/DismissKeyboard';
import ErrorMessage from '../components/ErrorMessage';
import Colors from '../constants/Colors';
import { signUpBonus } from '../constants/Rewards';
import { createCustomers } from '../lib/airtable/request';
import { status } from '../lib/constants';
import { logErrorToSentry } from '../lib/logUtils';
import { formatPhoneNumberInput, lookupCustomer } from '../lib/lookupUtils';
import { CheckInContainer, CheckInContentContainer, TextField } from '../styled/checkin';

export default class RegisterCustomerScreen extends React.Component {
  constructor(props) {
    super(props);
    let prefillPhoneNumber = '';
    if (this.props.route.params) {
      prefillPhoneNumber = this.props.route.params.prefillPhoneNumber;
    }
    this.state = {
      newCustomerName: '',
      newPhoneNumber: prefillPhoneNumber,
      errorMsg: '',
      errorShown: false,
    };
  }

  // Complete registration and go to Checkout
  _asyncRegisterCustomer = async () => {
    const customerId = await this.addCustomer();
    await AsyncStorage.setItem('customerId', customerId);
    Analytics.logEvent('CustomerRegistered', {
      name: 'Customer register successful',
      function: '_asyncCustomerFound',
      component: 'RegisterCustomerScreen',
      customer_id: customerId,
    });
    this.props.navigation.navigate('Checkout');
  };

  addCustomer = async () => {
    const { newPhoneNumber, newCustomerName } = this.state;
    const name = newCustomerName;
    const phoneNumber = newPhoneNumber;
    try {
      const customerId = await createCustomers({
        name,
        phoneNumber,
        points: signUpBonus,
      });

      // If adding the customer succeeds, register the user for analytics and logging
      Analytics.setUserId(customerId);
      Analytics.setUserProperties({
        name,
        phoneNumber,
      });
      Sentry.configureScope((scope) => {
        scope.setUser({
          id: customerId,
          username: name,
          phoneNumber,
        });
        Sentry.captureMessage('Sign Up Successful');
      });
      return customerId;
    } catch (err) {
      console.error('[RegisterCustomerScreen] (addCustomer) Airtable:', err);
      logErrorToSentry({
        screen: 'RegisterCustomerScreen',
        action: 'addCustomer',
        error: err,
      });
    }
    return null;
  };

  handleSubmit = async () => {
    try {
      let lookupResult = await lookupCustomer(this.state.newPhoneNumber);
      let customerRecord = null;

      let customerNotFound = false;
      switch (lookupResult.status) {
        // If the phone number is not already registered, create an account
        case status.NOT_FOUND:
          customerNotFound = true;
          this._asyncRegisterCustomer();
          // Retrieve the new customer's record to log to Sentry
          lookupResult = await lookupCustomer(this.state.newPhoneNumber);
          customerRecord = lookupResult.record;
          Sentry.configureScope((scope) => {
            scope.setTag('currentCustomer', customerRecord.primaryKey);
            Sentry.captureMessage('New customer registered');
          });
          break;
        // If the phone number is already in use, display an error
        case status.FOUND:
        case status.DUPLICATE:
          console.log('A customer with this phone number already exists');
          logErrorToSentry({
            screen: 'RegisterCustomerScreen',
            action: 'handleSubmit',
            error: 'A customer with this phone number already exists',
          });
          break;
        default:
          return;
      }
      this.setState({
        errorMsg: 'A customer with this phone number already exists',
        errorShown: !customerNotFound,
      });
    } catch (err) {
      logErrorToSentry({
        screen: 'RegisterCustomerScreen',
        action: 'handleSubmit',
        error: err,
      });
      console.error('RegisterCustomerScreen: ', err);
    }
  };

  render() {
    const customerPermission = this.state.newPhoneNumber.length === 14 && this.state.newCustomerName.length > 0;
    return (
      <DismissKeyboard>
        <View>
          <CloseButton
            style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, marginTop: 33, marginLeft: 29 }}
            navigation={this.props.navigation}
          />
          <CheckInContainer color={Colors.lightestGray}>
            <CheckInContentContainer>
              <Title>Register a new customer account</Title>
              <Body style={{ marginBottom: 32, textAlign: 'center' }}>
                {`Complete this form to register a customer\n for a Healthy Rewards account.`}
              </Body>
              <Subtitle>Enter customer name</Subtitle>
              <TextField
                clearButtonMode="always"
                selectionColor={Colors.primaryGreen}
                style={{ marginTop: 8, marginBottom: 32 }}
                error={this.state.errorShown}
                placeholder="ex. John Smith"
                autoCapitalize="words"
                onChangeText={(text) => this.setState({ newCustomerName: text, errorShown: false })}
                value={this.state.newCustomerName}
              />
              <Subtitle>Enter customer phone number</Subtitle>
              <TextField
                clearButtonMode="always"
                selectionColor={Colors.primaryGreen}
                style={{ marginTop: 8 }}
                error={this.state.errorShown}
                placeholder="ex. (123) 456-7890"
                keyboardType="number-pad"
                maxLength={14}
                onChangeText={(text) =>
                  this.setState({ newPhoneNumber: formatPhoneNumberInput(text), errorShown: false })
                }
                value={this.state.newPhoneNumber}
              />
              <ErrorMessage
                errorMsg={this.state.errorMsg}
                buttonMsg="Go back to Customer Lookup"
                callback={() =>
                  this.props.navigation.navigate('CustomerLookup', { prefillPhoneNumber: this.state.newPhoneNumber })
                }
                errorShown={this.state.errorShown}
              />
              <RoundedButtonContainer
                style={{ marginTop: 16 }}
                color={customerPermission ? Colors.primaryGreen : Colors.lightestGreen}
                width="253px"
                height="40px"
                onPress={() => this.handleSubmit()}
                disabled={!customerPermission}>
                <ButtonLabel color={Colors.lightText}>Register Customer</ButtonLabel>
              </RoundedButtonContainer>
              <ButtonContainer
                style={{ marginTop: 4 }}
                width="253px"
                height="40px"
                onPress={() => this.props.navigation.goBack()}>
                <ButtonLabel noCaps color={Colors.primaryGreen}>
                  Go Back
                </ButtonLabel>
              </ButtonContainer>
            </CheckInContentContainer>
          </CheckInContainer>
        </View>
      </DismissKeyboard>
    );
  }
}

RegisterCustomerScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object,
};

RegisterCustomerScreen.defaultProps = {
  route: null,
};
