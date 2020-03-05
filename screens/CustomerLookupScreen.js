import React from 'react';
import { AsyncStorage } from 'react-native';
import { getUser, lookupCustomer } from '../lib/lookupUtils';
import {
  Container,
  SubmitButton,
  TextHeader,
  TextInput
} from '../styled/shared.js';

export default class CustomerLookupScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clerkName: '',
      phoneNumber: ''
    };
  }

  async componentDidMount() {
    const clerkId = await AsyncStorage.getItem('clerkId');

    getUser('Clerks', clerkId).then(clerkRecord => {
      if (clerkRecord) {
        let name =
          clerkRecord['fields']['First Name'] +
          ' ' +
          clerkRecord['fields']['Last Name'];
        this.setState({ clerkName: name });
      }
    });
  }

  _asyncCustomerSignIn = async customerId => {
    await AsyncStorage.setItem('customerId', customerId);
    this.props.navigation.navigate('Checkout');
  };

  async handleSubmit() {
    let formattedPhoneNumber = this.state.phoneNumber;
    formattedPhoneNumber = formattedPhoneNumber.replace('[^0-9]', '');
    formattedPhoneNumber = `(${formattedPhoneNumber.slice(
      0,
      3
    )}) ${formattedPhoneNumber.slice(3, 6)}-${formattedPhoneNumber.slice(
      6,
      10
    )}`;

    await lookupCustomer(formattedPhoneNumber)
      .then(resp => {
        if (resp) {
          this._asyncCustomerSignIn(resp);
          this.setState({ phoneNumber: '' });
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ phoneNumber: '' });
      });
  }

  render() {
    return (
      <Container>
        <TextHeader>Welcome, {this.state.clerkName}!</TextHeader>

        <TextInput
          placeholder="Customer Phone Number (i.e. 1234567890)"
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={number => this.setState({ phoneNumber: number })}
          value={this.state.phoneNumber}
        />
        <SubmitButton
          color="#008550"
          title="Find Customer"
          onPress={() => this.handleSubmit()}
        />
      </Container>
    );
  }
}
