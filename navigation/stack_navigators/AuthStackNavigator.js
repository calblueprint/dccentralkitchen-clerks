import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ClerkLoginScreen from '../../screens/ClerkLoginScreen';
import StoreLookupScreen from '../../screens/StoreLookupScreen';

const AuthStack = createStackNavigator();

export default function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <AuthStack.Screen name="StoreLookup" component={StoreLookupScreen} />
      <AuthStack.Screen name="ClerkLogin" component={ClerkLoginScreen} />
    </AuthStack.Navigator>
  );
}
