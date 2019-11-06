import React from "react";
import Airtable from "airtable";
import { BASE } from "../lib/common";

import {
  AsyncStorage,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Text,
  Picker
} from "react-native";

import getEnvVars from "../environment";

// const stores = [
//   "A & S Grocery",
//   "Bodega Market (Florida Avenue)",
//   "Capitol Market",
//   "DC Mini Mart"
// ];

const storesBase = BASE("Products").select({ view: "Grid view" });
var myStores;

storesBase.firstPage((err, records) => {
  if (err) {
    console.log(err);
  }
  // console.log("storename", record.fields["Store Name"]);
  myStores = records.map(record => record.fields["Name"]);
});

export default class ClerkLogin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      storeName: "frick",
      password: "",
      userDisplay: ""
    };
  }

  // lookupCustomer searches for clerks based on their
  // store name and numeric password. If the user is found, we return the clerk's first
  // and last name. Otherwise, we will display an error on the login screen.
  async lookupClerk(storeName, password) {
    return new Promise((resolve, reject) => {
      BASE("Clerks")
        .select({
          maxRecords: 1,
          filterByFormula:
            "AND({Store Name} = '" +
            storeName +
            "', {Password} = '" +
            password +
            "')"
        })
        .eachPage(
          function page(records, fetchNextPage) {
            if (records.length == 0) {
              reject(
                "Incorrect store name and password combination. Please try again."
              );
            } else {
              records.forEach(function(record) {
                resolve([record.get("First Name"), record.get("Last Name")]);
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

  // From SignUpScreen. Sign in function. It sets the user token in local storage
  // to be the fname + lname and then navigates to homescreen.
  _asyncSignin = async (firstName, lastName) => {
    await AsyncStorage.setItem("userToken", firstName + lastName);
    this.props.navigation.navigate("ClerkLogin");
  };

  // This function will sign the user in if the clerk is found.
  async handleSubmit() {
    await this.lookupClerk(this.state.storeName, this.state.password)
      .then(resp => {
        if (resp) {
          const firstName = resp[0];
          const lastName = resp[1];
          this._asyncSignin(firstName, lastName);
          this.setState({
            userDisplay: resp,
            storeName: stores[0],
            password: ""
          });
        }
      })
      .catch(err => {
        this.setState({ userDisplay: err, storeName: stores[0], password: "" });
      });
  }

  render() {
    // const myStores = this.getStores();
    // console.log("store:", myStores);
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Picker
          selectedValue={this.state.storeName}
          style={{ flex: 1 }}
          mode="dropdown"
          onValueChange={store => this.setState({ storeName: store })}
        >
          {myStores.map((item, index) => {
            return <Picker.Item label={item} value={item} key={index} />;
          })}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="Password"
          keyboardType="number-pad"
          secureTextEntry={true}
          onChangeText={text => this.setState({ password: text })}
          value={this.state.password}
        />
        <Button title="Log In" onPress={() => this.handleSubmit()} />
        <Text style={styles.text}>{this.state.userDisplay}</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignContent: "center"
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
