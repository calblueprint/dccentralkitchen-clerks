import { FontAwesome5 } from '@expo/vector-icons';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import * as Sentry from 'sentry-expo';
import Colors from './constants/Colors';
import { env } from './environment';
import AppNavigator from './navigation/AppNavigator';
import { Container } from './styled/shared';

Sentry.init({
  dsn: 'https://9b39ef5b02394775a6e939254ed55a0e@o306199.ingest.sentry.io/4525076',
  enableInExpoDevelopment: false,
  debug: true,
  environment: env,
});

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  }
  return (
    <Container>
      {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
      <AppNavigator />
    </Container>
  );
}

async function loadResourcesAsync() {
  await Promise.all([
    Font.loadAsync({
      // This is the icon style we use
      ...FontAwesome5.font,
      // Poppins is the custom font used across the application
      'poppins-regular': require('./assets/fonts/Poppins-Regular.ttf'),
      'poppins-semibold': require('./assets/fonts/Poppins-SemiBold.ttf'),
      'poppins-medium': require('./assets/fonts/Poppins-Medium.ttf'),
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
