import { FontAwesome5 } from '@expo/vector-icons';
import * as Analytics from 'expo-firebase-analytics';
import PropTypes from 'prop-types';
import React from 'react';
import { AsyncStorage, View } from 'react-native';
import * as Sentry from 'sentry-expo';
import BackButton from '../components/BackButton';
import { ButtonLabel, RoundedButtonContainer, Subhead, Title } from '../components/BaseComponents';
import DismissKeyboard from '../components/DismissKeyboard';
import Colors from '../constants/Colors';
import { status } from '../lib/constants';
import { lookupClerk } from '../lib/loginUtils';
import { logAuthErrorToSentry, logErrorToSentry } from '../lib/logUtils';
import { CheckInContainer, CheckInContentContainer, TextField } from '../styled/checkin';
import { RowContainer } from '../styled/shared';

export default class ClerkLoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      errorMsg: null,
      errorShown: false,
    };
  }

  componentDidMount() {
    this._reset();
  }

  _reset = () => {
    this.setState({ password: '', errorMsg: null });
  };

  // Set the clerkId and storeId in AsyncStorage
  // Then navigate to the customer lookup screen
  _asyncLoginClerk = async (clerkRecord) => {
    const { navigation } = this.props;
    await AsyncStorage.setItem('clerkId', clerkRecord.id);
    await AsyncStorage.setItem('clerkName', clerkRecord.clerkName);
    await AsyncStorage.setItem('storeId', this.props.route.params.store.id);
    navigation.navigate('App');
  };

  // This function will sign the user in if the clerk is found.
  handleSubmit = async () => {
    try {
      // Uses the `Store ID` lookup in AirTable
      // eslint-disable-next-line react/no-access-state-in-setstate
      const lookupResult = await lookupClerk(this.props.route.params.store.id, this.state.password);

      let clerkRecord = null;
      let clerkNotFound = true;

      if (lookupResult.status === status.MATCH) {
        clerkNotFound = false;
        clerkRecord = lookupResult.record;
        await this._asyncLoginClerk(clerkRecord);
        this.props.navigation.navigate('App');
      }

      // Check for errors to log to Sentry; otherwise, register the user for further Sentry logging
      if (lookupResult.errorMsg !== '') {
        logAuthErrorToSentry({
          screen: 'ClerkLoginScreen',
          action: 'handleSubmit',
          attemptedStoreName: lookupResult.storeName,
          attemptedPin: this.state.password,
          error: lookupResult.status,
        });
        console.log(lookupResult.errorMsg);
      } else {
        Analytics.setUserId(clerkRecord.id);
        Analytics.setUserProperties({
          clerk_name: clerkRecord.clerkName,
          store: clerkRecord.storeName[0],
        });
        Analytics.logEvent('ClerkLogin', {
          name: 'Successful Clerk login',
          function: 'handleSubmit',
          component: 'ClerkLoginScreen',
          clerk_id: clerkRecord.id,
          clerk_name: clerkRecord.clerkName,
          store_name: clerkRecord.storeName[0],
        });
        Sentry.configureScope((scope) => {
          scope.setUser({
            id: clerkRecord.id,
            username: clerkRecord.clerkName,
          });
        });
      }

      // TODO reset state using onFocusEffect; this can cause memory leaks
      this.setState({ errorMsg: lookupResult.errorMsg, password: '', errorShown: clerkNotFound });
    } catch (err) {
      logErrorToSentry({
        screen: 'ClerkLoginScreen',
        action: 'handleSubmit',
        error: err,
      });
      console.error('Clerk Login Screen:', err);
    }
  };

  render() {
    const { store } = this.props.route.params;
    const loginPermission = this.state.password.length === 4;
    return (
      <DismissKeyboard>
        <View>
          {/* zIndex 1 used to bring BackButton forward without being caught by the KeyboardAvoiding content container */}
          <BackButton
            style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, marginTop: 33, marginLeft: 29 }}
            navigation={this.props.navigation}
            light
          />
          <CheckInContainer>
            <CheckInContentContainer>
              <Title style={{ marginBottom: 32 }} color={Colors.lightest}>
                {`Welcome to ${store.storeName}!`}
              </Title>
              <Title color={Colors.lightest}>Enter your employee PIN</Title>
              <TextField
                autoFocus
                clearButtonMode="always"
                style={{ marginTop: 32 }}
                error={this.state.errorShown}
                selectionColor={Colors.primaryGreen}
                placeholder="ex. 1234"
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={(text) => this.setState({ password: text, errorShown: false })}
                value={this.state.password}
              />
              {/* Display error message or empty row to maintain consistent spacing. */}
              {this.state.errorShown ? (
                <RowContainer style={{ alignItems: 'center', marginTop: 8, height: 28 }}>
                  <FontAwesome5 name="exclamation-circle" size={16} color={Colors.error} style={{ marginRight: 8 }} />
                  <Subhead color={Colors.lightest}>{this.state.errorMsg}</Subhead>
                </RowContainer>
              ) : (
                <RowContainer style={{ marginTop: 8, height: 28 }} />
              )}
              <RoundedButtonContainer
                style={{ marginTop: 32 }}
                color={loginPermission ? Colors.primaryGreen : Colors.lightestGreen}
                width="253px"
                height="40px"
                onPress={() => this.handleSubmit()}
                disabled={!loginPermission}>
                <ButtonLabel color={Colors.lightest}>Next</ButtonLabel>
              </RoundedButtonContainer>
            </CheckInContentContainer>
          </CheckInContainer>
        </View>
      </DismissKeyboard>
    );
  }
}

ClerkLoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};
