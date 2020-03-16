import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Button, Keyboard, Picker, Text, TouchableWithoutFeedback } from 'react-native';
import { status } from '../lib/constants';
import { loadStoreData, lookupClerk } from '../lib/loginUtils';
import { Container, SubmitButton, TextInput } from '../styled/shared';
import Colors from '../assets/Colors';
import { Title, FilledButtonContainer, ButtonLabel } from '../components/BaseComponents';
import { CheckInContainer, CheckInContentContainer, TextField } from '../styled/checkin';

export default class StoreLookupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      store: {},
      password: '',
      errorMsg: null,
      storePermission: true
    };
  }

  async componentDidMount() {
    try {
      const stores = await loadStoreData();
      // Set to first store as default, since the picker also defaults to the top (first in list)
      this.setState({
        stores,
        store: stores[0]
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

  storePermissionHandler = store => {
    let storePermission = false;
    if (store) {
      storePermission = true;
    }
    this.setState({ store, storePermission });
  };

  handleNavigate = () => {
    this.props.navigation.navigate('ClerkLogin', { store: this.state.store, storeName: this.state.store.storeName });
  };

  render() {
    return (
      // TODO break out this onChange into a function
      <CheckInContainer>
        <CheckInContentContainer>
          <Title color="#fff">Enter store name</Title>
          <TextField
            style={{ marginTop: 32 }}
            placeholder="ex: Healthy Corner Store"
            onChangeText={text => this.storePermissionHandler(text)}
            value={this.state.store.storeName}
          />
          <FilledButtonContainer
            style={{ marginTop: 32 }}
            color={this.state.storePermission ? Colors.primaryGreen : Colors.lightestGreen}
            width="253px"
            height="40px"
            onPress={() => this.handleNavigate()}
            disabled={!this.state.storePermission}>
            <ButtonLabel color="white">Next</ButtonLabel>
          </FilledButtonContainer>
        </CheckInContentContainer>
        <Button title="Testing Bypass" onPress={() => this._devBypass()} />
      </CheckInContainer>
    );
  }
}

StoreLookupScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
