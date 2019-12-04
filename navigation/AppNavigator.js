import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";

import ClerkProductsScreen from "../screens/ClerkProductsScreen";
import CustomerPhoneNumberScreen from "../screens/CustomerPhoneNumberScreen";
import MainTabNavigator from "./MainTabNavigator";

export default createAppContainer(
  // TODO: Figure out whether to change this to StackNavigator.
  createSwitchNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainTabNavigator,
    CustomerPhoneNumberScreen: CustomerPhoneNumberScreen,
    CheckoutScreen: CheckoutScreen,
    ClerkProductsScreen: ClerkProductsScreen
  })
);
