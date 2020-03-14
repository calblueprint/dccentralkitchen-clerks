import { createAppContainer, createStackNavigator } from 'react-navigation';
import CheckoutScreen from '../screens/CheckoutScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import CustomerLookupScreen from '../screens/CustomerLookupScreen';
import MainTabNavigator from './MainTabNavigator';

export default createAppContainer(
  createStackNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: { screen: MainTabNavigator },
    CustomerLookup: { screen: CustomerLookupScreen },
    Checkout: { screen: CheckoutScreen },
    Confirmation: { screen: ConfirmationScreen }
  })
);
