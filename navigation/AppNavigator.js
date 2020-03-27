import { createAppContainer, createStackNavigator } from 'react-navigation';
import CheckoutScreen from '../screens/CheckoutScreen';
import ClerkLoginScreen from '../screens/ClerkLoginScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import CustomerLookupScreen from '../screens/CustomerLookupScreen';
import StoreLookupScreen from '../screens/StoreLookupScreen';

const AuthStack = createStackNavigator(
  {
    StoreLookup: StoreLookupScreen,
    ClerkLogin: ClerkLoginScreen,
  },
  { headerMode: 'none' }
);

export default createAppContainer(
  createStackNavigator(
    {
      // You could add another route here for authentication.
      // Read more at https://reactnavigation.org/docs/en/auth-flow.html
      Auth: AuthStack,
      CustomerLookup: { screen: CustomerLookupScreen },
      Checkout: { screen: CheckoutScreen },
      Confirmation: { screen: ConfirmationScreen },
    },
    { headerMode: 'none' }
  )
);
