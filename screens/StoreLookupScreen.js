import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Button, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Body, ButtonLabel, RoundedButtonContainer, Title } from '../components/BaseComponents';
import Colors from '../constants/Colors';
import RecordIds from '../constants/RecordIds';
import { env } from '../environment';
import { loadStoreData } from '../lib/loginUtils';
import {
  CheckInContainer,
  CheckInContentContainer,
  SearchBarContainer,
  SearchElement,
  TextField,
} from '../styled/checkin';

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>{children}</TouchableWithoutFeedback>
);

export default class StoreLookupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      filteredStores: [],
      store: {},
      storePermission: false,
      textFieldBlur: true,
      searchStr: '',
    };
  }

  async componentDidMount() {
    try {
      const stores = await loadStoreData();
      // Set to first store as default, since the picker also defaults to the top (first in list)
      this.setState({
        stores,
        filteredStores: stores,
      });
    } catch (err) {
      console.error('Store Lookup Screen', err);
    }
  }

  // Purely to bypass the flow for development -- go straight to Checkout.
  // Configures to use Jeffry Poa & Robin Hood
  _devBypass = async () => {
    await AsyncStorage.setItem('clerkName', 'Jeffry Poa');
    await AsyncStorage.setItem('clerkId', RecordIds.testClerkId);
    await AsyncStorage.setItem('storeId', RecordIds.testStoreId);
    await AsyncStorage.setItem('customerId', RecordIds.testCustomerId);
    await AsyncStorage.setItem('trainingMode', JSON.stringify(false));
    this.props.navigation.navigate('App', { screen: 'App', params: { screen: 'Checkout' } });
  };

  _devConfirmBypass = async () => {
    this.props.navigation.navigate('App', {
      screen: 'App',
      params: { screen: 'Confirmation', params: { transactionId: RecordIds.testTransactionId } },
    });
  };

  onFocus = () => {
    this.setState({ textFieldBlur: false });
  };

  storePermissionHandler = (store) => {
    let storePermission = false;
    if (store) {
      storePermission = true;
    }
    this.setState({ store, storePermission });
  };

  handleChangeText = (searchStr) => {
    this.setState({
      searchStr,
    });
    this.updateFilteredStores(searchStr);
  };

  onSearchElementPress = (store) => {
    this.setState({ searchStr: store.storeName, store, textFieldBlur: true });
    this.storePermissionHandler(store);
    this.updateFilteredStores(store.storeName);
    Keyboard.dismiss();
  };

  handleNavigate = async () => {
    // Clerk training: set `trainingMode` to "true" in AsyncStorage
    if (this.state.store.storeName === 'CLERK TRAINING') {
      await AsyncStorage.setItem('trainingMode', JSON.stringify(true));
    } else {
      await AsyncStorage.setItem('trainingMode', JSON.stringify(false));
    }
    this.props.navigation.navigate('ClerkLogin', { store: this.state.store, storeName: this.state.store.storeName });
  };

  updateFilteredStores = (searchStr) => {
    this.setState({
      filteredStores: this.state.stores.filter((store) =>
        store.storeName.toLowerCase().includes(searchStr.toLowerCase())
      ),
    });
  };

  render() {
    return (
      <DismissKeyboard>
        <CheckInContainer behavior="position" keyboardVerticalOffset="-200">
          <CheckInContentContainer>
            <Title color={Colors.lightest}>Enter store name</Title>
            <TextField
              clearButtonMode="always"
              selectionColor={Colors.primaryGreen}
              style={{ marginTop: 32 }}
              placeholder="ex: Healthy Corner Store"
              onChangeText={(text) => this.handleChangeText(text)}
              value={this.state.searchStr}
              onFocus={() => this.onFocus()}
              autoCorrect={false}
            />
            {!this.state.textFieldBlur && (
              <SearchBarContainer>
                <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {this.state.filteredStores.map((store) => (
                    <SearchElement key={store.id} onPress={() => this.onSearchElementPress(store)}>
                      <Body>{store.storeName}</Body>
                    </SearchElement>
                  ))}
                </ScrollView>
              </SearchBarContainer>
            )}
            {this.state.textFieldBlur && (
              <RoundedButtonContainer
                style={{ marginTop: 32 }}
                color={this.state.storePermission ? Colors.primaryGreen : Colors.lightestGreen}
                width="253px"
                height="40px"
                onPress={() => this.handleNavigate()}
                disabled={!this.state.storePermission}>
                <ButtonLabel color={Colors.lightest}>Next</ButtonLabel>
              </RoundedButtonContainer>
            )}
          </CheckInContentContainer>
          {env === 'dev' && <Button title="Checkout Bypass" onPress={() => this._devBypass()} />}
          {env === 'dev' && <Button title="Confirmation Bypass" onPress={() => this._devConfirmBypass()} />}
        </CheckInContainer>
      </DismissKeyboard>
    );
  }
}

StoreLookupScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};
