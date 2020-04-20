import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Colors from '../constants/Colors';
import DrawerContent from './DrawerContent';
import AppStackNavigator from './stack_navigators/AppStackNavigator';
import AuthStackNavigator from './stack_navigators/AuthStackNavigator';

const Drawer = createDrawerNavigator();

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
  return (
    <NavigationContainer>
      <AppContainerStack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: Colors.lightest } }}>
        <AppContainerStack.Screen name="App" component={DrawerNavigator} />
        <AppContainerStack.Screen name="Auth" component={AuthStackNavigator} />
      </AppContainerStack.Navigator>
    </NavigationContainer>
  );
}
