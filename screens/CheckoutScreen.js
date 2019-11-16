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

export default class CheckoutScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customerName: "",
      customerId: 0,
      currPoints: 0,
      cart: [],
      totalPrice: 0,
      totalPoints: 0
    };
  }

  async componentDidMount() {
    const customerId = await AsyncStorage.getItem("customerId");
    this.setState({ customerId: customerId });

    this.getUser("Customers", customerId).then(customerRecord => {
      if (customerRecord) {
        let currPoints = customerRecord["fields"]["points"];
        let name =
          customerRecord["fields"]["First Name"] +
          " " +
          customerRecord["fields"]["Last Name"];
        this.setState({ customerName: name, currPoints: currPoints });
      }
    });
  }

  async getUser(table, id) {
    return BASE(table).find(id);
  }

  updateCustomerPoints() {
    BASE("Customers").update(
      [
        {
          id: this.state.customerId,
          fields: {
            points: this.state.currPoints
          }
        },
        {
          id: this.state.customerId,
          fields: {
            points: this.state.totalPoints
          }
        }
      ],
      function(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput style={styles.text}>
          Customer: {this.state.customerName}
        </TextInput>
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
