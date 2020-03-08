import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, Text } from 'react-native';
import { status } from '../lib/constants';
import { lookupCustomer } from '../lib/lookupUtils';
import { Container, SubmitButton, TextHeader, TextInput } from '../styled/shared';

export default class CustomerLookupScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clerkName: '',
      phoneNumber: '',
      errorMsg: ''
    };
  }

  async componentDidMount() {
    const { clerkName } = this.props.navigation.state.params;
    this.setState({ clerkName });
  }

  _asyncCustomerFound = async customerRecord => {
    await AsyncStorage.setItem('customerId', customerRecord.id);
    this.props.navigation.navigate('Checkout');
  };

  _formatPhoneNumber = phoneNumber => {
    const onlyNumeric = phoneNumber.replace('[^0-9]', '');
    const formatted = `(${onlyNumeric.slice(0, 3)}) ${onlyNumeric.slice(3, 6)}-${onlyNumeric.slice(6, 10)}`;
    return formatted;
  };

  async handleSubmit() {
    const formattedPhoneNumber = this._formatPhoneNumber(this.state.phoneNumber);

    try {
      const lookupResult = await lookupCustomer(formattedPhoneNumber);
      let customerRecord = null;

      switch (lookupResult.status) {
        case status.FOUND:
          customerRecord = lookupResult.record;
          this._asyncCustomerFound(customerRecord);
          break;
        // TODO for production, we should have some sort of logging mechanism (i.e replacing console logs)
        case status.NOT_FOUND:
          console.log('No customer registered with this phone number');
          break;
        case status.DUPLICATE:
          console.log('Database malformed! Two users found with this phone number');
          break;
        default:
          return;
      }
      this.setState({ errorMsg: lookupResult.errorMsg, phoneNumber: '' });
    } catch (err) {
      console.error('Airtable: ', err);
    }
  }

  render() {
    const displayText = 'Welcome, '.concat(this.state.clerkName);
    return (
      <Container>
        <TextHeader>{displayText}</TextHeader>

        <TextInput
          placeholder="Customer Phone Number (i.e. 1234567890)"
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={number => this.setState({ phoneNumber: number })}
          value={this.state.phoneNumber}
        />
        <SubmitButton color="#008550" title="Find Customer" onPress={() => this.handleSubmit()} />
        {this.state.errorMsg ? <Text>{this.state.errorMsg}</Text> : null}
      </Container>
    );
  }
}

CustomerLookupScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
