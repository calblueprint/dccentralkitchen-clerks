import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Button, Keyboard } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Body, ButtonLabel, RoundedButtonContainer, Title } from '../components/BaseComponents';
import DismissKeyboard from '../components/DismissKeyboard';
import Colors from '../constants/Colors';
import RecordIds from '../constants/RecordIds';
import { env } from '../environment';
import { getAllStores } from '../lib/airtable/request';
import {
  CheckInContainer,
  CheckInContentContainer,
  SearchBarContainer,
  SearchElement,
  TextField,
} from '../styled/checkin';

export default class StoreLookupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      store: null,
      textFieldBlur: true,
      searchStr: '',
    };
  }

  async componentDidMount() {
    try {
      const stores = await getAllStores();
      // Set to first store as default, since the picker also defaults to the top (first in list)
      this.setState({
        stores,
      });
    } catch (err) {
      logErrorToSentry({
        screen: 'StoreLookupScreen',
        action: 'loadStoreData',
        error: err,
      });
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

  onSearchElementPress = (store) => {
    this.setState({ searchStr: store.storeName, store, textFieldBlur: true });
    Keyboard.dismiss();
  };

  handleNavigate = async () => {
    // Clerk training: set `trainingMode` to "true" in AsyncStorage
    if (this.state.store.storeName === 'CLERK TRAINING') {
      Analytics.logEvent('SelectTrainingMode', {
        name: 'Select Clerk Training mode',
        function: 'handleNavigate',
        component: 'StoreLookupScreen',
      });
      await AsyncStorage.setItem('trainingMode', JSON.stringify(true));
    } else {
      await AsyncStorage.setItem('trainingMode', JSON.stringify(false));
    }
    this.props.navigation.navigate('ClerkLogin', { store: this.state.store, storeName: this.state.store.storeName });
  };

  render() {
    const { store, stores, searchStr } = this.state;
    const filteredStores = stores.filter((_store) => _store.storeName.toLowerCase().includes(searchStr.toLowerCase()));
    const storePermission = store !== null;
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
              onChangeText={(text) =>
                this.setState({
                  searchStr: text,
                })
              }
              value={this.state.searchStr}
              onFocus={() => this.onFocus()}
              autoCorrect={false}
            />
            {!this.state.textFieldBlur && (
              <SearchBarContainer>
                <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {filteredStores.map((_store) => (
                    <SearchElement key={_store.id} onPress={() => this.onSearchElementPress(_store)}>
                      <Body>{_store.storeName}</Body>
                    </SearchElement>
                  ))}
                </ScrollView>
              </SearchBarContainer>
            )}
            {this.state.textFieldBlur && (
              <RoundedButtonContainer
                style={{ marginTop: 32 }}
                color={storePermission ? Colors.primaryGreen : Colors.lightestGreen}
                width="253px"
                height="40px"
                onPress={() => this.handleNavigate()}
                disabled={!storePermission}>
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
