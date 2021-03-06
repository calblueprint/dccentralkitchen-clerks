import { FontAwesome5 } from '@expo/vector-icons';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import * as Sentry from 'sentry-expo';
import Colors from './constants/Colors';
import { isTablet } from './constants/Layout';
import { env } from './environment';
import AppNavigator from './navigation/AppNavigator';

Sentry.init({
  dsn: 'https://9b39ef5b02394775a6e939254ed55a0e@o306199.ingest.sentry.io/4525076',
  enableInExpoDevelopment: false,
  debug: false,
  environment: env,
});

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    if (!isTablet) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  }
  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
      <AppNavigator />
    </View>
  );
}

async function loadResourcesAsync() {
  await Promise.all([
    Font.loadAsync({
      // This is the icon style we use
      ...FontAwesome5.font,
      // Open Sans is the custom font used across the application
      'opensans-regular': require('./assets/fonts/OpenSans-Regular.ttf'),
      'opensans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
      'opensans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    }),
  ]);
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
});
