import { FontAwesome5 } from '@expo/vector-icons';
import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, View } from 'react-native';
import * as Sentry from 'sentry-expo';
import { ButtonLabel, RoundedButtonContainer, Subtitle, Title } from '../components/BaseComponents';
import DismissKeyboard from '../components/DismissKeyboard';
import DrawerButton from '../components/DrawerButton';
import Colors from '../constants/Colors';
import { status } from '../lib/constants';
import { logErrorToSentry } from '../lib/logUtils';
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
      this.setState({ clerkName, phoneNumber: '1112223344', errorMsg: null });
    } else {
      this.setState({ clerkName, phoneNumber: '', errorMsg: null });
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

  _formatPhoneNumber = (phoneNumber) => {
    const onlyNumeric = phoneNumber.replace('[^0-9]', '');
    const formatted = `(${onlyNumeric.slice(0, 3)}) ${onlyNumeric.slice(3, 6)}-${onlyNumeric.slice(6, 10)}`;
    return formatted;
  };

  handleSubmit = async () => {
    const formattedPhoneNumber = this._formatPhoneNumber(this.state.phoneNumber);

    try {
      const lookupResult = await lookupCustomer(formattedPhoneNumber);
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
          break;
        case status.NOT_FOUND:
          console.log('No customer registered with this phone number');
          logErrorToSentry({
            screen: 'CustomerLookupScreen',
            action: 'handleSubmit',
            error: 'No customer registered with this phone number',
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
        this.setState({ errorMsg: lookupResult.errorMsg, phoneNumber: '1112223344' });
      } else {
        this.setState({ errorMsg: lookupResult.errorMsg, phoneNumber: '', errorShown: customerNotFound });
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
    const customerPermission = this.state.phoneNumber.length === 10;
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
            <DrawerButton navigation={this.props.navigation} light={false} />
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
                placeholder="ex. 1234567890"
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={(text) => this.setState({ phoneNumber: text, errorShown: false })}
                value={this.state.phoneNumber}
              />
              {this.state.errorShown ? (
                <RowContainer style={{ alignItems: 'center', marginTop: 8, height: 28 }}>
                  <FontAwesome5 name="exclamation-circle" size={16} color={Colors.error} style={{ marginRight: 8 }} />
                  <Subtitle>{this.state.errorMsg}</Subtitle>
                </RowContainer>
              ) : (
                <RowContainer style={{ marginTop: 8, height: 28 }} />
              )}
              <RoundedButtonContainer
                style={{ marginTop: 32 }}
                color={customerPermission ? Colors.primaryGreen : Colors.lightestGreen}
                width="253px"
                height="40px"
                onPress={() => this.handleSubmit()}
                disabled={!customerPermission}>
                <ButtonLabel color={Colors.lightText}>Next</ButtonLabel>
              </RoundedButtonContainer>
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
