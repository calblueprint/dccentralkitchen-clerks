import React from 'react';
import { AsyncStorage, Linking, TouchableOpacity, View } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import Colors from '../assets/Colors';
import { Title } from '../components/BaseComponents';
import CheckoutScreen from '../screens/CheckoutScreen';
import ClerkLoginScreen from '../screens/ClerkLoginScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import CustomerLookupScreen from '../screens/CustomerLookupScreen';
import StoreLookupScreen from '../screens/StoreLookupScreen';

export const AuthStack = createStackNavigator(
  {
    StoreLookup: StoreLookupScreen,
    ClerkLogin: ClerkLoginScreen,
  },
  { headerMode: 'none', navigationOptions: { header: null } }
);

export const AppStack = createStackNavigator({
  Auth: AuthStack,
  CustomerLookup: { screen: CustomerLookupScreen, navigationOptions: { header: null } },
  Checkout: { screen: CheckoutScreen, navigationOptions: { header: null } },
  Confirmation: { screen: ConfirmationScreen, navigationOptions: { header: null } },
});

AppStack.navigationOptions = {
  drawerLabel: 'App',
};

export class DrawerContent extends React.Component {
  constructor() {
    super();
    this.state = {
      clerkName: '',
    };
  }

  async componentDidMount() {
    const clerkName = await AsyncStorage.getItem('clerkName');
    this.setState({ clerkName });
  }

  _logout = async () => {
    AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };

  render() {
    return (
      <View
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
        }}>
        <View
          style={{
            backgroundColor: Colors.black,
            height: 114,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: 16,
          }}>
          <Title style={{ color: 'white' }}>{this.state.clerkName}</Title>
        </View>
        <TouchableOpacity
          style={{ padding: 16, paddingTop: 32 }}
          onPress={() => Linking.openURL('http://tiny.cc/RegisterACustomer')}>
          <Title>Register Customer</Title>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/ClerkGuide')}>
          <Title>Clerk Guide</Title>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/SubmitFeedbackClerk')}>
          <Title>Feedback</Title>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/ClerkFeedback')}>
          <Title>Report Issue</Title>
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            verticalAlign: 'bottom',
          }}>
          <TouchableOpacity style={{ paddingLeft: 16, paddingBottom: 21 }} onPress={() => this._logout()}>
            <Title>Logout</Title>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export const MyDrawerNavigator = createDrawerNavigator(
  {
    App: {
      screen: AppStack,
      navigationOptions: () => ({
        title: 'App',
      }),
    },
  },
  {
    drawerWidth: 343,
    contentComponent: DrawerContent,
  }
);

export default createAppContainer(
  createSwitchNavigator(
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    {
      Auth: AuthStack,
      App: {
        screen: MyDrawerNavigator,
        navigationOptions: { header: null },
      },
    },
    {
      initialRouteName: 'Auth',
    }
  )
);
