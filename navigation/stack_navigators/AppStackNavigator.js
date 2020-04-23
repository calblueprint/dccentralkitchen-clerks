import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Colors from '../../constants/Colors';
import CheckoutScreen from '../../screens/CheckoutScreen';
import ConfirmationScreen from '../../screens/ConfirmationScreen';
import CustomerLookupScreen from '../../screens/CustomerLookupScreen';

const AppStack = createStackNavigator();

export default function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.lightest },
        drawerLabel: 'App',
        gestureEnabled: false,
      }}>
      <AppStack.Screen name="CustomerLookup" component={CustomerLookupScreen} />
      <AppStack.Screen name="Checkout" component={CheckoutScreen} />
      <AppStack.Screen name="Confirmation" component={ConfirmationScreen} />
    </AppStack.Navigator>
  );
}
