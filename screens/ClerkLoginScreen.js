import React from "react";
import { BASE } from "../lib/common";
// import console = require("console");

import {
  AsyncStorage,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Text,
  Picker
} from "react-native";
// import console = require("console");

function createStoresData(record) {
  object = record.fields;
  return {
    name: object["Store Name"],
    id: record.id
  };
}

async function loadStoreData() {
  const storesTable = BASE("Stores").select({ view: "Grid view" });
  try {
    let records = await storesTable.firstPage();
    var fullStores = records.map(record => createStoresData(record));
    return fullStores;
  } catch (err) {
    console.error(err);
    return []; // TODO @tommypoa: silent fails
  }

  // storesTable.firstPage((err, records) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   var fullStores = records.map(record => createStoresData(record));
  //   console.log(fullStores);
  //   return fullStores;
  // });
}

const stores = [{ name: "A & S Grocery", id: "recw49LpAOInqvX3e" }];

export default class ClerkLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeName: stores[0],
      password: "",
      stores: [] // TODO @tommypoa: isLoading
    };
  }

  async componentDidMount() {
    this.setState({
      stores: await loadStoreData()
    });
    console.log("Stores", this.state.stores);
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

  // From SignUpScreen. Sign in function. It sets the user token in local storage
  // to be the fname + lname and then navigates to homescreen.
  _asyncSignin = async recordId => {
    await AsyncStorage.setItem("clerkId", recordId);
    await AsyncStorage.setItem("storeId", this.state.store.id);
    console.log(this.state.store.id);
    this.props.navigation.navigate("CustomerPhoneNumberScreen");
    // this.props.navigation.navigate("ClerkLoginScreen");
  };

  // This function will sign the user in if the clerk is found.
  async handleSubmit() {
    console.log(this.state.store);
    console.log(this.state.store);
    await this.lookupClerk(this.state.store.name, this.state.password)
      .then(resp => {
        if (resp) {
          const recordId = resp;
          this.setState({
            storeName: stores[0],
            password: ""
          });
          this._asyncSignin(recordId);
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ storeName: stores[0], password: "" });
      });
  }

  render() {
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Picker
          style={{ flex: 1 }}
          mode="dropdown"
          onValueChange={store => this.setState({ store: store })}
          selectedValue={this.state.store}
        >
          {this.state.stores.map((item, index) => {
            return (
              <Picker.Item label={item["name"]} value={item} key={index} />
            );
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
        {/* <Text style={styles.text}>{this.state.userDisplay}</Text> */}
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
