import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";

import MainTabNavigator from "./MainTabNavigator";
import CustomerPhoneNumberScreen from "../screens/CustomerPhoneNumberScreen";
import ClerkProductsScreen from "../screens/ClerkProductsScreen";

export default createAppContainer(
  createSwitchNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainTabNavigator,
    CustomerPhoneNumberScreen: CustomerPhoneNumberScreen,
    ClerkProductsScreen: ClerkProductsScreen
  })
);
