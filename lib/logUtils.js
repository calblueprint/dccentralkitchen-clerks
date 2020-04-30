import * as Sentry from 'sentry-expo';

export function logErrorToSentry(errorObject) {
  const { screen, action, error } = errorObject;
  Sentry.withScope((scope) => {
    scope.setExtra('screen', screen);
    scope.setExtra('action', action);
    Sentry.captureException(error);
  });
}

export function logAuthErrorToSentry(errorObject) {
  const { screen, action, attemptedStoreName, attemptedPin, error } = errorObject;
  Sentry.withScope((scope) => {
    scope.setExtra('screen', screen);
    scope.setExtra('action', action);
    scope.setExtra('attemptedStoreName', attemptedStoreName);
    scope.setExtra('attemptedPin', attemptedPin);
    Sentry.captureException(error);
  });
}
