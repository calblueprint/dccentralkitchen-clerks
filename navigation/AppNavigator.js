import React from "react";
import { createAppContainer, createStackNavigator } from "react-navigation";

import ClerkProductsScreen from "../screens/ClerkProductsScreen";
import CustomerPhoneNumberScreen from "../screens/CustomerPhoneNumberScreen";
import MainTabNavigator from "./MainTabNavigator";

export default createAppContainer(
  createStackNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: { screen: MainTabNavigator },
    CustomerPhoneNumberScreen: { screen: CustomerPhoneNumberScreen },
    ClerkProductsScreen: { screen: ClerkProductsScreen }
  })
);
