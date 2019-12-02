import React from "react";
import { BASE } from "../lib/common";
import { TextInput, styles } from "../styles";

import { AsyncStorage, View, Button, Text } from "react-native";

export default class CustomerPhoneNumberScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clerkName: "",
      phoneNumber: ""
    };
  }

  async componentDidMount() {
    const clerkId = await AsyncStorage.getItem("clerkId");

    this.getUser("Clerks", clerkId).then(clerkRecord => {
      if (clerkRecord) {
        let name =
          clerkRecord["fields"]["First Name"] +
          " " +
          clerkRecord["fields"]["Last Name"];
        this.setState({ clerkName: name });
      }
    });
  }

  async getUser(table, id) {
    return BASE(table).find(id);
  }

  async lookupCustomer(phoneNumber) {
    return new Promise((resolve, reject) => {
      BASE("Customers")
        .select({
          maxRecords: 1,
          filterByFormula: `{Phone Number} = '${phoneNumber}'`
        })
        .firstPage(function page(records, fetchNextPage) {
          if (records.length == 0) {
            reject("Incorrect customer phone number. Please try again.");
          } else {
            records.forEach(function(record) {
              // console.log(record["fields"]["First Name"]);
              resolve(record.getId());
            });
          }
          fetchNextPage();
        });
    }).catch(err => {
      console.error("Error looking up customer", err);
    });
  }

  _asyncCustomerSignIn = async customerId => {
    await AsyncStorage.setItem("customerId", customerId);
    this.props.navigation.navigate("ClerkProductsScreen");
  };

  async handleSubmit() {
    let formatted_phone_number = this.state.phoneNumber;
    formatted_phone_number = formatted_phone_number.replace("[^0-9]", "");
    formatted_phone_number = `(${formatted_phone_number.slice(
      0,
      3
    )}) ${formatted_phone_number.slice(3, 6)}-${formatted_phone_number.slice(
      6,
      10
    )}`;

    await this.lookupCustomer(formatted_phone_number)
      .then(resp => {
        if (resp) {
          this._asyncCustomerSignIn(resp);
          this.setState({ phoneNumber: "" });
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ phoneNumber: "" });
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Welcome, {this.state.clerkName}!</Text>

        <TextInput
          placeholder="Customer Phone Number (i.e. 1234567890)"
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={number => this.setState({ phoneNumber: number })}
          value={this.state.phoneNumber}
        />
        <Button title="Find Customer" onPress={() => this.handleSubmit()} />
      </View>
    );
  }
}
