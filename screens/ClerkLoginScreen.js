import React from "react";
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
}

export default class ClerkLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeName: "",
      storeId: "",
      password: "",
      stores: [] // TODO @tommypoa: isLoading
    };
  }

  async componentDidMount() {
    this.setState({
      stores: await loadStoreData()
    });
  }

  // lookupClerk searches for clerks based on their
  // store name and numeric password. If the user is found, we return the clerk's first
  // and last name. Otherwise, we will display an error on the login screen.
  async lookupClerk(storeId, password) {
    return new Promise((resolve, reject) => {
      BASE("Clerks")
        .select({
          maxRecords: 1,
          filterByFormula: `AND({Store} = '${storeId}', {Password} = '${password}')`
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
    }).catch(err => {
      console.error("Error looking up clerk", err);
    });
  }

  // From SignUpScreen. Sign in function. It sets the user token in local storage
  // to be the fname + lname and then navigates to homescreen.
  _asyncSignin = async recordId => {
    await AsyncStorage.setItem("clerkId", recordId);
    await AsyncStorage.setItem("storeId", this.state.storeId);
    this.props.navigation.navigate("CustomerPhoneNumberScreen");
    // this.props.navigation.navigate("ClerkLoginScreen");
  };

  // This function will sign the user in if the clerk is found.
  async handleSubmit() {
    await BASE("Stores")
      .find(this.state.storeId)
      .then(storeRecord => {
        if (storeRecord) {
          let name = storeRecord["fields"]["Store Name"];
          this.setState({ storeName: name });
        }
      });
    await this.lookupClerk(this.state.storeName, this.state.password)
      .then(resp => {
        if (resp) {
          const recordId = resp;
          this._asyncSignin(recordId);
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ storeName: this.state.stores[0], password: "" });
      });
  }

  render() {
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Picker
          style={{ flex: 1 }}
          mode="dropdown"
          onValueChange={store => this.setState({ storeId: store })}
          selectedValue={this.state.storeId}
        >
          {this.state.stores.map((item, index) => {
            return (
              <Picker.Item
                label={item["name"]}
                value={item["id"]}
                key={index}
              />
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
