import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Analytics from 'expo-firebase-analytics';
import React from 'react';
import Colors from '../constants/Colors';
import DrawerContent from './DrawerContent';
import AppStackNavigator from './stack_navigators/AppStackNavigator';
import AuthStackNavigator from './stack_navigators/AuthStackNavigator';

const Drawer = createDrawerNavigator();

const getActiveRouteName = (state) => {
  const route = state.routes[state.index];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

function DrawerNavigator() {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />} drawerStyle={{ width: 343 }}>
      <Drawer.Screen name="App" component={AppStackNavigator} />
    </Drawer.Navigator>
  );
}

const AppContainerStack = createStackNavigator();

export default function createAppContainer() {
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef();

  React.useEffect(() => {
    const state = navigationRef.current.getRootState();

    // Save the initial route name
    routeNameRef.current = getActiveRouteName(state);
  }, []);
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = getActiveRouteName(state);
        if (previousRouteName !== currentRouteName) {
          Analytics.setCurrentScreen(currentRouteName);
        }
        routeNameRef.current = currentRouteName;
      }}>
      <AppContainerStack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: Colors.lightest }, gestureEnabled: false }}>
        <AppContainerStack.Screen name="App" component={DrawerNavigator} />
        <AppContainerStack.Screen name="Auth" component={AuthStackNavigator} />
      </AppContainerStack.Navigator>
    </NavigationContainer>
  );
}
