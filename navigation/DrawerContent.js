import AsyncStorage from '@react-native-community/async-storage';
import * as Analytics from 'expo-firebase-analytics';
import * as Linking from 'expo-linking';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import * as Sentry from 'sentry-expo';
import { ButtonContainer, Title } from '../components/BaseComponents';
import Colors from '../constants/Colors';

class DrawerContent extends React.Component {
  constructor(props) {
    super(props);
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
    Analytics.logEvent('ClerkLogOut', {
      name: 'Log out',
      function: '_logout',
      component: 'DrawerContent',
    });
    Sentry.configureScope((scope) => scope.clear());
    Analytics.setUserId(null);
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
            backgroundColor: Colors.bgDark,
            height: 114,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: 16,
          }}>
          <Title style={{ color: Colors.lightText }}>{this.state.clerkName}</Title>
        </View>
        <ButtonContainer
          style={{ padding: 16, paddingTop: 32 }}
          onPress={() => this.props.navigation.navigate('RegisterCustomer')}>
          <Title>Register a Customer</Title>
        </ButtonContainer>
        <ButtonContainer style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/ClerkGuide')}>
          <Title>Clerk Guide</Title>
        </ButtonContainer>
        <ButtonContainer style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/SubmitFeedbackClerk')}>
          <Title>Feedback</Title>
        </ButtonContainer>
        <ButtonContainer style={{ padding: 16 }} onPress={() => Linking.openURL('http://tiny.cc/ClerkFeedback')}>
          <Title>Report Issue</Title>
        </ButtonContainer>

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            verticalAlign: 'bottom',
          }}>
          <ButtonContainer style={{ paddingLeft: 16, paddingBottom: 21 }} onPress={() => this._logout()}>
            <Title>Log Out</Title>
          </ButtonContainer>
        </View>
      </View>
    );
  }
}

DrawerContent.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default DrawerContent;
