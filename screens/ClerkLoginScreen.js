import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Button, Keyboard, Picker, Text, TouchableWithoutFeedback } from 'react-native';
import { status } from '../lib/constants';
import { loadStoreData, lookupClerk } from '../lib/loginUtils';
import Colors from '../assets/Colors';
import { Title, FilledButtonContainer, ButtonLabel } from '../components/BaseComponents';
import { CheckInContainer, CheckInContentContainer, TextField } from '../styled/checkin';
import BackButton from '../components/BackButton';

// TODO rename this
const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>{children}</TouchableWithoutFeedback>
);

export default class ClerkLoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      errorMsg: null,
      loginPermission: false
    };
  }

  // Purely to bypass the flow for development -- go straight to Checkout.
  // Configures to use Jeffry Poa & Robin Hood
  _devBypass = async () => {
    await AsyncStorage.setItem('clerkId', 'recgq59j7Cx9zsSYE');
    await AsyncStorage.setItem('storeId', 'recw49LpAOInqvX3e');
    await AsyncStorage.setItem('customerId', 'recqx32YmmACiRWMq');
    this.props.navigation.navigate('Checkout');
  };

  // Set the clerkId and storeId in AsyncStorage
  // Then navigate to the customer lookup screen
  _asyncLoginClerk = async clerkRecord => {
    await AsyncStorage.setItem('clerkId', clerkRecord.id);
    await AsyncStorage.setItem('storeId', this.props.navigation.state.params.store.id);
    this.props.navigation.navigate('CustomerLookup', { clerkName: clerkRecord.clerkName });
  };

  loginPermissionHandler = password => {
    let loginPermission = false;
    if (password.length == 4) {
      loginPermission = true;
    }
    this.setState({ password, loginPermission });
  };

  // This function will sign the user in if the clerk is found.
  handleSubmit = async () => {
    try {
      // Uses the `Store ID` lookup in AirTable
      const lookupResult = await lookupClerk(this.props.navigation.state.params.store.id, this.state.password);

      let clerkRecord = null;
      switch (lookupResult.status) {
        case status.MATCH:
          clerkRecord = lookupResult.record;
          this._asyncLoginClerk(clerkRecord);
          break;
        // TODO for production, we should have some sort of logging mechanism (i.e replacing console logs)
        case status.FOUND:
          console.log('Incorrect password');
          break;
        case status.NOT_FOUND:
          console.log('No clerk found at this store');
          break;
        case status.DUPLICATE:
          console.log('Database malformed! Two users found');
          break;
        default:
          return;
      }
      this.setState({ errorMsg: lookupResult.errorMsg, password: '' });
    } catch (err) {
      console.error('Airtable: ', err);
    }
  };

  render() {
    const { store } = this.props.navigation.state.params;
    return (
      // TODO break out this onChange into a function
      <DismissKeyboard>
        <CheckInContainer>
          <BackButton navigation={this.props.navigation} />
          <CheckInContentContainer>
            <Title style={{ marginBottom: 32 }} color="#fff">
              Welcome to {store.storeName}!
            </Title>
            <Title color="#fff">Enter your employee PIN</Title>
            <TextField
              style={{ marginTop: 32 }}
              placeholder="ex. 1234"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={text => this.loginPermissionHandler(text)}
              value={this.state.password}
            />
            <FilledButtonContainer
              style={{ marginTop: 32 }}
              color={this.state.loginPermission ? Colors.primaryGreen : Colors.lightestGreen}
              width="253px"
              height="40px"
              onPress={() => this.handleSubmit()}
              disabled={!this.state.loginPermission}>
              <ButtonLabel color="white">Next</ButtonLabel>
            </FilledButtonContainer>
          </CheckInContentContainer>
          <Button title="Testing Bypass" onPress={() => this._devBypass()} />
        </CheckInContainer>
      </DismissKeyboard>
    );
  }
}

ClerkLoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
