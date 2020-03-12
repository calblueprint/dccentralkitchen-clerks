import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import TabBarIcon from '../components/TabBarIcon';
import ClerkLoginScreen from '../screens/ClerkLoginScreen';
import StoreLookupScreen from '../screens/StoreLookupScreen';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {}
});

const HomeStack = createStackNavigator(
  {
    StoreLookup: StoreLookupScreen,
    ClerkLogin: ClerkLoginScreen
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: 'Login',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'}
    />
  )
};

HomeStack.path = '';

const tabNavigator = createBottomTabNavigator({
  HomeStack
});

tabNavigator.path = '';

export default tabNavigator;
