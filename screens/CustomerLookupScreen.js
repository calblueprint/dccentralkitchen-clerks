import React from 'react';
import { AsyncStorage, Button, View } from 'react-native';
import { getUser, lookupCustomer } from '../lib/lookupUtils';
import { styles, TextHeader, TextInput } from '../styles';

export default class CustomerPhoneNumberScreen extends React.Component {
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
    let formatted_phone_number = this.state.phoneNumber;
    formatted_phone_number = formatted_phone_number.replace('[^0-9]', '');
    formatted_phone_number = `(${formatted_phone_number.slice(
      0,
      3
    )}) ${formatted_phone_number.slice(3, 6)}-${formatted_phone_number.slice(
      6,
      10
    )}`;

    await lookupCustomer(formatted_phone_number)
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
      <View style={styles.container}>
        <TextHeader>Welcome, {this.state.clerkName}!</TextHeader>

        <TextInput
          placeholder="Customer Phone Number (i.e. 1234567890)"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={number => this.setState({ phoneNumber: number })}
          value={this.state.phoneNumber}
        />
        <Button
          style={styles.button}
          color="#008550"
          title="Find Customer"
          onPress={() => this.handleSubmit()}
        />
      </View>
    );
  }
}
