import React from 'react';
import {
  AsyncStorage,
  Keyboard,
  Picker,
  TouchableWithoutFeedback
} from 'react-native';
import { loadStoreData, lookupClerk } from '../lib/loginUtils';
import { Container, SubmitButton, TextInput } from '../styled/shared.js';
import {
  FilledButtonContainer,
  ButtonLabel
} from '../components/BaseComponents';

//TODO rename this
const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

export default class ClerkLoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeName: '',
      storeId: '',
      password: '',
      stores: [],
      displayErrorMsg: '' // TODO @tommypoa: isLoading
    };
  }

  async componentDidMount() {
    const stores = await loadStoreData();
    // Set to first store as default, since the picker also defaults to the top (first in list)
    this.setState({
      stores: stores,
      storeName: stores[0].name,
      storeId: stores[0].id
    });
  }

  // Set the clerkId and storeId in AsyncStorage
  // Then navigate to the customer lookup screen
  _asyncLoginClerk = async recordId => {
    await AsyncStorage.setItem('clerkId', recordId);
    await AsyncStorage.setItem('storeId', this.state.storeId);
    this.props.navigation.navigate('CustomerLookup');
  };

  // This function will sign the user in if the clerk is found.
  async handleSubmit() {
    // Uses the `Store ID` lookup in AirTable
    await lookupClerk(this.state.storeId, this.state.password)
      .then(resp => {
        if (resp) {
          const recordId = resp;
          this._asyncLoginClerk(recordId);
        }
      })
      .catch(err => {
        console.error('Error submitting form', err);
      });
  }

  render() {
    return (
      // TODO break out this onChange into a function
      <DismissKeyboard>
        <Container>
          <Picker
            mode="dropdown"
            onValueChange={store => this.setState({ storeId: store })}
            selectedValue={this.state.storeId}>
            {this.state.stores.map((item, index) => {
              return (
                <Picker.Item
                  label={item['name']}
                  value={item['id']}
                  key={index}
                />
              );
            })}
          </Picker>
          <TextInput
            placeholder="Password"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={true}
            onChangeText={text => this.setState({ password: text })}
            value={this.state.password}
          />
          <SubmitButton
            color="#008550"
            title="Log In"
            onPress={() => this.handleSubmit()}
          />
          <FilledButtonContainer>
            <ButtonLabel>Complete Purchase</ButtonLabel>
          </FilledButtonContainer>
        </Container>
      </DismissKeyboard>
    );
  }
}
