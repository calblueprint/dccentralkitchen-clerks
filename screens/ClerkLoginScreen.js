import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Button, Keyboard, Picker, Text, TouchableWithoutFeedback } from 'react-native';
import { status } from '../lib/constants';
import { loadStoreData, lookupClerk } from '../lib/loginUtils';
import { Container, SubmitButton, TextInput } from '../styled/shared';

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
      errorMsg: null
    };
  }

  async componentDidMount() {
    try {
      // Sanity-clearing, even though all items will be set throughout the flow
      await AsyncStorage.clear();
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
    this.props.navigation.navigate('Checkout');
  };

  // Set the clerkId and storeId in AsyncStorage
  // Then navigate to the customer lookup screen
  _asyncLoginClerk = async clerkRecord => {
    await AsyncStorage.setItem('clerkId', clerkRecord.id);
    await AsyncStorage.setItem('clerkName', clerkRecord.clerkName);
    await AsyncStorage.setItem('storeId', this.state.storeId);
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
          await this._asyncLoginClerk(clerkRecord);
          this.props.navigation.navigate('CustomerLookup');
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

  render() {
    return (
      // TODO break out this onChange into a function
      <DismissKeyboard>
        <Container>
          <Picker
            mode="dropdown"
            onValueChange={storeId => this.setState({ storeId })}
            selectedValue={this.state.storeId}>
            {this.state.stores.map(store => {
              return <Picker.Item label={store.storeName} value={store.id} key={store.id} />;
            })}
          </Picker>
          <TextInput
            placeholder="Password"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            onChangeText={text => this.setState({ password: text })}
            value={this.state.password}
          />
          <SubmitButton color="#008550" title="Log In" onPress={() => this.handleSubmit()} />
          {this.state.errorMsg ? <Text>{this.state.errorMsg}</Text> : null}
          <Button title="Testing Bypass" onPress={() => this._devBypass()} />
        </Container>
      </DismissKeyboard>
    );
  }
}

ClerkLoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
