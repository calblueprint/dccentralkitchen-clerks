import React from "react";
import {
  AsyncStorage,
  Button,
  Picker,
  View,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";

import { BASE } from "../lib/common";
import { styles, TextInputClerkLogin, ButtonClerkLogin } from "../styles";

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

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

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

  // Sets the clerk and store ids in AsyncStorage and navigates to the customer phone number screen.
  _asyncLoginClerk = async recordId => {
    await AsyncStorage.setItem("clerkId", recordId);
    await AsyncStorage.setItem("storeId", this.state.storeId);
    this.props.navigation.navigate("CustomerPhoneNumberScreen");
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
      })
      .catch(err => {
        console.error("Error retrieving store record from Airtable", err);
      });
    await this.lookupClerk(this.state.storeName, this.state.password)
      .then(resp => {
        if (resp) {
          const recordId = resp;
          this._asyncLoginClerk(recordId);
        }
      })
      .catch(err => {
        console.error("Error submitting form", err);
      });
  }

  render() {
    return (
      <DismissKeyboard>
        <View style={styles.container}>
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
          <TextInputClerkLogin
            style={styles.input}
            placeholder="Password"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={true}
            onChangeText={text => this.setState({ password: text })}
            value={this.state.password}
          />
          <Button
            style={styles.button}
            title="Log In"
            onPress={() => this.handleSubmit()}
          />
        </View>
      </DismissKeyboard>
    );
  }
}
