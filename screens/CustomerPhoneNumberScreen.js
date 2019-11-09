import React from "react";
import { BASE } from "../lib/common";

import {
  AsyncStorage,
  StyleSheet,
  TextInput,
  View,
  Button,
  Text
} from "react-native";
// import console = require("console");

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

    this.getUser(clerkId).then(clerkRecord => {
      if (clerkRecord) {
        let name =
          clerkRecord["fields"]["First Name"] +
          " " +
          clerkRecord["fields"]["Last Name"];
        this.setState({ clerkName: name });
      }
    });
  }

  async getUser(id) {
    return BASE("Clerks").find(id);
  }

  async lookupCustomer(phoneNumber) {
    return new Promise((resolve, reject) => {
      BASE("Customers")
        .select({
          maxRecords: 1,
          filterByFormula: `{Phone Number} = '${phoneNumber}'`
        })
        .eachPage(
          function page(records, fetchNextPage) {
            if (records.length == 0) {
              reject("Incorrect customer phone number. Please try again.");
            } else {
              records.forEach(function(record) {
                console.log(record["fields"]["First Name"]);
                resolve(record.getId());
              });
            }
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              reject(err);
            }
          }
        );
    });
  }

  _asyncCustomerSignIn = async customerId => {
    await AsyncStorage.setItem("customerId", customerId);
    this.props.navigation.navigate("CustomerPhoneNumberScreen");
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
        <Text style={styles.text}>Welcome, {this.state.clerkName}!</Text>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignContent: "center",
    marginTop: "50%",
    display: "flex",
    alignItems: "center"
  },
  input: {
    width: 350,
    height: 55,
    backgroundColor: "#42A5F5",
    margin: 10,
    padding: 8,
    color: "white",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "500"
  },
  text: {
    fontSize: 14,
    textAlign: "center"
  }
});
