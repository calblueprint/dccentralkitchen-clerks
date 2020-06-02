import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Colors from '../../constants/Colors';
import CheckoutScreen from '../../screens/CheckoutScreen';
import ConfirmationScreen from '../../screens/ConfirmationScreen';
import CustomerLookupScreen from '../../screens/CustomerLookupScreen';
import RegisterCustomerScreen from '../../screens/RegisterCustomerScreen';

const AppStack = createStackNavigator();

export default function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.bgLight },
        drawerLabel: 'App',
        gestureEnabled: false,
      }}>
      <AppStack.Screen name="CustomerLookup" component={CustomerLookupScreen} />
      <AppStack.Screen name="Checkout" component={CheckoutScreen} />
      <AppStack.Screen name="Confirmation" component={ConfirmationScreen} />
      <AppStack.Screen
        name="RegisterCustomer"
        component={RegisterCustomerScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
    </AppStack.Navigator>
  );
}
