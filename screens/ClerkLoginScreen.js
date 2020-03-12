import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Button, Keyboard, Picker, Text, TouchableWithoutFeedback } from 'react-native';
import { status } from '../lib/constants';
import { loadStoreData, lookupClerk } from '../lib/loginUtils';
import Colors from '../assets/Colors';
import { Title, FilledButtonContainer, ButtonLabel } from '../components/BaseComponents';
import { CheckInContainer, CheckInContentContainer, TextField } from '../styled/checkin';

// TODO rename this
const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>{children}</TouchableWithoutFeedback>
);

export default class ClerkLoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      storeId: '',
      password: '',
      errorMsg: null,
      loginPermission: false
    };
  }

  async componentDidMount() {
    try {
      const stores = await loadStoreData();
      // Set to first store as default, since the picker also defaults to the top (first in list)
      this.setState({
        stores,
        storeId: stores[0].id
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Purely to bypass the flow for development -- go straight to Checkout.
  // Configures to use Jeffry Poa & Robin Hood
  _devBypass = async () => {
    await AsyncStorage.setItem('clerkId', 'recgq59j7Cx9zsSYE');
    await AsyncStorage.setItem('storeId', 'recw49LpAOInqvX3e');
    await AsyncStorage.setItem('customerId', 'recqx32YmmACiRWMq');
    this.props.navigation.navigate('CustomerLookup');
  };

  // Set the clerkId and storeId in AsyncStorage
  // Then navigate to the customer lookup screen
  _asyncLoginClerk = async clerkRecord => {
    await AsyncStorage.setItem('clerkId', clerkRecord.id);
    await AsyncStorage.setItem('storeId', this.state.storeId);
    this.props.navigation.navigate('CustomerLookup', { clerkName: clerkRecord.clerkName });
  };

  // This function will sign the user in if the clerk is found.
  async handleSubmit() {
    try {
      // Uses the `Store ID` lookup in AirTable
      const lookupResult = await lookupClerk(this.state.storeId, this.state.password);

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
  }

  loginPermissionHandler = password => {
    let loginPermission = false;
    if (password.length == 4) {
      loginPermission = true;
    }
    this.setState({ password, loginPermission });
  };

  render() {
    return (
      // TODO break out this onChange into a function
      <DismissKeyboard>
        <CheckInContainer>
          <CheckInContentContainer>
            <Title style={{ marginBottom: 32 }} color="#fff">
              Welcome to ____
            </Title>
            <Title color="#fff">Enter your employee PIN</Title>
            <TextField
              style={{ marginTop: 32 }}
              placeholder="Password"
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
